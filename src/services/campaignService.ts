import { PrismaClient, Contato, ListaEmail, TemplateEmail, CampanhaEmail, EnvioCampanha } from '@prisma/client';

const prisma = new PrismaClient();

// Interface para dados de criação de campanha
interface CreateCampanhaData {
  nome: string;
  assunto: string;
  remetenteNome?: string;
  remetenteEmail: string;
  listaEmailId: number;
  templateEmailId: number;
  dataAgendamento?: Date | string;
}

class CampaignService {

  // --- Gerenciamento de Listas de E-mail ---
  async criarListaEmail(nome: string, descricao?: string): Promise<ListaEmail> {
    return prisma.listaEmail.create({
      data: { nome, descricao },
    });
  }

  async obterListasEmail(): Promise<ListaEmail[]> {
    return prisma.listaEmail.findMany({ include: { _count: { select: { contatos: true } } } });
  }

  async obterListaEmailPorId(id: number): Promise<ListaEmail | null> {
    return prisma.listaEmail.findUnique({ 
      where: { id },
      include: { contatos: { select: { id: true, nome: true, email: true } } },
    });
  }

  async atualizarListaEmail(id: number, nome?: string, descricao?: string): Promise<ListaEmail | null> {
    return prisma.listaEmail.update({
      where: { id },
      data: { nome, descricao },
    });
  }

  async deletarListaEmail(id: number): Promise<void> {
    // Desassociar campanhas antes de deletar a lista ou definir onDelete Cascade no schema
    await prisma.campanhaEmail.updateMany({
        where: { listaEmailId: id },
        data: { listaEmailId: null as any }, // Ou impedir a deleção se houver campanhas associadas
    });
    await prisma.listaEmail.delete({ where: { id } });
  }

  async adicionarContatoNaLista(listaId: number, contatoId: number): Promise<ListaEmail | null> {
    return prisma.listaEmail.update({
      where: { id: listaId },
      data: {
        contatos: {
          connect: { id: contatoId },
        },
      },
    });
  }

  async removerContatoDaLista(listaId: number, contatoId: number): Promise<ListaEmail | null> {
    return prisma.listaEmail.update({
      where: { id: listaId },
      data: {
        contatos: {
          disconnect: { id: contatoId },
        },
      },
    });
  }

  // --- Gerenciamento de Templates de E-mail ---
  async criarTemplateEmail(nome: string, assuntoPadrao: string, corpoHtml: string, corpoTexto?: string, tipo?: string): Promise<TemplateEmail> {
    return prisma.templateEmail.create({
      data: { nome, assuntoPadrao, corpoHtml, corpoTexto, tipo },
    });
  }

  async obterTemplatesEmail(): Promise<TemplateEmail[]> {
    return prisma.templateEmail.findMany();
  }

  async obterTemplateEmailPorId(id: number): Promise<TemplateEmail | null> {
    return prisma.templateEmail.findUnique({ where: { id } });
  }

  async atualizarTemplateEmail(id: number, data: Partial<TemplateEmail>): Promise<TemplateEmail | null> {
    return prisma.templateEmail.update({
      where: { id },
      data,
    });
  }

  async deletarTemplateEmail(id: number): Promise<void> {
    // Desassociar campanhas ou impedir deleção
    await prisma.campanhaEmail.updateMany({
        where: { templateEmailId: id },
        data: { templateEmailId: null as any },
    });
    await prisma.templateEmail.delete({ where: { id } });
  }

  // --- Gerenciamento de Campanhas de E-mail ---
  async criarCampanhaEmail(data: CreateCampanhaData): Promise<CampanhaEmail> {
    return prisma.campanhaEmail.create({
      data: {
        ...data,
        status: data.dataAgendamento ? 'agendada' : 'rascunho',
        dataAgendamento: data.dataAgendamento ? new Date(data.dataAgendamento) : null,
      },
    });
  }

  async obterCampanhasEmail(): Promise<CampanhaEmail[]> {
    return prisma.campanhaEmail.findMany({ include: { listaEmail: true, templateEmail: true } });
  }

  async obterCampanhaEmailPorId(id: number): Promise<CampanhaEmail | null> {
    return prisma.campanhaEmail.findUnique({ 
        where: { id }, 
        include: { 
            listaEmail: { include: { contatos: true } }, 
            templateEmail: true,
            envios: true 
        }
    });
  }

  async atualizarCampanhaEmail(id: number, data: Partial<CreateCampanhaData & { status?: string }>): Promise<CampanhaEmail | null> {
    const updateData: any = { ...data };
    if (data.dataAgendamento) {
      updateData.dataAgendamento = new Date(data.dataAgendamento);
    }
    return prisma.campanhaEmail.update({
      where: { id },
      data: updateData,
    });
  }

  async deletarCampanhaEmail(id: number): Promise<void> {
    await prisma.envioCampanha.deleteMany({ where: { campanhaEmailId: id }});
    await prisma.campanhaEmail.delete({ where: { id } });
  }

  async enviarCampanha(campanhaId: number): Promise<CampanhaEmail | null> {
    const campanha = await prisma.campanhaEmail.findUnique({
      where: { id: campanhaId },
      include: { listaEmail: { include: { contatos: true } }, templateEmail: true },
    });

    if (!campanha || !campanha.listaEmail || !campanha.templateEmail) {
      throw new Error('Campanha, lista de e-mail ou template não encontrados.');
    }

    if (campanha.status === 'enviada' || campanha.status === 'enviando') {
        throw new Error(`Campanha já está ${campanha.status}.`);
    }

    await prisma.campanhaEmail.update({ where: { id: campanhaId }, data: { status: 'enviando', dataEnvio: new Date() } });

    let enviadosComSucesso = 0;
    let falhas = 0;

    for (const contato of campanha.listaEmail.contatos) {
      // Simulação de envio de e-mail
      console.log(`Simulando envio para: ${contato.email} - Assunto: ${campanha.assunto}`);
      const sucessoEnvio = Math.random() > 0.1; // 90% de chance de sucesso na simulação

      let statusEnvio = '';
      if (sucessoEnvio) {
        statusEnvio = 'enviado'; // Em um cenário real, seria 'entregue' após confirmação do provedor
        enviadosComSucesso++;
        // Simular abertura e clique
        const aberto = Math.random() > 0.5;
        let clicado = false;
        if (aberto && Math.random() > 0.5) {
            clicado = true;
        }
        await prisma.envioCampanha.create({
          data: {
            campanhaEmailId: campanhaId,
            contatoId: contato.id,
            statusEnvio: clicado ? 'clicado' : (aberto ? 'aberto' : 'enviado'),
            dataAbertura: aberto ? new Date() : null,
            dataClique: clicado ? new Date() : null,
          },
        });
      } else {
        statusEnvio = 'falhou';
        falhas++;
        await prisma.envioCampanha.create({
          data: {
            campanhaEmailId: campanhaId,
            contatoId: contato.id,
            statusEnvio,
            mensagemErro: 'Falha simulada no envio',
          },
        });
      }
    }
    // Atualizar métricas agregadas da campanha
    const totalAberturas = await prisma.envioCampanha.count({ where: { campanhaEmailId: campanhaId, statusEnvio: 'aberto' }});
    const totalCliques = await prisma.envioCampanha.count({ where: { campanhaEmailId: campanhaId, statusEnvio: 'clicado' }});
    
    return prisma.campanhaEmail.update({
      where: { id: campanhaId },
      data: { 
        status: 'enviada',
        totalEnviados: campanha.listaEmail.contatos.length,
        totalRejeicoes: falhas,
        totalAberturas: totalAberturas + totalCliques, // Cliques implicam aberturas
        totalCliques: totalCliques,
       },
    });
  }
}

export default new CampaignService();

