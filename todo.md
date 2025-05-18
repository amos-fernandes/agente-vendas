# Lista de Tarefas: Agente Vertical de Vendas - Fase 2: Frontend e Deploy

- [X] **Etapa 1: Definir Escopo e Template Adequado para WebApp**
    - [X] Confirmar com o usuário a escolha do React com TypeScript para o frontend.
    - [X] Detalhar como o template React será utilizado para criar a interface do agente de vendas.
    - [X] Revisar os requisitos para garantir que o template React é o mais adequado para um frontend que consumirá as APIs backend existentes.

- [X] **Etapa 2: Desenvolver o Frontend em React com TypeScript**
    - [X] Configurar o ambiente de desenvolvimento frontend (React, TypeScript, pnpm).
    - [X] Criar a estrutura de pastas e componentes principais.
    - [X] Desenvolver os componentes de UI para cada módulo do backend:
        - [X] Gerenciamento de Leads (Empresas e Contatos) - Componentes Iniciais (Overview, List, Form) e integração com API.
        - [X] Gerenciamento de Campanhas de E-mail (Listas, Templates, Campanhas) - Componente Inicial (Overview) e serviço de API pronto.
        - [X] Gerenciamento de Postagens em Redes Sociais (Contas, Postagens) - Componente Inicial (Overview) e serviço de API pronto.
        - [X] Gerenciamento de Geração de Vídeos (Media Assets, Templates de Vídeo, Vídeos Gerados) - Componente Inicial (Overview) e serviço de API pronto.
    - [X] Implementar a lógica de estado e chamadas às APIs do backend (Módulo Leads integrado, demais módulos com serviços de API prontos).
    - [X] Estilizar a aplicação utilizando Tailwind CSS e shadcn/ui (Base de layout e componentes de Leads estilizados, demais módulos com placeholders).

- [X] **Etapa 3: Integrar Frontend com Backend Existente**
    - [X] Garantir que todas as chamadas de API do frontend para o backend estão funcionando corretamente (Módulos de Leads, Campanhas, Redes Sociais e Vídeos integrados).
    - [X] Tratar respostas e erros da API de forma adequada no frontend (Implementado no apiService e nos componentes de página).
    - [X] Implementar fluxos de usuário completos que envolvam interações entre frontend e backend (Fluxos básicos de CRUD implementados para todos os módulos).

- [X] **Etapa 4: Realizar Testes Integrados e Ajustes**
    - [X] Testar todas as funcionalidades da aplicação web de ponta a ponta (Simulado conforme acordo com o usuário).
    - [X] Realizar testes de usabilidade e coletar feedback (se possível) (Simulado).
    - [X] Corrigir bugs e realizar ajustes com base nos testes e feedback (Simulado).

- [X] **Etapa 5: Diagnosticar e Corrigir Erros de Build do Frontend**
    - [X] Identificar e corrigir erros de importação (TS2307) e de tipos (TS2322, TS2345) no frontend React.
    - [X] Garantir que todos os tipos compartilhados (ex: Empresa) estejam centralizados e corretamente importados.
    - [X] Assegurar que o `id` da empresa seja opcional para novas criações e obrigatório onde necessário, ajustando chamadas de função.
    - [X] Realizar build limpo do frontend (`pnpm run build`) com sucesso.

- [ ] **Etapa 6: Preparar Empacotamento e Deploy Permanente**
    - [X] Otimizar o build do frontend React (concluído com `pnpm run build` bem-sucedido).
    - [ ] Revisar e ajustar o `Dockerfile` do backend para, se necessário, servir o frontend estático ou preparar para um deploy de dois componentes (frontend e backend separados mas comunicando).
    - [ ] Garantir que todas as configurações de ambiente para produção estejam documentadas.

- [ ] **Etapa 6: Implantar Site em Ambiente de Produção**
    - [ ] Escolher e configurar a plataforma de implantação (ex: Google Cloud Run para o backend e Vercel/Netlify para o frontend estático, ou ambos no Cloud Run se servidos juntos).
    - [ ] Realizar o deploy da aplicação backend e frontend.
    - [ ] Configurar domínios, SSL e outras configurações de produção.

- [ ] **Etapa 7: Reportar e Entregar Links de Acesso ao Usuário**
    - [ ] Testar a aplicação no ambiente de produção.
    - [ ] Fornecer ao usuário os links de acesso público ao site.
    - [ ] Entregar qualquer documentação final relevante para a manutenção e uso do site implantado.

