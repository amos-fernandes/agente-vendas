import { Router } from "express";
import VideoService from "./services/videoService";
import { TipoMediaAsset, StatusVideoGerado } from "@prisma/client";
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

// Configuração do Multer para simular upload de arquivos de mídia
// Em um app real, isso seria configurado para S3, GCS, etc.
const SIMULATED_UPLOAD_TEMP_DIR = path.join(__dirname, '..', '..', 'uploads', 'temp');

// Garantir que o diretório temporário de upload exista
fs.mkdir(SIMULATED_UPLOAD_TEMP_DIR, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, SIMULATED_UPLOAD_TEMP_DIR);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nome de arquivo único
    }
});
const upload = multer({ storage: storage });

// --- MediaAssets ---
router.post("/media-assets", upload.single('mediafile'), async (req, res) => {
  try {
    const { nome, tipo, formato } = req.body;
    if (!req.file) {
        return res.status(400).json({ error: "Arquivo de mídia (mediafile) é obrigatório." });
    }
    if (!nome || !tipo) {
      await fs.unlink(req.file.path); // Remover arquivo temporário se dados estiverem incompletos
      return res.status(400).json({ error: "Nome e tipo do asset são obrigatórios" });
    }
    if (!Object.values(TipoMediaAsset).includes(tipo as TipoMediaAsset)) {
        await fs.unlink(req.file.path);
        return res.status(400).json({ error: `Tipo de media asset inválido: ${tipo}. Válidos são: ${Object.values(TipoMediaAsset).join(", ")}` });
    }

    // Usar o req.file.path que é o caminho do arquivo salvo pelo multer
    const asset = await VideoService.criarMediaAsset(nome, tipo as TipoMediaAsset, req.file.path, formato || req.file.mimetype, req.file.size);
    
    // Opcional: remover o arquivo do diretório temporário se o serviço já o moveu/copiou para o destino final.
    // No nosso VideoService.criarMediaAsset simulado, ele não move, apenas usa o nome.
    // Se o serviço movesse, aqui poderíamos deletar req.file.path.
    // await fs.unlink(req.file.path); // Exemplo se o serviço movesse o arquivo

    res.status(201).json(asset);
  } catch (error) {
    const e = error as Error;
    if (req.file) await fs.unlink(req.file.path).catch(console.error); // Limpar em caso de erro
    res.status(500).json({ error: "Erro ao criar media asset", details: e.message });
  }
});

router.get("/media-assets", async (req, res) => {
  try {
    const assets = await VideoService.obterMediaAssets();
    res.json(assets);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: "Erro ao obter media assets", details: e.message });
  }
});

router.get("/media-assets/:id", async (req, res) => {
  try {
    const asset = await VideoService.obterMediaAssetPorId(parseInt(req.params.id));
    if (!asset) return res.status(404).json({ error: "Media asset não encontrado" });
    res.json(asset);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: "Erro ao obter media asset", details: e.message });
  }
});

router.delete("/media-assets/:id", async (req, res) => {
  try {
    await VideoService.deletarMediaAsset(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2025') {
        res.status(404).json({ error: "Media asset não encontrado para deletar." });
    } else {
        res.status(500).json({ error: "Erro ao deletar media asset", details: e.message });
    }
  }
});

// --- VideoTemplates ---
router.post("/video-templates", async (req, res) => {
  try {
    const { nome, descricao, duracaoSegundos, formato, estruturaJson, assetIds } = req.body;
    if (!nome) return res.status(400).json({ error: "Nome do template é obrigatório" });
    const template = await VideoService.criarVideoTemplate(nome, descricao, duracaoSegundos, formato, estruturaJson, assetIds);
    res.status(201).json(template);
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2002') {
        res.status(409).json({ error: "Já existe um template de vídeo com este nome." });
    } else {
        res.status(500).json({ error: "Erro ao criar video template", details: e.message });
    }
  }
});

router.get("/video-templates", async (req, res) => {
  try {
    const templates = await VideoService.obterVideoTemplates();
    res.json(templates);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: "Erro ao obter video templates", details: e.message });
  }
});

router.get("/video-templates/:id", async (req, res) => {
  try {
    const template = await VideoService.obterVideoTemplatePorId(parseInt(req.params.id));
    if (!template) return res.status(404).json({ error: "Video template não encontrado" });
    res.json(template);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: "Erro ao obter video template", details: e.message });
  }
});

router.put("/video-templates/:id", async (req, res) => {
  try {
    const template = await VideoService.atualizarVideoTemplate(parseInt(req.params.id), req.body);
    if (!template) return res.status(404).json({ error: "Video template não encontrado" });
    res.json(template);
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2025') {
        res.status(404).json({ error: "Template não encontrado para atualização." });
    } else if ((e as any).code === 'P2002') {
        res.status(409).json({ error: "Já existe um template de vídeo com este nome." });
    } else {
        res.status(500).json({ error: "Erro ao atualizar video template", details: e.message });
    }
  }
});

router.delete("/video-templates/:id", async (req, res) => {
  try {
    await VideoService.deletarVideoTemplate(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2025') {
        res.status(404).json({ error: "Template não encontrado para deletar." });
    } else {
        res.status(500).json({ error: "Erro ao deletar video template", details: e.message });
    }
  }
});

// --- VideosGerados ---
router.post("/videos-gerados", async (req, res) => {
  try {
    const { videoTemplateId, nomePersonalizado, dadosPersonalizacao, assetIds } = req.body;
    if (!videoTemplateId) return res.status(400).json({ error: "videoTemplateId é obrigatório" });
    const video = await VideoService.criarVideoGerado({ videoTemplateId, nomePersonalizado, dadosPersonalizacao, assetIds });
    res.status(202).json(video); // 202 Accepted pois o processamento é assíncrono
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2003') { // Foreign key constraint failed
        res.status(404).json({ error: "Template de vídeo ou Media Asset não encontrado.", details: e.message });
    } else {
        res.status(500).json({ error: "Erro ao criar video gerado", details: e.message });
    }
  }
});

router.get("/videos-gerados", async (req, res) => {
  try {
    const videos = await VideoService.obterVideosGerados();
    res.json(videos);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: "Erro ao obter videos gerados", details: e.message });
  }
});

router.get("/videos-gerados/:id", async (req, res) => {
  try {
    const video = await VideoService.obterVideoGeradoPorId(parseInt(req.params.id));
    if (!video) return res.status(404).json({ error: "Video gerado não encontrado" });
    res.json(video);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: "Erro ao obter video gerado", details: e.message });
  }
});

router.post("/videos-gerados/:id/retry", async (req, res) => {
    try {
        const videoId = parseInt(req.params.id);
        const video = await VideoService.obterVideoGeradoPorId(videoId);
        if (!video) return res.status(404).json({ error: "Video gerado não encontrado" });
        if (video.status !== StatusVideoGerado.FALHOU) {
            return res.status(400).json({ error: "Só é possível tentar novamente vídeos que falharam." });
        }
        await VideoService.simularProcessamentoVideo(videoId); // Re-dispara a simulação
        res.status(202).json({ message: "Nova tentativa de processamento do vídeo iniciada.", videoId });
    } catch (error) {
        const e = error as Error;
        res.status(500).json({ error: "Erro ao tentar reprocessar o vídeo", details: e.message });
    }
});

router.delete("/videos-gerados/:id", async (req, res) => {
  try {
    await VideoService.deletarVideoGerado(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2025') {
        res.status(404).json({ error: "Vídeo gerado não encontrado para deletar." });
    } else {
        res.status(500).json({ error: "Erro ao deletar video gerado", details: e.message });
    }
  }
});

export default router;

