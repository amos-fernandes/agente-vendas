# Agente Vertical de Vendas - Backend

Este projeto implementa o backend para um Agente Vertical de Vendas, desenvolvido em Node.js com Express, TypeScript e Prisma ORM.

## Funcionalidades Principais

O backend oferece os seguintes módulos com APIs RESTful:

1.  **Captação de Empresas e E-mails (`/api/leads`):**
    *   CRUD para Empresas.
    *   CRUD para Contatos associados a empresas.
    *   Simulação de busca de empresas e extração de e-mails de fontes externas.
    *   Simulação de validação de e-mails.

2.  **Campanhas de E-mail (`/api/campaigns`):**
    *   CRUD para Listas de E-mail.
    *   CRUD para Templates de E-mail.
    *   CRUD para Campanhas de E-mail (criação, agendamento).
    *   Simulação de envio de campanhas e coleta de métricas básicas (aberturas, cliques).

3.  **Postagens em Redes Sociais (`/api/social`):**
    *   CRUD para Contas de Redes Sociais (X, Facebook - conexão simulada).
    *   CRUD para Postagens (criação, agendamento).
    *   Simulação de publicação em redes sociais e um endpoint de scheduler para processar postagens agendadas.

4.  **Geração de Vídeos e Shorts (`/api/videos`):**
    *   CRUD para Media Assets (upload simulado de imagens, vídeos curtos, áudios, logos).
    *   CRUD para Templates de Vídeo.
    *   CRUD para Vídeos Gerados (solicitação de geração, status, simulação de processamento assíncrono).

## Estrutura do Projeto

```
/agente_vendas_backend
|-- /prisma
|   |-- schema.prisma       # Esquema do banco de dados Prisma
|   |-- migrations/         # Diretório de migrações do Prisma
|-- /src
|   |-- /services           # Lógica de negócios para cada módulo
|   |   |-- leadGenerationService.ts
|   |   |-- campaignService.ts
|   |   |-- socialMediaService.ts
|   |   |-- videoService.ts
|   |-- index.ts            # Ponto de entrada principal da aplicação Express
|   |-- routes.ts           # Rotas para o módulo de leads
|   |-- campaignRoutes.ts   # Rotas para o módulo de campanhas
|   |-- socialMediaRoutes.ts# Rotas para o módulo de redes sociais
|   |-- videoRoutes.ts      # Rotas para o módulo de vídeos
|-- /uploads                # Diretório simulado para uploads (não versionado por padrão)
|-- /generated_videos       # Diretório simulado para vídeos gerados (não versionado por padrão)
|-- .env.example            # Exemplo de arquivo de variáveis de ambiente
|-- .gitignore              # Arquivos e pastas a serem ignorados pelo Git
|-- Dockerfile              # Configuração para containerização com Docker
|-- package.json            # Dependências e scripts do projeto
|-- setup.sh                # Script para auxiliar na configuração do ambiente local
|-- tsconfig.json           # Configurações do compilador TypeScript
```

## Pré-requisitos (Desenvolvimento Local)

*   Node.js (versão 20.x ou superior recomendada)
*   pnpm (instalado globalmente: `npm install -g pnpm`)
*   PostgreSQL (rodando localmente ou acessível remotamente)

## Configuração do Ambiente de Desenvolvimento Local

1.  **Clone o repositório (ou extraia o arquivo .zip).**

2.  **Navegue até o diretório do projeto:**
    ```bash
    cd agente_vendas_backend
    ```

3.  **Execute o script de setup:**
    Este script irá:
    *   Verificar Node.js e pnpm.
    *   Criar um arquivo `.env` a partir do `.env.example` (se não existir).
    *   Instalar as dependências do projeto.
    *   Gerar o Prisma Client.
    *   Tentar executar as migrações do Prisma (`prisma migrate dev`).
    *   Criar diretórios de uploads simulados.

    ```bash
    bash setup.sh
    ```
    ou
    ```bash
    chmod +x setup.sh
    ./setup.sh
    ```

4.  **Configure o arquivo `.env`:**
    Abra o arquivo `.env` e configure a `DATABASE_URL` para apontar para sua instância do PostgreSQL. O formato é:
    `DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"`
    Exemplo para um banco local chamado `agente_vendas_db` com usuário `app_user` e senha `app_password`:
    `DATABASE_URL="postgresql://app_user:app_password@localhost:5432/agente_vendas_db?schema=public"`

    **Importante:** Certifique-se de que o banco de dados e o usuário especificados na `DATABASE_URL` existam no seu PostgreSQL e que o usuário tenha permissões para criar tabelas (ou execute as migrações com um superusuário na primeira vez).

5.  **Execute as migrações (se o `setup.sh` falhou ou se precisar rodar manualmente):**
    ```bash
    pnpm exec prisma migrate dev --name initial_migration
    ```

## Scripts Disponíveis

*   **Iniciar em modo de desenvolvimento (com Nodemon):**
    ```bash
    pnpm run dev
    ```
    O servidor estará disponível em `http://localhost:3000` (ou a porta definida em `.env`).

*   **Buildar o projeto para produção:**
    ```bash
    pnpm run build
    ```
    Isso compilará o TypeScript para JavaScript no diretório `dist`.

*   **Iniciar em modo de produção (após o build):**
    ```bash
    pnpm run start
    ```

*   **Gerar Prisma Client (geralmente não necessário manualmente após setup):**
    ```bash
    pnpm exec prisma generate
    ```

*   **Abrir Prisma Studio (ferramenta visual para o banco de dados):**
    ```bash
    pnpm exec prisma studio
    ```

## Testando a API

Consulte o arquivo `api_testing_guide.md` para um guia detalhado sobre como testar cada endpoint da API usando ferramentas como Postman ou Insomnia.

## Deploy com Docker e Google Cloud Run

O projeto inclui um `Dockerfile` otimizado para deploy.

### Requisitos para Deploy no Cloud Run:

*   Conta no Google Cloud Platform com um projeto criado.
*   `gcloud` CLI instalado e configurado.
*   Serviço de PostgreSQL gerenciado (ex: Cloud SQL) ou outra instância acessível pelo Cloud Run.
*   Container Registry habilitado (ex: Google Artifact Registry).

### Passos para Deploy (Resumido):

1.  **Configure sua `DATABASE_URL` no Cloud Run:**
    Ao configurar o serviço no Cloud Run, você precisará definir a variável de ambiente `DATABASE_URL` para apontar para sua instância de produção do PostgreSQL.

2.  **Build da Imagem Docker:**
    No diretório `agente_vendas_backend`, execute:
    ```bash
    gcloud builds submit --tag gcr.io/SEU_PROJECT_ID/agente-vendas-backend
    ```
    Substitua `SEU_PROJECT_ID` pelo ID do seu projeto no GCP.

3.  **Deploy no Cloud Run:**
    ```bash
    gcloud run deploy agente-vendas-backend \
        --image gcr.io/SEU_PROJECT_ID/agente-vendas-backend \
        --platform managed \
        --region SUA_REGIAO \
        --allow-unauthenticated \
        --set-env-vars DATABASE_URL="sua_database_url_de_producao" 
        # Adicione outras variáveis de ambiente conforme necessário
    ```
    Substitua `SUA_REGIAO` pela região desejada (ex: `us-central1`).
    A flag `--allow-unauthenticated` torna o serviço público; ajuste conforme suas necessidades de segurança.

4.  **Migrações no Cloud Run:**
    O comando `CMD` no `Dockerfile` (`pnpm exec prisma migrate deploy && node dist/index.js`) tentará executar as migrações (`prisma migrate deploy`) antes de iniciar o servidor. Certifique-se que a conta de serviço do Cloud Run (ou a conexão com o banco) tenha permissões para isso.
    Para a primeira migração ou alterações de schema significativas, pode ser mais seguro executar as migrações manualmente ou através de um job separado antes de atualizar o serviço.

## Considerações Finais

*   **Segurança:** Para um ambiente de produção, implemente autenticação e autorização adequadas nas rotas da API.
*   **Validação de Entrada:** Adicione validação mais robusta para os dados de entrada nas requisições.
*   **Tratamento de Erros:** Aprimore o tratamento de erros para fornecer feedback mais específico.
*   **Testes:** Implemente testes unitários e de integração.
*   **Integrações Reais:** Substitua as simulações (envio de e-mail, redes sociais, geração de vídeo) por integrações com serviços reais, configurando as respectivas chaves de API no `.env`.

Este backend fornece uma base sólida para o Agente Vertical de Vendas. O próximo passo seria o desenvolvimento do frontend em React + TypeScript e a integração com a API do WhatsApp.

