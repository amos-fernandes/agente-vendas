-- CreateEnum
CREATE TYPE "TipoMediaAsset" AS ENUM ('IMAGEM', 'VIDEO_CURTO', 'AUDIO', 'LOGO');

-- CreateEnum
CREATE TYPE "StatusVideoGerado" AS ENUM ('PENDENTE', 'PROCESSANDO', 'CONCLUIDO', 'FALHOU');

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoMediaAsset" NOT NULL,
    "url_armazenamento" TEXT NOT NULL,
    "formato" TEXT,
    "tamanho_bytes" INTEGER,
    "data_upload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoTemplate" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "duracao_segundos" INTEGER,
    "formato" TEXT,
    "preview_url" TEXT,
    "estrutura_json" JSONB,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoGerado" (
    "id" SERIAL NOT NULL,
    "video_template_id" INTEGER NOT NULL,
    "nome_personalizado" TEXT,
    "dados_personalizacao" JSONB,
    "status" "StatusVideoGerado" NOT NULL DEFAULT 'PENDENTE',
    "url_video_final" TEXT,
    "log_processamento" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoGerado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AssetEmTemplate" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AssetEmTemplate_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AssetEmVideo" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AssetEmVideo_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoTemplate_nome_key" ON "VideoTemplate"("nome");

-- CreateIndex
CREATE INDEX "_AssetEmTemplate_B_index" ON "_AssetEmTemplate"("B");

-- CreateIndex
CREATE INDEX "_AssetEmVideo_B_index" ON "_AssetEmVideo"("B");

-- AddForeignKey
ALTER TABLE "VideoGerado" ADD CONSTRAINT "VideoGerado_video_template_id_fkey" FOREIGN KEY ("video_template_id") REFERENCES "VideoTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssetEmTemplate" ADD CONSTRAINT "_AssetEmTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssetEmTemplate" ADD CONSTRAINT "_AssetEmTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "VideoTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssetEmVideo" ADD CONSTRAINT "_AssetEmVideo_A_fkey" FOREIGN KEY ("A") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssetEmVideo" ADD CONSTRAINT "_AssetEmVideo_B_fkey" FOREIGN KEY ("B") REFERENCES "VideoGerado"("id") ON DELETE CASCADE ON UPDATE CASCADE;
