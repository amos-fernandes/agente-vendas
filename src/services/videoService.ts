import { PrismaClient, MediaAsset, VideoTemplate, VideoGerado, TipoMediaAsset, StatusVideoGerado } from "@prisma/client";
import path from 'path';
import fs from 'fs/promises'; // Para simular salvamento de arquivo

const prisma = new PrismaClient();

// Diretório simulado para "uploads" e "gerados"
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'media_assets');
const GENERATED_VIDEOS_DIR = path.join(__dirname, '..', '..', 'generated_videos');

// Garantir que os diretórios existam
async function ensureDirs() {
    try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        await fs.mkdir(GENERATED_VIDEOS_DIR, { recursive: true });
    } catch (error) {
        console.error("Erro ao criar diretórios de simulação:", error);
    }
}
ensureDirs();

interface CreateVideoFromTemplateData {
  videoTemplateId: number;
  nomePersonalizado?: string;
  dadosPersonalizacao?: any; // JSON com { texto_overlay: "Promoção!", asset_id_imagem_fundo: 1, ... }
  assetIds?: number[]; // IDs de MediaAssets a serem associados diretamente
}

class VideoService {

  // --- Gerenciamento de MediaAssets ---
  async criarMediaAsset(nome: string, tipo: TipoMediaAsset, filePath: string /*caminho do arquivo simulado*/, formato?: string, tamanhoBytes?: number): Promise<MediaAsset> {
    // Simulação de upload: apenas copiamos para um diretório "uploads" e guardamos o caminho relativo
    const fileName = `${Date.now()}_${path.basename(filePath)}`;
    const destPath = path.join(UPLOAD_DIR, fileName);
    // Em um cenário real, aqui seria o upload para S3/GCS e obteria a URL.
    // Por agora, vamos simular que o arquivo foi "copiado" para destPath.
    // Para este exemplo, não vamos realmente copiar, apenas usar o nome do arquivo como urlArmazenamento.
    // Se fosse um upload real, fs.copyFile(filePath, destPath) seria usado.
    console.log(`Simulando upload do asset: ${nome} para ${destPath}`);
    
    return prisma.mediaAsset.create({
      data: {
        nome,
        tipo,
        urlArmazenamento: `/uploads/media_assets/${fileName}`, // URL simulada
        formato: formato || path.extname(filePath).substring(1),
        tamanhoBytes,
      },
    });
  }

  async obterMediaAssets(): Promise<MediaAsset[]> {
    return prisma.mediaAsset.findMany();
  }

  async obterMediaAssetPorId(id: number): Promise<MediaAsset | null> {
    return prisma.mediaAsset.findUnique({ where: { id } });
  }

  async deletarMediaAsset(id: number): Promise<void> {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (asset && asset.urlArmazenamento.startsWith('/uploads/media_assets/')) {
        // Simulação de deleção do arquivo físico
        const filePath = path.join(__dirname, '..', '..', asset.urlArmazenamento);
        try {
            // await fs.unlink(filePath); // Descomentar se os arquivos fossem realmente criados
            console.log(`Simulando deleção do arquivo físico: ${filePath}`);
        } catch (err) {
            console.warn(`Falha ao deletar arquivo físico simulado ${filePath}:`, err);
        }
    }
    await prisma.mediaAsset.delete({ where: { id } });
  }

  // --- Gerenciamento de VideoTemplates ---
  async criarVideoTemplate(nome: string, descricao?: string, duracaoSegundos?: number, formato?: string, estruturaJson?: any, assetIds?: number[]): Promise<VideoTemplate> {
    return prisma.videoTemplate.create({
      data: {
        nome,
        descricao,
        duracaoSegundos,
        formato,
        estruturaJson,
        previewUrl: `/previews/template_${nome.replace(/\s+/g, '_').toLowerCase()}.mp4`, // URL de preview simulada
        assets: assetIds ? { connect: assetIds.map(id => ({ id })) } : undefined,
      },
    });
  }

  async obterVideoTemplates(): Promise<VideoTemplate[]> {
    return prisma.videoTemplate.findMany({ include: { assets: true, _count: {select: { videosGerados: true}} } });
  }

  async obterVideoTemplatePorId(id: number): Promise<VideoTemplate | null> {
    return prisma.videoTemplate.findUnique({ where: { id }, include: { assets: true } });
  }

  async atualizarVideoTemplate(id: number, data: Partial<VideoTemplate> & { assetIds?: number[] }): Promise<VideoTemplate | null> {
    const { assetIds, ...restData } = data;
    return prisma.videoTemplate.update({
      where: { id },
      data: {
        ...restData,
        assets: assetIds ? { set: assetIds.map(id => ({ id })) } : undefined,
      },
    });
  }

  async deletarVideoTemplate(id: number): Promise<void> {
    await prisma.videoGerado.deleteMany({ where: { videoTemplateId: id }}); // Deletar vídeos gerados com este template
    await prisma.videoTemplate.delete({ where: { id } });
  }

  // --- Gerenciamento de VideosGerados ---
  async criarVideoGerado(data: CreateVideoFromTemplateData): Promise<VideoGerado> {
    const { videoTemplateId, nomePersonalizado, dadosPersonalizacao, assetIds } = data;
    const video = await prisma.videoGerado.create({
      data: {
        videoTemplateId,
        nomePersonalizado,
        dadosPersonalizacao,
        status: StatusVideoGerado.PENDENTE,
        assetsUsados: assetIds ? { connect: assetIds.map(id => ({ id })) } : undefined,
      },
    });

    // Simular início do processamento assíncrono
    this.simularProcessamentoVideo(video.id);
    return video;
  }

  async simularProcessamentoVideo(videoId: number): Promise<void> {
    console.log(`Iniciando simulação de processamento para o vídeo ID: ${videoId}`);
    await prisma.videoGerado.update({
      where: { id: videoId },
      data: { status: StatusVideoGerado.PROCESSANDO, logProcessamento: "Iniciando processamento...\n" },
    });

    // Simular tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 5000)); // 5-10 segundos

    const sucesso = Math.random() > 0.15; // 85% de chance de sucesso

    if (sucesso) {
      const videoFileName = `video_gerado_${videoId}_${Date.now()}.mp4`;
      const videoUrlSimulada = `/generated_videos/${videoFileName}`;
      // Simular criação do arquivo de vídeo
      // Em um cenário real, a ferramenta de vídeo geraria o arquivo e o salvaria.
      // await fs.writeFile(path.join(GENERATED_VIDEOS_DIR, videoFileName), "Conteúdo de vídeo simulado");
      console.log(`Simulação: Vídeo ${videoFileName} gerado com sucesso.`);

      await prisma.videoGerado.update({
        where: { id: videoId },
        data: {
          status: StatusVideoGerado.CONCLUIDO,
          urlVideoFinal: videoUrlSimulada,
          logProcessamento: { append: "Processamento concluído com sucesso. Vídeo disponível em: " + videoUrlSimulada + "\n"}
        },
      });
    } else {
      console.log(`Simulação: Falha ao gerar vídeo ID: ${videoId}`);
      await prisma.videoGerado.update({
        where: { id: videoId },
        data: {
          status: StatusVideoGerado.FALHOU,
          logProcessamento: { append: "Falha simulada durante o processamento do vídeo.\n"}
        },
      });
    }
  }

  async obterVideosGerados(): Promise<VideoGerado[]> {
    return prisma.videoGerado.findMany({ include: { videoTemplate: true, assetsUsados: true }, orderBy: { dataCriacao: 'desc'} });
  }

  async obterVideoGeradoPorId(id: number): Promise<VideoGerado | null> {
    return prisma.videoGerado.findUnique({ where: { id }, include: { videoTemplate: true, assetsUsados: true } });
  }

  async deletarVideoGerado(id: number): Promise<void> {
    const video = await prisma.videoGerado.findUnique({ where: { id } });
    if (video && video.urlVideoFinal && video.urlVideoFinal.startsWith('/generated_videos/')) {
        // Simulação de deleção do arquivo físico
        const filePath = path.join(__dirname, '..', '..', video.urlVideoFinal);
        try {
            // await fs.unlink(filePath); // Descomentar se os arquivos fossem realmente criados
            console.log(`Simulando deleção do arquivo de vídeo físico: ${filePath}`);
        } catch (err) {
            console.warn(`Falha ao deletar arquivo de vídeo físico simulado ${filePath}:`, err);
        }
    }
    await prisma.videoGerado.delete({ where: { id } });
  }
}

export default new VideoService();

