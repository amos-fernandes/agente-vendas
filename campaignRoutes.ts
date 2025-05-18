import { Router } from 'express';
import CampaignService from './services/campaignService';

const router = Router();

// --- Listas de E-mail ---
router.post('/listas-email', async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome da lista é obrigatório' });
    const lista = await CampaignService.criarListaEmail(nome, descricao);
    res.status(201).json(lista);
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2002' && (e as any).meta?.target?.includes('nome')) {
        res.status(409).json({ error: 'Já existe uma lista de e-mail com este nome.' });
    } else {
        res.status(500).json({ error: 'Erro ao criar lista de e-mail', details: e.message });
    }
  }
});

router.get('/listas-email', async (req, res) => {
  try {
    const listas = await CampaignService.obterListasEmail();
    res.json(listas);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao obter listas de e-mail', details: e.message });
  }
});

router.get('/listas-email/:id', async (req, res) => {
  try {
    const lista = await CampaignService.obterListaEmailPorId(parseInt(req.params.id));
    if (!lista) return res.status(404).json({ error: 'Lista de e-mail não encontrada' });
    res.json(lista);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao obter lista de e-mail', details: e.message });
  }
});

router.put('/listas-email/:id', async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const lista = await CampaignService.atualizarListaEmail(parseInt(req.params.id), nome, descricao);
    if (!lista) return res.status(404).json({ error: 'Lista de e-mail não encontrada' });
    res.json(lista);
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2002' && (e as any).meta?.target?.includes('nome')) {
        res.status(409).json({ error: 'Já existe uma lista de e-mail com este nome.' });
    } else if ((e as any).code === 'P2025') {
        res.status(404).json({ error: 'Lista de e-mail não encontrada para atualização.' });
    } else {
        res.status(500).json({ error: 'Erro ao atualizar lista de e-mail', details: e.message });
    }
  }
});

router.delete('/listas-email/:id', async (req, res) => {
  try {
    await CampaignService.deletarListaEmail(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    const e = error as Error;
     if ((e as any).code === 'P2025') {
        res.status(404).json({ error: 'Lista de e-mail não encontrada para deletar.' });
    } else {
        res.status(500).json({ error: 'Erro ao deletar lista de e-mail', details: e.message });
    }
  }
});

router.post('/listas-email/:listaId/contatos/:contatoId', async (req, res) => {
  try {
    const lista = await CampaignService.adicionarContatoNaLista(parseInt(req.params.listaId), parseInt(req.params.contatoId));
    if (!lista) return res.status(404).json({ error: 'Lista de e-mail ou contato não encontrado' });
    res.json(lista);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao adicionar contato na lista', details: e.message });
  }
});

router.delete('/listas-email/:listaId/contatos/:contatoId', async (req, res) => {
  try {
    const lista = await CampaignService.removerContatoDaLista(parseInt(req.params.listaId), parseInt(req.params.contatoId));
    if (!lista) return res.status(404).json({ error: 'Lista de e-mail ou contato não encontrado' });
    res.json(lista);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao remover contato da lista', details: e.message });
  }
});

// --- Templates de E-mail ---
router.post('/templates-email', async (req, res) => {
  try {
    const { nome, assuntoPadrao, corpoHtml, corpoTexto, tipo } = req.body;
    if (!nome || !corpoHtml) return res.status(400).json({ error: 'Nome e corpo HTML do template são obrigatórios' });
    const template = await CampaignService.criarTemplateEmail(nome, assuntoPadrao, corpoHtml, corpoTexto, tipo);
    res.status(201).json(template);
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2002' && (e as any).meta?.target?.includes('nome')) {
        res.status(409).json({ error: 'Já existe um template com este nome.' });
    } else {
        res.status(500).json({ error: 'Erro ao criar template de e-mail', details: e.message });
    }
  }
});

router.get('/templates-email', async (req, res) => {
  try {
    const templates = await CampaignService.obterTemplatesEmail();
    res.json(templates);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao obter templates de e-mail', details: e.message });
  }
});

router.get('/templates-email/:id', async (req, res) => {
  try {
    const template = await CampaignService.obterTemplateEmailPorId(parseInt(req.params.id));
    if (!template) return res.status(404).json({ error: 'Template de e-mail não encontrado' });
    res.json(template);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao obter template de e-mail', details: e.message });
  }
});

router.put('/templates-email/:id', async (req, res) => {
  try {
    const template = await CampaignService.atualizarTemplateEmail(parseInt(req.params.id), req.body);
    if (!template) return res.status(404).json({ error: 'Template de e-mail não encontrado' });
    res.json(template);
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2002' && (e as any).meta?.target?.includes('nome')) {
        res.status(409).json({ error: 'Já existe um template com este nome.' });
    } else if ((e as any).code === 'P2025') {
        res.status(404).json({ error: 'Template não encontrado para atualização.' });
    } else {
        res.status(500).json({ error: 'Erro ao atualizar template de e-mail', details: e.message });
    }
  }
});

router.delete('/templates-email/:id', async (req, res) => {
  try {
    await CampaignService.deletarTemplateEmail(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2025') {
        res.status(404).json({ error: 'Template não encontrado para deletar.' });
    } else {
        res.status(500).json({ error: 'Erro ao deletar template de e-mail', details: e.message });
    }
  }
});

// --- Campanhas de E-mail ---
router.post('/campanhas-email', async (req, res) => {
  try {
    const { nome, assunto, remetenteEmail, listaEmailId, templateEmailId, dataAgendamento, remetenteNome } = req.body;
    if (!nome || !assunto || !remetenteEmail || !listaEmailId || !templateEmailId) {
      return res.status(400).json({ error: 'Campos obrigatórios da campanha não fornecidos' });
    }
    const campanha = await CampaignService.criarCampanhaEmail({
      nome, assunto, remetenteNome, remetenteEmail, listaEmailId, templateEmailId, dataAgendamento
    });
    res.status(201).json(campanha);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao criar campanha de e-mail', details: e.message });
  }
});

router.get('/campanhas-email', async (req, res) => {
  try {
    const campanhas = await CampaignService.obterCampanhasEmail();
    res.json(campanhas);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao obter campanhas de e-mail', details: e.message });
  }
});

router.get('/campanhas-email/:id', async (req, res) => {
  try {
    const campanha = await CampaignService.obterCampanhaEmailPorId(parseInt(req.params.id));
    if (!campanha) return res.status(404).json({ error: 'Campanha de e-mail não encontrada' });
    res.json(campanha);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao obter campanha de e-mail', details: e.message });
  }
});

router.put('/campanhas-email/:id', async (req, res) => {
  try {
    const campanha = await CampaignService.atualizarCampanhaEmail(parseInt(req.params.id), req.body);
    if (!campanha) return res.status(404).json({ error: 'Campanha de e-mail não encontrada' });
    res.json(campanha);
  } catch (error) {
    const e = error as Error;
     if ((e as any).code === 'P2025') {
        res.status(404).json({ error: 'Campanha não encontrada para atualização.' });
    } else {
        res.status(500).json({ error: 'Erro ao atualizar campanha de e-mail', details: e.message });
    }
  }
});

router.delete('/campanhas-email/:id', async (req, res) => {
  try {
    await CampaignService.deletarCampanhaEmail(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2025') {
        res.status(404).json({ error: 'Campanha não encontrada para deletar.' });
    } else {
        res.status(500).json({ error: 'Erro ao deletar campanha de e-mail', details: e.message });
    }
  }
});

router.post('/campanhas-email/:id/enviar', async (req, res) => {
  try {
    const campanha = await CampaignService.enviarCampanha(parseInt(req.params.id));
    if (!campanha) return res.status(404).json({ error: 'Campanha de e-mail não encontrada para envio' });
    res.json({ message: 'Envio da campanha iniciado/concluído (simulado).', campanha });
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao enviar campanha de e-mail', details: e.message });
  }
});

export default router;

