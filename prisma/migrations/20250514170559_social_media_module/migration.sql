/*
  Warnings:

  - You are about to drop the column `corpo_html` on the `TemplateEmail` table. All the data in the column will be lost.
  - You are about to drop the column `corpo_texto` on the `TemplateEmail` table. All the data in the column will be lost.
  - Added the required column `corpoHtml` to the `TemplateEmail` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoRedeSocial" AS ENUM ('X', 'FACEBOOK');

-- AlterTable
ALTER TABLE "TemplateEmail" DROP COLUMN "corpo_html",
DROP COLUMN "corpo_texto",
ADD COLUMN     "corpoHtml" TEXT NOT NULL,
ADD COLUMN     "corpoTexto" TEXT;

-- CreateTable
CREATE TABLE "ContaRedeSocial" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoRedeSocial" NOT NULL,
    "id_usuario_plataforma" TEXT NOT NULL,
    "nome_usuario" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "data_conexao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContaRedeSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostagemRedeSocial" (
    "id" SERIAL NOT NULL,
    "conta_rede_social_id" INTEGER NOT NULL,
    "texto_conteudo" TEXT NOT NULL,
    "midia_url" TEXT,
    "link_externo" TEXT,
    "status" TEXT NOT NULL,
    "data_agendamento" TIMESTAMP(3),
    "data_publicacao" TIMESTAMP(3),
    "id_postagem_plataforma" TEXT,
    "metricas" JSONB,
    "mensagem_erro" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostagemRedeSocial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContaRedeSocial_tipo_id_usuario_plataforma_key" ON "ContaRedeSocial"("tipo", "id_usuario_plataforma");

-- AddForeignKey
ALTER TABLE "PostagemRedeSocial" ADD CONSTRAINT "PostagemRedeSocial_conta_rede_social_id_fkey" FOREIGN KEY ("conta_rede_social_id") REFERENCES "ContaRedeSocial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
