# Especificação de Funcionalidades: Módulo de Integração com WhatsApp

## 1. Objetivo

Este módulo visa integrar o sistema com a API do WhatsApp Business para permitir a comunicação direta com os leads e clientes, envio de mensagens promocionais (dentro das políticas do WhatsApp), notificações e, potencialmente, um atendimento inicial automatizado.

## 2. Funcionalidades Principais

### 2.1. Configuração da Integração com WhatsApp Business API

*   **Descrição:** Permitir que o usuário configure a conexão com sua conta do WhatsApp Business API.
*   **Requisito Fundamental:** O usuário precisará ter uma conta aprovada na WhatsApp Business API, geralmente obtida através de um Provedor de Soluções do WhatsApp (BSP - Business Solution Provider).
*   **Funcionalidades (Frontend/Backend):**
    *   Interface para inserir as credenciais da API (ex: API Key, Endpoint do BSP, ID da Conta do WhatsApp Business - WABA ID, ID do Número de Telefone).
    *   Armazenamento seguro dessas credenciais.
    *   Teste de conexão para verificar se as credenciais são válidas e a API está acessível.
    *   Orientações básicas sobre como obter acesso à WhatsApp Business API.

### 2.2. Gerenciamento de Templates de Mensagens

*   **Descrição:** O WhatsApp Business API exige o uso de templates pré-aprovados para mensagens iniciadas pela empresa (HSM - Highly Structured Messages).
*   **Funcionalidades:**
    *   Interface para visualizar os templates de mensagens já aprovados na conta do WhatsApp do usuário (sincronização via API).
    *   Opção para submeter novos templates para aprovação através do BSP (se a API do BSP permitir essa funcionalidade, caso contrário, orientar o usuário a fazê-lo no painel do BSP).
    *   Suporte para templates com variáveis (placeholders) para personalização (ex: `{{1}}` que pode ser substituído pelo nome do cliente).
    *   Categorização de templates (ex: marketing, utilidade, autenticação).

### 2.3. Envio de Mensagens Individuais e em Massa (via Templates)

*   **Descrição:** Enviar mensagens baseadas em templates para contatos individuais ou listas de leads.
*   **Funcionalidades:**
    *   **Envio Individual:** A partir do perfil de um lead/contato, selecionar um template aprovado, preencher as variáveis e enviar a mensagem.
    *   **Envio em Massa (Campanhas):**
        *   Selecionar uma lista de contatos (leads opt-in).
        *   Selecionar um template de mensagem aprovado.
        *   Mapear os campos dos leads para as variáveis do template.
        *   Agendar o envio ou enviar imediatamente (respeitando os limites de envio do WhatsApp).
    *   **Opt-in:** O sistema deve apenas permitir o envio para contatos que deram consentimento explícito (opt-in) para receber mensagens via WhatsApp, conforme as políticas da plataforma.
*   **Processamento (Backend):**
    *   Interação com a API do WhatsApp Business para enviar as mensagens.
    *   Gerenciamento de filas para envios em massa.
    *   Tratamento de status de entrega (enviado, entregue, lido, falhou) via webhooks ou polling.

### 2.4. Recebimento e Visualização de Mensagens (Chat Básico)

*   **Descrição:** Permitir que o usuário visualize as respostas dos clientes e responda dentro de uma janela de atendimento de 24 horas (para mensagens de formato livre).
*   **Funcionalidades (Frontend/Backend):**
    *   Interface de chat simplificada para cada contato que respondeu.
    *   Notificações de novas mensagens recebidas.
    *   Capacidade de enviar mensagens de formato livre em resposta a uma mensagem do usuário (dentro da janela de 24 horas).
    *   Histórico de conversas com cada contato.
    *   Webhooks para receber mensagens em tempo real da API do WhatsApp.

### 2.5. Automações Básicas (Opcional - Chatbot Simples)

*   **Descrição:** Configurar respostas automáticas para perguntas frequentes ou saudações iniciais.
*   **Funcionalidades:**
    *   Respostas automáticas para mensagens recebidas fora do horário de atendimento.
    *   Respostas baseadas em palavras-chave simples.
    *   Menu de opções simples (ex: "Digite 1 para Vendas, 2 para Suporte").
    *   **Nota:** Não se pretende criar um construtor de chatbot complexo, mas sim automações básicas. Para fluxos mais avançados, o usuário seria orientado a usar plataformas de chatbot dedicadas que se integrem ao WhatsApp Business API.

## 3. Interface do Usuário (Frontend)

*   **Painel de Configuração do WhatsApp:** Para inserir credenciais da API.
*   **Gerenciador de Templates:** Para visualizar e (se possível) gerenciar templates.
*   **Interface de Envio de Mensagens:** Seleção de contatos, templates e personalização.
*   **Caixa de Entrada/Chat:** Para visualizar conversas e responder a mensagens de clientes.
*   **Dashboard de Métricas do WhatsApp (Básico):** Mensagens enviadas, entregues, lidas.

## 4. Integrações

*   **WhatsApp Business API (via BSP):** Principal integração.
*   **Módulo de Captura de Leads:** Para acesso aos números de telefone dos contatos (com opt-in).
*   **Backend API:** Para toda a lógica de negócios, envio/recebimento de mensagens e gerenciamento de webhooks.

## 5. Considerações Técnicas

*   **Políticas do WhatsApp:** Adesão estrita a todas as políticas de uso da WhatsApp Business API, especialmente sobre opt-in, tipos de mensagens permitidas e limites de envio. Violações podem levar à suspensão do serviço.
*   **Custos da API:** A WhatsApp Business API tem custos associados, geralmente por conversa ou por template enviado, que variam conforme o BSP e o país.
*   **Webhooks:** Configuração e gerenciamento de endpoints de webhook seguros para receber atualizações de status e mensagens.
*   **Janela de Atendimento de 24 horas:** Entender e respeitar a regra que permite mensagens de formato livre apenas dentro de 24 horas após a última mensagem do usuário. Fora dessa janela, apenas templates podem ser usados.
*   **Segurança e Privacidade:** Proteção dos dados dos usuários e das conversas, em conformidade com a LGPD.
*   **Número de Telefone:** O usuário precisará de um número de telefone dedicado para a WhatsApp Business API, que não pode ser o mesmo de uma conta pessoal do WhatsApp ou do aplicativo WhatsApp Business normal.

## 6. Fluxo de Trabalho do Usuário (Exemplo - Envio de Campanha)

1.  O usuário configura a integração com sua conta WhatsApp Business API.
2.  Verifica se possui um template de mensagem aprovado adequado para sua campanha.
3.  No módulo de "WhatsApp", seleciona "Criar Campanha".
4.  Escolhe uma lista de contatos com opt-in.
5.  Seleciona o template de mensagem e preenche as variáveis (ex: nome do cliente, detalhes da promoção).
6.  Agenda o envio ou envia imediatamente.
7.  O sistema envia as mensagens através da API do WhatsApp.
8.  O usuário pode monitorar o status de entrega e visualizar respostas na caixa de entrada.
