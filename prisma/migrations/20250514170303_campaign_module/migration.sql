-- CreateTable
CREATE TABLE "ListaEmail" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListaEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateEmail" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "assunto_padrao" TEXT,
    "corpo_html" TEXT NOT NULL,
    "corpo_texto" TEXT,
    "tipo" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampanhaEmail" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "remetente_nome" TEXT,
    "remetente_email" TEXT NOT NULL,
    "data_agendamento" TIMESTAMP(3),
    "data_envio" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "lista_email_id" INTEGER NOT NULL,
    "template_email_id" INTEGER NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,
    "total_enviados" INTEGER DEFAULT 0,
    "total_aberturas" INTEGER DEFAULT 0,
    "total_cliques" INTEGER DEFAULT 0,
    "total_rejeicoes" INTEGER DEFAULT 0,

    CONSTRAINT "CampanhaEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvioCampanha" (
    "id" SERIAL NOT NULL,
    "campanha_email_id" INTEGER NOT NULL,
    "contato_id" INTEGER NOT NULL,
    "data_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusEnvio" TEXT NOT NULL,
    "data_abertura" TIMESTAMP(3),
    "data_clique" TIMESTAMP(3),
    "mensagem_erro" TEXT,

    CONSTRAINT "EnvioCampanha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContatoEmLista" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ContatoEmLista_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListaEmail_nome_key" ON "ListaEmail"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateEmail_nome_key" ON "TemplateEmail"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "EnvioCampanha_campanha_email_id_contato_id_key" ON "EnvioCampanha"("campanha_email_id", "contato_id");

-- CreateIndex
CREATE INDEX "_ContatoEmLista_B_index" ON "_ContatoEmLista"("B");

-- AddForeignKey
ALTER TABLE "CampanhaEmail" ADD CONSTRAINT "CampanhaEmail_lista_email_id_fkey" FOREIGN KEY ("lista_email_id") REFERENCES "ListaEmail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampanhaEmail" ADD CONSTRAINT "CampanhaEmail_template_email_id_fkey" FOREIGN KEY ("template_email_id") REFERENCES "TemplateEmail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvioCampanha" ADD CONSTRAINT "EnvioCampanha_campanha_email_id_fkey" FOREIGN KEY ("campanha_email_id") REFERENCES "CampanhaEmail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvioCampanha" ADD CONSTRAINT "EnvioCampanha_contato_id_fkey" FOREIGN KEY ("contato_id") REFERENCES "Contato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContatoEmLista" ADD CONSTRAINT "_ContatoEmLista_A_fkey" FOREIGN KEY ("A") REFERENCES "Contato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContatoEmLista" ADD CONSTRAINT "_ContatoEmLista_B_fkey" FOREIGN KEY ("B") REFERENCES "ListaEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
