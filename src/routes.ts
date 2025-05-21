import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import LeadGenerationService from './services/leadGenerationService'; // Importar o serviço

const prisma = new PrismaClient();
const router = Router();

// --- Rotas para Empresas ---

// Criar nova empresa
router.post('/empresas', async (req, res) => {
  try {
    const novaEmpresa = await prisma.empresa.create({
      data: req.body,
    });
    res.status(201).json(novaEmpresa);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao criar empresa', details: e.message });
  }
});

// Listar todas as empresas
router.get('/empresas', async (req, res) => {
  try {
    const empresas = await prisma.empresa.findMany({
      include: { contatos: true },
    });
    res.json(empresas);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao listar empresas', details: e.message });
  }
});

// Obter empresa por ID
router.get('/empresas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: parseInt(id) },
      include: { contatos: true },
    });
    if (empresa) {
      res.json(empresa);
    } else {
      res.status(404).json({ error: 'Empresa não encontrada' });
    }
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao obter empresa', details: e.message });
  }
});

// Atualizar empresa
router.put('/empresas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const empresaAtualizada = await prisma.empresa.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(empresaAtualizada);
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2025') {
      res.status(404).json({ error: 'Empresa não encontrada para atualização' });
    } else {
      res.status(500).json({ error: 'Erro ao atualizar empresa', details: e.message });
    }
  }
});

// Deletar empresa
router.delete('/empresas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.contato.deleteMany({
      where: { empresaId: parseInt(id) },
    });
    await prisma.empresa.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2025') {
      res.status(404).json({ error: 'Empresa não encontrada para deletar' });
    } else {
      res.status(500).json({ error: 'Erro ao deletar empresa', details: e.message });
    }
  }
});

// Rota para buscar/identificar empresas (usando o serviço)
router.post('/empresas/identificar', async (req, res) => {
  const { termoBusca, setor, localizacao } = req.body;
  try {
    const empresasEncontradasApi = await LeadGenerationService.buscarEmpresas({ termoBusca, setor, localizacao });
    
    const empresasSalvas = [];
    for (const empApi of empresasEncontradasApi) {
      const empresa = await prisma.empresa.upsert({
        where: { nome: empApi.nome }, // Evitar duplicatas pelo nome
        update: { 
          setor: empApi.setor,
          localizacao: empApi.localizacao,
          numeroFuncionarios: empApi.numeroFuncionarios,
          website: empApi.website,
          fonteInformacao: 'API Externa (Simulada)',
        },
        create: {
          nome: empApi.nome,
          setor: empApi.setor,
          localizacao: empApi.localizacao,
          numeroFuncionarios: empApi.numeroFuncionarios,
          website: empApi.website,
          fonteInformacao: 'API Externa (Simulada)',
        },
      });
      empresasSalvas.push(empresa);
    }
    res.json({ message: 'Busca de empresas concluída.', resultados: empresasSalvas });
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao buscar e salvar empresas', details: e.message });
  }
});

// --- Rotas para Contatos ---

// Criar novo contato para uma empresa (manual)
router.post('/empresas/:empresaId/contatos', async (req, res) => {
  const { empresaId } = req.params;
  const { nome, cargo, departamento, email, telefone, fonteContato, statusEmail } = req.body;
  try {
    // Validar e-mail antes de criar
    const validacao = await LeadGenerationService.validarEmail(email);
    if (validacao.status === 'invalido') {
      return res.status(400).json({ error: 'E-mail inválido', details: validacao.details });
    }

    const novoContato = await prisma.contato.create({
      data: {
        nome,
        cargo,
        departamento,
        email,
        statusEmail: statusEmail || validacao.status, // Usa o status da validação
        telefone,
        fonteContato: fonteContato || 'Manual',
        empresa: {
          connect: { id: parseInt(empresaId) },
        },
      },
    });
    res.status(201).json(novoContato);
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2025' || (e as any).message?.includes('Foreign key constraint failed')) {
        res.status(404).json({ error: 'Empresa não encontrada para associar o contato.' });
    } else if ((e as any).code === 'P2002' && (e as any).meta?.target?.includes('email')) { // Erro de e-mail duplicado
        res.status(409).json({ error: 'E-mail já cadastrado para outro contato.' });
    } else {
        res.status(500).json({ error: 'Erro ao criar contato', details: e.message });
    }
  }
});

// Rota para extrair e salvar contatos para uma empresa (usando o serviço)
router.post('/empresas/:empresaId/extrair-contatos', async (req, res) => {
  const { empresaId } = req.params;
  try {
    const empresa = await prisma.empresa.findUnique({ where: { id: parseInt(empresaId) } });
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    const contatosApi = await LeadGenerationService.extrairEmailsPorEmpresa(empresa.nome, empresa.website || undefined);
    const contatosSalvos = [];

    for (const cApi of contatosApi) {
      const validacao = await LeadGenerationService.validarEmail(cApi.email);
      if (validacao.status === 'invalido') {
        console.log(`E-mail inválido descartado: ${cApi.email}`);
        continue; // Pula e-mails inválidos
      }
      try {
        const contato = await prisma.contato.upsert({
          where: { email: cApi.email }, // Evitar duplicatas pelo e-mail
          update: {
            nome: cApi.nome,
            cargo: cApi.cargo,
            departamento: cApi.departamento,
            telefone: cApi.telefone,
            statusEmail: validacao.status,
            empresaId: parseInt(empresaId), // Garante que está associado à empresa correta na atualização
            fonteContato: 'API Externa (Simulada)',
          },
          create: {
            nome: cApi.nome,
            cargo: cApi.cargo,
            departamento: cApi.departamento,
            email: cApi.email,
            telefone: cApi.telefone,
            statusEmail: validacao.status,
            empresaId: parseInt(empresaId),
            fonteContato: 'API Externa (Simulada)',
          },
        });
        contatosSalvos.push(contato);
      } catch (error) {
         // Tratar erro de e-mail duplicado que já existe para OUTRA empresa, ou outro erro de upsert
        const e = error as Error;
        if ((e as any).code === 'P2002' && (e as any).meta?.target?.includes('email')) {
            console.warn(`E-mail ${cApi.email} já existe e não pôde ser atualizado/associado para esta empresa. Pode pertencer a outro contato/empresa.`);
        } else {
            console.error(`Erro ao salvar contato ${cApi.email}:`, e.message);
        }
      }
    }
    res.json({ message: 'Extração de contatos concluída.', resultados: contatosSalvos });
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao extrair e salvar contatos', details: e.message });
  }
});


// Listar todos os contatos de uma empresa
router.get('/empresas/:empresaId/contatos', async (req, res) => {
  const { empresaId } = req.params;
  try {
    const contatos = await prisma.contato.findMany({
      where: { empresaId: parseInt(empresaId) },
    });
    res.json(contatos);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao listar contatos', details: e.message });
  }
});

// Obter contato por ID
router.get('/contatos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const contato = await prisma.contato.findUnique({
      where: { id: parseInt(id) },
    });
    if (contato) {
      res.json(contato);
    } else {
      res.status(404).json({ error: 'Contato não encontrado' });
    }
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao obter contato', details: e.message });
  }
});

// Atualizar contato
router.put('/contatos/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  try {
    if (email) {
        const validacao = await LeadGenerationService.validarEmail(email);
        if (validacao.status === 'invalido') {
            return res.status(400).json({ error: 'Novo e-mail inválido', details: validacao.details });
        }
        req.body.statusEmail = validacao.status; // Atualiza o status do e-mail
    }
    const contatoAtualizado = await prisma.contato.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(contatoAtualizado);
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2025') {
      res.status(404).json({ error: 'Contato não encontrado para atualização' });
    } else if ((e as any).code === 'P2002' && (e as any).meta?.target?.includes('email')) {
        res.status(409).json({ error: 'E-mail já cadastrado para outro contato.' });
    } else {
      res.status(500).json({ error: 'Erro ao atualizar contato', details: e.message });
    }
  }
});

// Deletar contato
router.delete('/contatos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.contato.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    const e = error as Error;
    if ((e as any).code === 'P2025') {
      res.status(404).json({ error: 'Contato não encontrado para deletar' });
    } else {
      res.status(500).json({ error: 'Erro ao deletar contato', details: e.message });
    }
  }
});

// Rota para validar um e-mail avulso (usando o serviço)
router.post('/validar-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório' });
  }
  try {
    const resultadoValidacao = await LeadGenerationService.validarEmail(email);
    res.json(resultadoValidacao);
  } catch (error) {
    const e = error as Error;
    res.status(500).json({ error: 'Erro ao validar e-mail', details: e.message });
  }
});

export default router;

