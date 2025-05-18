#!/bin/bash

# Script de Setup para o Agente Vertical de Vendas Backend

echo "Iniciando o setup do ambiente de desenvolvimento..."

# 1. Verificar se Node.js e pnpm estão instalados (opcional, pois o Docker lida com isso no deploy)
# Para ambiente de desenvolvimento local, é bom ter.
echo "Verificando Node.js e pnpm..."
if ! command -v node &> /dev/null
then
    echo "Node.js não encontrado. Por favor, instale o Node.js (versão >= 18 recomendada)."
    # exit 1
fi

if ! command -v pnpm &> /dev/null
then
    echo "pnpm não encontrado. Instalando pnpm globalmente via npm..."
    if command -v npm &> /dev/null; then
        npm install -g pnpm
    else
        echo "npm não encontrado. Por favor, instale npm primeiro para instalar pnpm, ou instale pnpm manualmente."
        # exit 1
    fi
fi

# 2. Criar arquivo .env a partir do .env.example (se existir)
if [ -f .env.example ] && [ ! -f .env ]; then
    echo "Copiando .env.example para .env..."
    cp .env.example .env
    echo "Arquivo .env criado. Por favor, configure suas variáveis de ambiente, especialmente DATABASE_URL."
    echo "Exemplo DATABASE_URL: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
else
    if [ ! -f .env ]; then
        echo "Criando arquivo .env vazio..."
        echo "DATABASE_URL=\"postgresql://app_user:app_password@localhost:5432/agente_vendas_db?schema=public\"" > .env
        echo "PORT=3000" >> .env
        echo "Arquivo .env criado com valores padrão. Por favor, revise e configure suas variáveis de ambiente."
    else
        echo "Arquivo .env já existe. Pulando criação."
    fi
fi

# 3. Instalar dependências do projeto
echo "Instalando dependências do projeto com pnpm..."
pnpm install --frozen-lockfile
if [ $? -ne 0 ]; then
    echo "Falha ao instalar dependências com pnpm. Verifique os erros." 
    exit 1
fi

# 4. Gerar Prisma Client
echo "Gerando Prisma Client..."
pnpm exec prisma generate
if [ $? -ne 0 ]; then
    echo "Falha ao gerar Prisma Client. Verifique os erros."
    exit 1
fi

# 5. Executar migrações do Prisma para configurar o banco de dados
# É importante que o servidor PostgreSQL esteja rodando e acessível
echo "Executando migrações do Prisma (prisma migrate dev)..."
echo "Certifique-se que seu servidor PostgreSQL está rodando e acessível conforme configurado no .env"
pnpm exec prisma migrate dev --name init_from_setup
if [ $? -ne 0 ]; then
    echo "Falha ao executar migrações do Prisma. Verifique a conexão com o banco e os logs."
    echo "Você pode precisar criar o banco de dados e o usuário manualmente antes de rodar as migrações."
    # exit 1 # Não sair, permitir que o usuário tente manualmente
fi

# 6. Criar diretórios de upload (se não existirem)
echo "Criando diretórios de uploads simulados (se não existirem)..."
mkdir -p ./uploads/media_assets
mkdir -p ./uploads/temp
mkdir -p ./generated_videos

echo "Setup do ambiente de desenvolvimento concluído!"
echo "Para iniciar o servidor em modo de desenvolvimento, use: pnpm run dev"
echo "Para buildar o projeto para produção, use: pnpm run build"
echo "Para iniciar o servidor em modo de produção (após build), use: pnpm run start"

exit 0

