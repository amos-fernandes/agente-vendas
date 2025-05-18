# Use uma imagem base oficial do Node.js com uma versão LTS
FROM node:20-slim

# Defina o diretório de trabalho no contêiner
WORKDIR /usr/src/app

# Copie os arquivos package.json e package-lock.json (ou yarn.lock, pnpm-lock.yaml)
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Instale as dependências do projeto
# Use pnpm se for o gerenciador de pacotes do projeto
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copie o schema do Prisma para gerar o client antes de copiar o resto do código
# Isso ajuda a otimizar o cache do Docker se o schema não mudar frequentemente
COPY prisma ./prisma/

# Gere o Prisma Client
RUN pnpm exec prisma generate

# Copie o restante do código da aplicação para o diretório de trabalho
COPY . .

# Compile o TypeScript para JavaScript
RUN pnpm run build

# Defina a variável de ambiente para a porta (Cloud Run espera 8080 por padrão)
ENV PORT 8080
ENV DATABASE_URL ${DATABASE_URL}

# Exponha a porta que a aplicação vai rodar
EXPOSE 8080

# Comando para rodar a aplicação quando o contêiner iniciar
# Inclui a execução das migrações do Prisma antes de iniciar o servidor
CMD [ "sh", "-c", "pnpm exec prisma migrate deploy && node dist/index.js" ]

