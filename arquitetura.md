# Arquitetura do Sistema: Agente Vertical de Vendas

## 1. Visão Geral

Este documento descreve a arquitetura planejada para o Agente Vertical de Vendas, um sistema projetado para automatizar e otimizar processos de vendas, incluindo captação de leads, comunicação via WhatsApp, campanhas de e-mail marketing, postagens em redes sociais e criação de conteúdo promocional em vídeo. A stack tecnológica principal consiste em React com TypeScript para o frontend e Node.js com Express e TypeScript para o backend.

## 2. Componentes Principais

O sistema será modular, composto pelos seguintes componentes principais:

### 2.1. Frontend (React + TypeScript)

*   **Responsabilidade:** Interface do usuário (UI) e experiência do usuário (UX).
*   **Funcionalidades:**
    *   Dashboard de controle para gerenciamento geral.
    *   Módulo de gerenciamento de leads (visualização, adição manual, importação).
    *   Módulo de criação e gerenciamento de campanhas de e-mail.
    *   Módulo de agendamento e visualização de postagens em redes sociais (X, Facebook).
    *   Interface para iniciar e monitorar a criação de vídeos promocionais.
    *   Configurações da conta e integrações (API keys, etc.).
    *   Visualização de relatórios e análises básicas de desempenho das campanhas.
*   **Tecnologias Adicionais:**
    *   Gerenciador de estado (ex: Redux Toolkit, Zustand).
    *   Biblioteca de componentes UI (ex: Material-UI, Ant Design).
    *   Ferramentas de roteamento (ex: React Router).

### 2.2. Backend (Node.js + Express + TypeScript)

*   **Responsabilidade:** Lógica de negócios, APIs RESTful para o frontend, orquestração de serviços e integrações com sistemas externos.
*   **Módulos Principais (APIs):
    *   **API de Autenticação e Usuários:** Gerenciamento de contas de usuário, autenticação (JWT).
    *   **API de Leads:** CRUD para leads, lógica para identificar empresas com grandes folhas de pagamento (requer integração com fontes de dados externas ou scraping), extração de e-mails de compras/diretoria.
    *   **API de Campanhas de E-mail:** Criação, agendamento e envio de e-mails promocionais (integração com serviços como SendGrid, Mailgun).
    *   **API de Redes Sociais:** Integração com APIs do X e Facebook para postagem de conteúdo.
    *   **API de Geração de Vídeo:** Interface para controlar ferramentas ou serviços de geração de vídeo.
    *   **API de Integração WhatsApp:** Gerenciamento da comunicação via WhatsApp Business API (envio de mensagens, templates, possivelmente webhooks para recebimento).
*   **Tecnologias Adicionais:**
    *   ORM/ODM (ex: Prisma, TypeORM, Mongoose) para interação com o banco de dados.
    *   Bibliotecas para validação de dados (ex: Zod, class-validator).
    *   Agendador de tarefas (ex: node-cron) para campanhas e postagens agendadas.

### 2.3. Banco de Dados

*   **Tipo:** Relacional (ex: PostgreSQL) ou NoSQL (ex: MongoDB). A escolha final dependerá da complexidade das relações de dados e da preferência por escalabilidade e flexibilidade.
    *   **PostgreSQL:** Bom para dados estruturados e relacionamentos complexos, transações ACID.
    *   **MongoDB:** Bom para flexibilidade de esquema, escalabilidade horizontal, dados não estruturados ou semi-estruturados.
*   **Dados Armazenados:**
    *   Informações de usuários (credenciais, perfis).
    *   Dados de leads (empresas, contatos, e-mails, histórico de interações).
    *   Detalhes de campanhas de e-mail (templates, listas de destinatários, status, métricas).
    *   Conteúdo e agendamentos para redes sociais.
    *   Metadados e status de vídeos gerados.
    *   Logs de atividades e erros do sistema.

### 2.4. Serviços Externos e APIs

*   **API do WhatsApp Business:** Para comunicação direta com clientes.
*   **APIs de Redes Sociais:** X (Twitter) API, Facebook Graph API para postagens.
*   **Serviço de Envio de E-mail:** SendGrid, Mailgun, AWS SES para envio de campanhas de e-mail em massa.
*   **Fontes de Dados para Leads:** Potenciais APIs de informações empresariais (ex: LinkedIn API com permissões adequadas, Clearbit, ZoomInfo - podem ter custos associados) ou estratégias de web scraping (com considerações éticas e legais).
*   **Ferramentas/APIs de Geração de Vídeo:** (Ex: FFmpeg para manipulação local, ou APIs como Synthesia, Pictory - podem ter custos associados) para criação de vídeos curtos e promocionais.

## 3. Fluxo de Dados e Interações

1.  **Usuário (Vendedor):** Interage com o Frontend (React App) através de um navegador.
2.  **Frontend:** Envia requisições HTTP (RESTful) para o Backend API (Node.js/Express).
3.  **Backend:**
    *   Valida as requisições e autentica o usuário.
    *   Processa a lógica de negócios.
    *   Interage com o Banco de Dados para ler ou escrever dados.
    *   Comunica-se com as APIs Externas (WhatsApp, E-mail, Redes Sociais, Geração de Vídeo, Fontes de Leads) conforme necessário.
    *   Enfileira tarefas assíncronas (ex: envio de e-mails em massa, geração de vídeo) para processamento em background.
4.  **Backend:** Retorna respostas (JSON) para o Frontend.
5.  **Frontend:** Atualiza a UI com base nas respostas recebidas.

## 4. Considerações de Arquitetura

### 4.1. Segurança

*   **Autenticação:** Implementação de JWT (JSON Web Tokens) para proteger as APIs.
*   **Autorização:** Controle de acesso baseado em papéis (RBAC) se múltiplos níveis de usuário forem necessários.
*   **Proteção de Dados:** Criptografia de dados sensíveis (ex: API keys de serviços externos) em repouso e em trânsito (HTTPS).
*   **Validação de Entrada:** Validação rigorosa de todas as entradas do usuário no frontend e backend para prevenir XSS, SQL Injection, etc.
*   **Gerenciamento de Segredos:** Utilização de variáveis de ambiente e/ou serviços de gerenciamento de segredos para API keys e credenciais de banco de dados.
*   **Rate Limiting e Proteção contra Abuso:** Para APIs públicas ou sensíveis.

### 4.2. Escalabilidade

*   **Backend:** Arquitetura stateless para facilitar a escalabilidade horizontal (múltiplas instâncias do servidor Node.js).
*   **Banco de Dados:** Escolha de um banco de dados que suporte escalabilidade (ex: réplicas de leitura, sharding para PostgreSQL; replica sets, sharding para MongoDB).
*   **Tarefas Assíncronas:** Uso de filas de mensagens (ex: RabbitMQ, Redis) para processar tarefas demoradas em background, evitando bloqueio das requisições principais.
*   **Frontend:** Servido através de CDN para melhor performance e disponibilidade.

### 4.3. Manutenibilidade e Código Limpo

*   **TypeScript:** Uso em todo o stack para tipagem estática, melhorando a detecção de erros e a clareza do código.
*   **Modularidade:** Divisão clara de responsabilidades entre frontend, backend e os diferentes módulos dentro de cada um.
*   **Princípios SOLID e Design Patterns:** Aplicação para criar um código mais robusto e fácil de manter.
*   **Comentários no Código:** Comentários claros e concisos explicando a lógica complexa e as decisões de design.
*   **Testes:** Implementação de testes unitários, de integração e E2E.
*   **Linting e Formatação:** Uso de ESLint, Prettier para manter um estilo de código consistente.

### 4.4. Integração com WhatsApp

*   Será necessário utilizar a API Oficial do WhatsApp Business. Isso pode envolver um processo de aprovação e configuração com um Provedor de Soluções do WhatsApp (BSP).
*   Gerenciamento de templates de mensagens, envio de notificações e, possivelmente, um chatbot básico para respostas automáticas.

## 5. Próximos Passos no Planejamento

*   Detalhar as especificações de cada funcionalidade listada no `todo.md`.
*   Definir o esquema do banco de dados.
*   Pesquisar e selecionar as ferramentas/APIs específicas para geração de vídeo e captação de leads.

