import { PrismaClient, ContaRedeSocial, PostagemRedeSocial, TipoRedeSocial } from "@prisma/client";

const prisma = new PrismaClient();

interface PostContent {
  textoConteudo: string;
  midiaUrl?: string;
  linkExterno?: string;
}

class SocialMediaService {

  // --- Gerenciamento de Contas de Redes Sociais ---
  async conectarContaRedeSocial(tipo: TipoRedeSocial, idUsuarioPlataforma: string, nomeUsuario: string, accessToken: string, refreshToken?: string, expiresAt?: Date): Promise<ContaRedeSocial> {
    // Em um cenário real, aqui ocorreria o fluxo OAuth com a plataforma.
    // O accessToken seria obtido da plataforma.
    console.log(`Simulando conexão da conta ${tipo} para ${nomeUsuario}`);
    return prisma.contaRedeSocial.upsert({
      where: { tipo_idUsuarioPlataforma: { tipo, idUsuarioPlataforma } },
      update: { accessToken, refreshToken, expiresAt, nomeUsuario, dataAtualizacao: new Date() },
      create: { tipo, idUsuarioPlataforma, nomeUsuario, accessToken, refreshToken, expiresAt },
    });
  }

  async obterContasRedeSocial(): Promise<ContaRedeSocial[]> {
    return prisma.contaRedeSocial.findMany({ include: { _count: { select: { postagens: true } } } });
  }

  async obterContaRedeSocialPorId(id: number): Promise<ContaRedeSocial | null> {
    return prisma.contaRedeSocial.findUnique({ where: { id } });
  }

  async desconectarContaRedeSocial(id: number): Promise<void> {
    // Em um cenário real, poderia invalidar o token com a plataforma se a API permitir.
    // Por agora, apenas removemos do nosso banco.
    // Considerar o que fazer com postagens agendadas para esta conta.
    await prisma.postagemRedeSocial.deleteMany({ where: { contaRedeSocialId: id, status: "agendada" }}); // Exemplo: deleta agendadas
    await prisma.contaRedeSocial.delete({ where: { id } });
    console.log(`Simulando desconexão da conta ID: ${id}`);
  }

  // --- Gerenciamento de Postagens ---
  async criarPostagem(contaId: number, conteudo: PostContent, dataAgendamento?: Date | string): Promise<PostagemRedeSocial> {
    const { textoConteudo, midiaUrl, linkExterno } = conteudo;
    return prisma.postagemRedeSocial.create({
      data: {
        contaRedeSocialId: contaId,
        textoConteudo,
        midiaUrl,
        linkExterno,
        status: dataAgendamento ? "agendada" : "rascunho",
        dataAgendamento: dataAgendamento ? new Date(dataAgendamento) : null,
      },
    });
  }

  async obterPostagensPorConta(contaId: number): Promise<PostagemRedeSocial[]> {
    return prisma.postagemRedeSocial.findMany({ where: { contaRedeSocialId: contaId }, orderBy: { dataCriacao: "desc" } });
  }
  
  async obterTodasPostagens(): Promise<PostagemRedeSocial[]> {
    return prisma.postagemRedeSocial.findMany({ orderBy: { dataCriacao: "desc" }, include: { contaRedeSocial: true } });
  }

  async obterPostagemPorId(id: number): Promise<PostagemRedeSocial | null> {
    return prisma.postagemRedeSocial.findUnique({ where: { id }, include: { contaRedeSocial: true }});
  }

  async atualizarPostagem(id: number, data: Partial<PostContent & { status?: string, dataAgendamento?: Date | string }>): Promise<PostagemRedeSocial | null> {
    const updateData: any = { ...data };
    if (data.dataAgendamento) {
      updateData.dataAgendamento = new Date(data.dataAgendamento);
    }
    return prisma.postagemRedeSocial.update({
      where: { id },
      data: updateData,
    });
  }

  async deletarPostagem(id: number): Promise<void> {
    await prisma.postagemRedeSocial.delete({ where: { id } });
  }

  async publicarPostagemAgendada(postagemId: number): Promise<PostagemRedeSocial | null> {
    const postagem = await prisma.postagemRedeSocial.findUnique({ 
        where: { id: postagemId },
        include: { contaRedeSocial: true }
    });

    if (!postagem || !postagem.contaRedeSocial) {
      throw new Error("Postagem ou conta social não encontrada.");
    }

    if (postagem.status !== "agendada" && postagem.status !== "falhou") { // Permite tentar novamente postagens que falharam
      // throw new Error(`Postagem não está agendada ou não falhou anteriormente. Status atual: ${postagem.status}`);
      console.warn(`Postagem ID ${postagemId} não está agendada ou falhou. Status: ${postagem.status}. Tentando publicar mesmo assim (simulação).`);
    }

    // Simulação de publicação na API da rede social
    console.log(`Simulando publicação para ${postagem.contaRedeSocial.tipo} (${postagem.contaRedeSocial.nomeUsuario}): "${postagem.textoConteudo}"`);
    const sucessoPublicacao = Math.random() > 0.1; // 90% de chance de sucesso
    let idPostagemPlataforma = null;
    let metricasSimuladas = null;

    if (sucessoPublicacao) {
      idPostagemPlataforma = `sim_${postagem.contaRedeSocial.tipo.toLowerCase()}_${Date.now()}`;
      metricasSimuladas = { likes: Math.floor(Math.random() * 100), shares: Math.floor(Math.random() * 20) };
      return prisma.postagemRedeSocial.update({
        where: { id: postagemId },
        data: {
          status: "publicada",
          dataPublicacao: new Date(),
          idPostagemPlataforma,
          metricas: metricasSimuladas,
          mensagemErro: null,
        },
      });
    } else {
      return prisma.postagemRedeSocial.update({
        where: { id: postagemId },
        data: {
          status: "falhou",
          mensagemErro: "Falha simulada na publicação via API.",
        },
      });
    }
  }

  // Método para simular o agendador que buscaria postagens agendadas e as publicaria.
  async processarPostagensAgendadas(): Promise<void> {
    console.log("Serviço: Verificando postagens agendadas para publicação...");
    const agora = new Date();
    const postagensParaPublicar = await prisma.postagemRedeSocial.findMany({
      where: {
        status: "agendada",
        dataAgendamento: {
          lte: agora,
        },
      },
    });

    for (const postagem of postagensParaPublicar) {
      try {
        console.log(`Processando postagem agendada ID: ${postagem.id}`);
        await this.publicarPostagemAgendada(postagem.id);
      } catch (error) {
        const e = error as Error;
        console.error(`Erro ao processar postagem agendada ID ${postagem.id}: ${e.message}`);
        await prisma.postagemRedeSocial.update({
            where: { id: postagem.id },
            data: { status: "falhou", mensagemErro: `Erro no agendador: ${e.message}`}
        });
      }
    }
    console.log(`Serviço: ${postagensParaPublicar.length} postagens agendadas processadas.`);
  }
}

export default new SocialMediaService();

