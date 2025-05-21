import { Router } from "express";
import SocialMediaService from "./services/socialMediaService";
import { TipoRedeSocial } from "@prisma/client"; // Importar o Enum

const router = Router();

// --- Contas de Redes Sociais ---
router.post("/contas-sociais", async (req, res) => {
  try {
    const { tipo, idUsuarioPlataforma, nomeUsuario, accessToken, refreshToken, expiresAt } = req.body;
    if (!tipo || !idUsuarioPlataforma || !nomeUsuario || !accessToken) {
      return res.status(400).json({ error: "Campos obrigatórios para conectar conta social não fornecidos (tipo, idUsuarioPlataforma, nomeUsuario, accessToken)" });
    }
    // Validar se o tipo é um valor válido do Enum TipoRedeSocial
    if (!Object.values(TipoRedeSocial).includes(tipo as TipoRedeSocial)) {
        return res.status(400).json({ error: `Tipo de rede social inválido: ${tipo}. Válidos são: ${Object.values(TipoRedeSocial).join(", ")}` });
    }
    const conta = await SocialMediaService.conectarContaRedeSocial(tipo as TipoRedeSocial, idUsuarioPlataforma, nomeUsuario, accessToken, refreshToken, expiresAt ? new Date(expiresAt) : undefined);
    res.status(201).json(conta);
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2002') { // Unique constraint failed
        res.status(409).json({ error: "Esta conta de rede social já está conectada.", details: e.message });
    } else {
        res.status(500).json({ error: "Erro ao conectar conta de rede social", details: e.message });
    }
  }
});

router.get("/contas-sociais", async (req, res) => {
  try {
    const contas = await SocialMediaService.obterContasRedeSocial();
    res.json(contas);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: "Erro ao obter contas de rede social", details: e.message });
  }
});

router.get("/contas-sociais/:id", async (req, res) => {
  try {
    const conta = await SocialMediaService.obterContaRedeSocialPorId(parseInt(req.params.id));
    if (!conta) return res.status(404).json({ error: "Conta de rede social não encontrada" });
    res.json(conta);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: "Erro ao obter conta de rede social", details: e.message });
  }
});

router.delete("/contas-sociais/:id", async (req, res) => {
  try {
    await SocialMediaService.desconectarContaRedeSocial(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2025') { // Record to delete does not exist
        res.status(404).json({ error: "Conta de rede social não encontrada para desconectar." });
    } else {
        res.status(500).json({ error: "Erro ao desconectar conta de rede social", details: e.message });
    }
  }
});

// --- Postagens em Redes Sociais ---
router.post("/postagens-sociais", async (req, res) => {
  try {
    const { contaRedeSocialId, textoConteudo, midiaUrl, linkExterno, dataAgendamento } = req.body;
    if (!contaRedeSocialId || !textoConteudo) {
      return res.status(400).json({ error: "contaRedeSocialId e textoConteudo são obrigatórios" });
    }
    const postagem = await SocialMediaService.criarPostagem(contaRedeSocialId, { textoConteudo, midiaUrl, linkExterno }, dataAgendamento);
    res.status(201).json(postagem);
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2003') { // Foreign key constraint failed (e.g., contaRedeSocialId does not exist)
        res.status(404).json({ error: "Conta de rede social não encontrada para criar a postagem.", details: e.message });
    } else {
        res.status(500).json({ error: "Erro ao criar postagem", details: e.message });
    }
  }
});

router.get("/postagens-sociais/conta/:contaId", async (req, res) => {
  try {
    const postagens = await SocialMediaService.obterPostagensPorConta(parseInt(req.params.contaId));
    res.json(postagens);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: "Erro ao obter postagens da conta", details: e.message });
  }
});

router.get("/postagens-sociais", async (req, res) => {
    try {
      const postagens = await SocialMediaService.obterTodasPostagens();
      res.json(postagens);
    } catch (error) {
      const e = error as Error;
      res.status(500).json({ error: "Erro ao obter todas as postagens", details: e.message });
    }
  });

router.get("/postagens-sociais/:id", async (req, res) => {
  try {
    const postagem = await SocialMediaService.obterPostagemPorId(parseInt(req.params.id));
    if (!postagem) return res.status(404).json({ error: "Postagem não encontrada" });
    res.json(postagem);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: "Erro ao obter postagem", details: e.message });
  }
});

router.put("/postagens-sociais/:id", async (req, res) => {
  try {
    const postagem = await SocialMediaService.atualizarPostagem(parseInt(req.params.id), req.body);
    if (!postagem) return res.status(404).json({ error: "Postagem não encontrada" });
    res.json(postagem);
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2025') {
        res.status(404).json({ error: "Postagem não encontrada para atualização." });
    } else {
        res.status(500).json({ error: "Erro ao atualizar postagem", details: e.message });
    }
  }
});

router.delete("/postagens-sociais/:id", async (req, res) => {
  try {
    await SocialMediaService.deletarPostagem(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2025') {
        res.status(404).json({ error: "Postagem não encontrada para deletar." });
    } else {
        res.status(500).json({ error: "Erro ao deletar postagem", details: e.message });
    }
  }
});

router.post("/postagens-sociais/:id/publicar", async (req, res) => {
  try {
    const postagem = await SocialMediaService.publicarPostagemAgendada(parseInt(req.params.id));
    if (!postagem) return res.status(404).json({ error: "Postagem não encontrada para publicar" });
    res.json({ message: "Publicação da postagem (simulada) processada.", postagem });
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: "Erro ao publicar postagem", details: e.message });
  }
});

// Rota para o agendador (para ser chamada por um cron job ou similar)
router.post("/scheduler/processar-postagens", async (req, res) => {
    try {
        // Adicionar alguma forma de autenticação/segurança para esta rota em um ambiente real
        console.log("Rota: /scheduler/processar-postagens chamada.");
        await SocialMediaService.processarPostagensAgendadas();
        res.status(200).json({ message: "Processamento de postagens agendadas (simulado) concluído." });
    } catch (error) {
        const e = error as Error;
        console.error("Erro na rota do scheduler:", e.message);
        res.status(500).json({ error: "Erro ao processar postagens agendadas", details: e.message });
    }
});

export default router;

