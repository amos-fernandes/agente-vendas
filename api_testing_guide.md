# Guia de Testes da API do Agente Vertical de Vendas

Este guia detalha como testar os endpoints da API backend desenvolvida para o Agente Vertical de Vendas. Recomenda-se o uso de uma ferramenta como Postman ou Insomnia para realizar as requisições HTTP.

**URL Base da API:** `http://localhost:3000/api` (ou a porta que for configurada ao iniciar o servidor)

**Observações Gerais:**
*   Todas as requisições que enviam dados no corpo (POST, PUT) devem usar o `Content-Type: application/json`.
*   IDs são geralmente numéricos e auto-incrementais.
*   Muitas operações são simuladas (envio de e-mail, postagem em redes sociais, geração de vídeo). O guia indicará onde isso ocorre.
*   Verifique os logs do servidor para acompanhar as simulações e possíveis erros detalhados.

## Módulo 1: Captação de Empresas e E-mails (`/api/leads`)

### 1.1. Empresas

*   **`POST /api/leads/empresas`**: Criar uma nova empresa.
    *   **Corpo (exemplo):**
        ```json
        {
          "nome": "Empresa Exemplo LTDA",
          "setor": "Tecnologia",
          "localizacao": "São Paulo, SP",
          "numeroFuncionarios": 150,
          "website": "http://empresaexemplo.com.br"
        }
        ```
    *   **Resposta Esperada:** `201 Created` com os dados da empresa criada.

*   **`GET /api/leads/empresas`**: Listar todas as empresas.
    *   **Resposta Esperada:** `200 OK` com um array de empresas (incluindo seus contatos).

*   **`GET /api/leads/empresas/:id`**: Obter uma empresa específica pelo ID.
    *   **Resposta Esperada:** `200 OK` com os dados da empresa ou `404 Not Found`.

*   **`PUT /api/leads/empresas/:id`**: Atualizar uma empresa.
    *   **Corpo (exemplo):**
        ```json
        {
          "setor": "Tecnologia da Informação",
          "numeroFuncionarios": 160
        }
        ```
    *   **Resposta Esperada:** `200 OK` com os dados da empresa atualizada ou `404 Not Found`.

*   **`DELETE /api/leads/empresas/:id`**: Deletar uma empresa (e seus contatos associados).
    *   **Resposta Esperada:** `204 No Content` ou `404 Not Found`.

*   **`POST /api/leads/empresas/identificar`**: Simular busca e salvamento de empresas (API externa simulada).
    *   **Corpo (exemplo):**
        ```json
        {
          "termoBusca": "Software House",
          "setor": "Tecnologia",
          "localizacao": "Brasil"
        }
        ```
    *   **Resposta Esperada:** `200 OK` com mensagem e resultados da busca/salvamento.

### 1.2. Contatos

*   **`POST /api/leads/empresas/:empresaId/contatos`**: Criar um novo contato para uma empresa.
    *   **Corpo (exemplo):**
        ```json
        {
          "nome": "João Silva",
          "cargo": "Diretor de Compras",
          "departamento": "Compras",
          "email": "joao.silva@empresaexemplo.com.br",
          "telefone": "(11) 99999-8888"
        }
        ```
    *   **Resposta Esperada:** `201 Created` com os dados do contato. A validação de e-mail é simulada.

*   **`GET /api/leads/empresas/:empresaId/contatos`**: Listar todos os contatos de uma empresa.
    *   **Resposta Esperada:** `200 OK` com um array de contatos.

*   **`GET /api/leads/contatos/:id`**: Obter um contato específico pelo ID.
    *   **Resposta Esperada:** `200 OK` com os dados do contato ou `404 Not Found`.

*   **`PUT /api/leads/contatos/:id`**: Atualizar um contato.
    *   **Corpo (exemplo):**
        ```json
        {
          "cargo": "Gerente de Compras Sênior",
          "email": "joao.silva.novo@empresaexemplo.com.br"
        }
        ```
    *   **Resposta Esperada:** `200 OK` com os dados do contato atualizado. Se o e-mail for alterado, a validação é simulada novamente.

*   **`DELETE /api/leads/contatos/:id`**: Deletar um contato.
    *   **Resposta Esperada:** `204 No Content` ou `404 Not Found`.

*   **`POST /api/leads/empresas/:empresaId/extrair-contatos`**: Simular extração e salvamento de contatos para uma empresa (API externa simulada).
    *   **Corpo:** Vazio.
    *   **Resposta Esperada:** `200 OK` com mensagem e resultados da extração/salvamento. E-mails inválidos (simulados) são descartados.

*   **`POST /api/leads/validar-email`**: Simular validação de um e-mail avulso.
    *   **Corpo (exemplo):**
        ```json
        {
          "email": "teste@dominioinexistente123.com"
        }
        ```
    *   **Resposta Esperada:** `200 OK` com o resultado da validação simulada (ex: `{ "email": "teste@dominioinexistente123.com", "status": "invalido", "details": "Simulação: Domínio não parece existir ou e-mail com formato inválido." }`).

## Módulo 2: Campanhas de E-mail (`/api/campaigns`)

### 2.1. Listas de E-mail

*   **`POST /api/campaigns/listas-email`**: Criar uma lista de e-mail.
    *   **Corpo (exemplo):** `{"nome": "Leads Qualificados TI", "descricao": "Lista de contatos de TI para campanhas."}`
*   **`GET /api/campaigns/listas-email`**: Listar todas as listas.
*   **`GET /api/campaigns/listas-email/:id`**: Obter lista por ID.
*   **`PUT /api/campaigns/listas-email/:id`**: Atualizar lista.
*   **`DELETE /api/campaigns/listas-email/:id`**: Deletar lista.
*   **`POST /api/campaigns/listas-email/:listaId/contatos/:contatoId`**: Adicionar contato a uma lista.
*   **`DELETE /api/campaigns/listas-email/:listaId/contatos/:contatoId`**: Remover contato de uma lista.

### 2.2. Templates de E-mail

*   **`POST /api/campaigns/templates-email`**: Criar um template.
    *   **Corpo (exemplo):** `{"nome": "Template Promocional Q1", "assuntoPadrao": "Oferta Especial!", "corpoHtml": "<h1>Olá {{NOME_CONTATO}}!</h1><p>Confira nossa oferta...</p>", "tipo": "promocional"}`
*   **`GET /api/campaigns/templates-email`**: Listar templates.
*   **`GET /api/campaigns/templates-email/:id`**: Obter template por ID.
*   **`PUT /api/campaigns/templates-email/:id`**: Atualizar template.
*   **`DELETE /api/campaigns/templates-email/:id`**: Deletar template.

### 2.3. Campanhas de E-mail

*   **`POST /api/campaigns/campanhas-email`**: Criar uma campanha.
    *   **Corpo (exemplo):** (Use IDs existentes de lista e template)
        ```json
        {
          "nome": "Campanha de Lançamento Produto X",
          "assunto": "Novo Produto X Chegou!",
          "remetenteEmail": "marketing@suaempresa.com",
          "listaEmailId": 1,
          "templateEmailId": 1,
          "dataAgendamento": "2025-06-01T10:00:00.000Z"
        }
        ```
*   **`GET /api/campaigns/campanhas-email`**: Listar campanhas.
*   **`GET /api/campaigns/campanhas-email/:id`**: Obter campanha por ID (inclui envios e métricas simuladas após envio).
*   **`PUT /api/campaigns/campanhas-email/:id`**: Atualizar campanha.
*   **`DELETE /api/campaigns/campanhas-email/:id`**: Deletar campanha.
*   **`POST /api/campaigns/campanhas-email/:id/enviar`**: Simular envio de uma campanha (mesmo que agendada, envia imediatamente para teste).
    *   **Resposta Esperada:** `200 OK` com a campanha atualizada (status "enviada", métricas simuladas).

## Módulo 3: Postagens em Redes Sociais (`/api/social`)

### 3.1. Contas de Redes Sociais

*   **`POST /api/social/contas-sociais`**: Conectar uma conta (simulado).
    *   **Corpo (exemplo):**
        ```json
        {
          "tipo": "X",
          "idUsuarioPlataforma": "user_twitter_123",
          "nomeUsuario": "@suaempresaX",
          "accessToken": "TOKEN_SIMULADO_X"
        }
        ```
        Ou para Facebook:
        ```json
        {
          "tipo": "FACEBOOK",
          "idUsuarioPlataforma": "page_facebook_456",
          "nomeUsuario": "Sua Empresa Página",
          "accessToken": "TOKEN_SIMULADO_FB"
        }
        ```
*   **`GET /api/social/contas-sociais`**: Listar contas conectadas.
*   **`GET /api/social/contas-sociais/:id`**: Obter conta por ID.
*   **`DELETE /api/social/contas-sociais/:id`**: Desconectar conta (simulado).

### 3.2. Postagens em Redes Sociais

*   **`POST /api/social/postagens-sociais`**: Criar uma postagem (rascunho ou agendada).
    *   **Corpo (exemplo):** (Use ID de uma conta social conectada)
        ```json
        {
          "contaRedeSocialId": 1,
          "textoConteudo": "Grande novidade chegando esta semana! #inovacao",
          "midiaUrl": "http://link.para/imagem_ou_video.jpg",
          "dataAgendamento": "2025-05-20T15:00:00.000Z"
        }
        ```
*   **`GET /api/social/postagens-sociais/conta/:contaId`**: Listar postagens de uma conta.
*   **`GET /api/social/postagens-sociais`**: Listar todas as postagens.
*   **`GET /api/social/postagens-sociais/:id`**: Obter postagem por ID.
*   **`PUT /api/social/postagens-sociais/:id`**: Atualizar postagem.
*   **`DELETE /api/social/postagens-sociais/:id`**: Deletar postagem.
*   **`POST /api/social/postagens-sociais/:id/publicar`**: Simular publicação imediata de uma postagem (mesmo que agendada).
*   **`POST /api/social/scheduler/processar-postagens`**: Simular o acionamento do agendador para publicar postagens pendentes.
    *   **Observação:** Para testar o agendamento, crie uma postagem com `dataAgendamento` no passado ou próximo do presente e chame esta rota.

## Módulo 4: Geração de Vídeos e Shorts (`/api/videos`)

### 4.1. Media Assets (Ativos de Mídia)

*   **`POST /api/videos/media-assets`**: Fazer upload de um ativo de mídia (simulado).
    *   **Tipo de Requisição:** `multipart/form-data`
    *   **Campos:**
        *   `mediafile`: O arquivo em si (ex: imagem.jpg, logo.png, video_curto.mp4).
        *   `nome`: Nome do asset (string).
        *   `tipo`: Tipo do asset (Enum: `IMAGEM`, `VIDEO_CURTO`, `AUDIO`, `LOGO`).
        *   `formato` (opcional): ex: "jpg".
    *   **Resposta Esperada:** `201 Created` com os dados do asset.

*   **`GET /api/videos/media-assets`**: Listar todos os ativos.
*   **`GET /api/videos/media-assets/:id`**: Obter ativo por ID.
*   **`DELETE /api/videos/media-assets/:id`**: Deletar ativo (simula deleção do arquivo).

### 4.2. Templates de Vídeo

*   **`POST /api/videos/video-templates`**: Criar um template de vídeo.
    *   **Corpo (exemplo):** (Use IDs de `MediaAsset` existentes para `assetIds` se aplicável)
        ```json
        {
          "nome": "Template Promocional Simples",
          "descricao": "Template para vídeos curtos de promoção com logo e texto.",
          "duracaoSegundos": 15,
          "formato": "9:16",
          "estruturaJson": {
            "backgroundAssetId": null,
            "overlayTextPlaceholder": "Seu texto aqui",
            "logoAssetId": 1
          },
          "assetIds": [1] 
        }
        ```
*   **`GET /api/videos/video-templates`**: Listar templates.
*   **`GET /api/videos/video-templates/:id`**: Obter template por ID.
*   **`PUT /api/videos/video-templates/:id`**: Atualizar template.
*   **`DELETE /api/videos/video-templates/:id`**: Deletar template.

### 4.3. Vídeos Gerados

*   **`POST /api/videos/videos-gerados`**: Solicitar a geração de um vídeo a partir de um template.
    *   **Corpo (exemplo):** (Use ID de `VideoTemplate` e `MediaAsset` existentes)
        ```json
        {
          "videoTemplateId": 1,
          "nomePersonalizado": "Vídeo Promoção Dia das Mães",
          "dadosPersonalizacao": {
            "overlayTextPlaceholder": "Feliz Dia das Mães! Oferta Especial!",
            "backgroundAssetId": 2 
          },
          "assetIds": [2] 
        }
        ```
    *   **Resposta Esperada:** `202 Accepted` com os dados do vídeo gerado (status inicial `PENDENTE`). A geração é simulada de forma assíncrona.

*   **`GET /api/videos/videos-gerados`**: Listar todos os vídeos gerados.
*   **`GET /api/videos/videos-gerados/:id`**: Obter vídeo gerado por ID. Verifique o `status` e `urlVideoFinal` (após simulação de processamento).
*   **`POST /api/videos/videos-gerados/:id/retry`**: Tentar reprocessar um vídeo que falhou.
    *   **Resposta Esperada:** `202 Accepted` se o vídeo estava com status `FALHOU`.
*   **`DELETE /api/videos/videos-gerados/:id`**: Deletar vídeo gerado (simula deleção do arquivo).

## Próximos Passos

Após testar o backend, podemos discutir:
1.  Feedback sobre a API e funcionalidades.
2.  Prioridades para o desenvolvimento do frontend em React + TypeScript.
3.  Estratégia para integração com a API do WhatsApp (que geralmente requer aprovação e configuração específica).
4.  Substituição das simulações por integrações reais com serviços de e-mail, APIs de redes sociais e ferramentas de geração de vídeo.

Lembre-se de iniciar o servidor backend (`npm run dev` ou similar no diretório `/home/ubuntu/agente_vendas_backend`) antes de realizar os testes.

