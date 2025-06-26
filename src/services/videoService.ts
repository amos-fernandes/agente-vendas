import { PrismaClient, MediaAsset, VideoTemplate, VideoGerado, TipoMediaAsset, StatusVideoGerado } from "@prisma/client";
import path from "path";
import fs from "fs/promises";

const prisma = new PrismaClient();

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "media_assets");
const GENERATED_VIDEOS_DIR = path.join(__dirname, "..", "..", "generated_videos");

// Cria diretórios simulados
async function ensureDirs() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(GENERATED_VIDEOS_DIR, { recursive: true });
  } catch (error) {
    console.error("Erro ao criar diretórios:", error);
  }
}
ensureDirs().catch(console.error);

interface CreateVideoFromTemplateData {
  videoTemplateId: number;
  nomePersonalizado?: string;
  dadosPersonalizacao?: any;
  assetIds?: number[];
}

class VideoService {
  // --- MediaAsset ---
  async criarMediaAsset(
    nome: string,
    tipo: TipoMediaAsset,
    filePath: string,
    formato?: string,
    tamanhoBytes?: number
  ): Promise<MediaAsset> {
    const fileName = `${Date.now()}_${path.basename(filePath)}`;
    const destPath = path.join(UPLOAD_DIR, fileName);

    console.log(`Simulando upload: ${nome} para ${destPath}`);

    return prisma.mediaAsset.create({
      data: {
        nome,
        tipo,
        urlArmazenamento: `/uploads/media_assets/${fileName}`,
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
    if (!asset) return;

    if (asset.urlArmazenamento.startsWith("/uploads/media_assets/")) {
      const filePath = path.join(__dirname, "..", "..", asset.urlArmazenamento);
      try {
        // await fs.unlink(filePath);
        console.log(`Simulando deleção do arquivo: ${filePath}`);
      } catch (err) {
        console.warn(`Erro ao simular deleção do arquivo ${filePath}:`, err);
      }
    }

    await prisma.mediaAsset.delete({ where: { id } });
  }

  // --- VideoTemplate ---
  async criarVideoTemplate(
    nome: string,
    descricao?: string,
    duracaoSegundos?: number,
    formato?: string,
    estruturaJson?: any,
    assetIds?: number[]
  ): Promise<VideoTemplate> {
    return prisma.videoTemplate.create({
      data: {
        nome,
        descricao,
        duracaoSegundos,
        formato,
        estruturaJson,
        previewUrl: `/previews/template_${nome.replace(/\s+/g, "_").toLowerCase()}.mp4`,
        assets: assetIds ? { connect: assetIds.map((id) => ({ id })) } : undefined,
      },
    });
  }

  async obterVideoTemplates(): Promise<VideoTemplate[]> {
    return prisma.videoTemplate.findMany({
      include: { assets: true, _count: { select: { videosGerados: true } } },
    });
  }

  async obterVideoTemplatePorId(id: number): Promise<VideoTemplate | null> {
    return prisma.videoTemplate.findUnique({
      where: { id },
      include: { assets: true },
    });
  }

  async atualizarVideoTemplate(
    id: number,
    data: {
      nome?: string;
      descricao?: string;
      duracaoSegundos?: number;
      formato?: string;
      estruturaJson?: any;
      previewUrl?: string;
      assetIds?: number[];
    }
  ): Promise<VideoTemplate | null> {
    const { assetIds, ...restData } = data;
    // Remover id do objeto data, se existir
    if ('id' in restData) {
      delete (restData as any).id;
    }
    return prisma.videoTemplate.update({
      where: { id },
      data: {
        ...restData,
        assets: assetIds ? { set: assetIds.map((id) => ({ id })) } : undefined,
      },
      include: { assets: true },
    });
  }

  async deletarVideoTemplate(id: number): Promise<void> {
    await prisma.videoGerado.deleteMany({ where: { videoTemplateId: id } });
    await prisma.videoTemplate.delete({ where: { id } });
  }

  // --- VideoGerado ---
  async criarVideoGerado(data: CreateVideoFromTemplateData): Promise<VideoGerado> {
    const { videoTemplateId, nomePersonalizado, dadosPersonalizacao, assetIds } = data;

    const video = await prisma.videoGerado.create({
      data: {
        videoTemplateId,
        nomePersonalizado,
        dadosPersonalizacao,
        status: StatusVideoGerado.PENDENTE,
        assetsUsados: assetIds ? { connect: assetIds.map((id) => ({ id })) } : undefined,
      },
    });

    this.simularProcessamentoVideo(video.id).catch(console.error);
    return video;
  }

  async simularProcessamentoVideo(videoId: number): Promise<void> {
    console.log(`Simulando processamento do vídeo ID: ${videoId}`);

    await prisma.videoGerado.update({
      where: { id: videoId },
      data: {
        status: StatusVideoGerado.PROCESSANDO,
        logProcessamento: "Iniciando processamento...\n",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 5000));

    const sucesso = Math.random() > 0.15;

    if (sucesso) {
      const videoFileName = `video_gerado_${videoId}_${Date.now()}.mp4`;
      const videoUrlSimulada = `/generated_videos/${videoFileName}`;
      console.log(`Vídeo gerado com sucesso: ${videoFileName}`);

      const videoAtual = await prisma.videoGerado.findUnique({ where: { id: videoId } });

      await prisma.videoGerado.update({
        where: { id: videoId },
        data: {
          status: StatusVideoGerado.CONCLUIDO,
          urlVideoFinal: videoUrlSimulada,
          logProcessamento: (videoAtual?.logProcessamento || "") + `Processamento concluído. Vídeo: ${videoUrlSimulada}\n`,
        },
      });
    } else {
      console.log(`Falha ao gerar vídeo ID: ${videoId}`);
      const videoAtual = await prisma.videoGerado.findUnique({ where: { id: videoId } });

      await prisma.videoGerado.update({
        where: { id: videoId },
        data: {
          status: StatusVideoGerado.FALHOU,
          logProcessamento: (videoAtual?.logProcessamento || "") + "Falha durante o processamento.\n",
        },
      });
    }
  }

  async obterVideosGerados(): Promise<VideoGerado[]> {
    return prisma.videoGerado.findMany({
      include: { videoTemplate: true, assetsUsados: true },
      orderBy: { dataCriacao: "desc" },
    });
  }

  async obterVideoGeradoPorId(id: number): Promise<VideoGerado | null> {
    return prisma.videoGerado.findUnique({
      where: { id },
      include: { videoTemplate: true, assetsUsados: true },
    });
  }

  async deletarVideoGerado(id: number): Promise<void> {
    const video = await prisma.videoGerado.findUnique({ where: { id } });
    if (!video) return;

    if (video.urlVideoFinal?.startsWith("/generated_videos/")) {
      const filePath = path.join(__dirname, "..", "..", video.urlVideoFinal);
      try {
        // await fs.unlink(filePath);
        console.log(`Simulando deleção do vídeo: ${filePath}`);
      } catch (err) {
        console.warn(`Erro ao deletar vídeo simulado ${filePath}:`, err);
      }
    }

    await prisma.videoGerado.delete({ where: { id } });
  }
}

export default new VideoService();
