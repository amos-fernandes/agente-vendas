# Especificação de Funcionalidades: Módulo de Captura de Leads

## 1. Objetivo

Este módulo é responsável por identificar e coletar informações de empresas com grandes folhas de pagamento, focando na obtenção de e-mails de contato dos departamentos de compras e diretorias. Esses leads serão a base para as campanhas de vendas e marketing.

## 2. Funcionalidades Principais

### 2.1. Identificação de Empresas Alvo

*   **Descrição:** O sistema deverá permitir a busca e identificação de empresas que se enquadrem no critério de "grandes folhas de pagamento".
*   **Fontes de Dados Potenciais:**
    *   **APIs de Dados Empresariais:** Integração com serviços como Clearbit, ZoomInfo, Apollo.io, ou similares (avaliar custos e disponibilidade de dados para o mercado brasileiro).
    *   **Bancos de Dados Públicos:** Utilização de informações de fontes abertas, como portais de transparência (se aplicável e legal), notícias sobre investimentos e expansões de empresas.
    *   **Web Scraping (com cautela):** Extração de dados de sites de notícias de negócios, perfis de empresas em plataformas profissionais (ex: LinkedIn, respeitando os termos de serviço e limites de taxa).
    *   **Entrada Manual/Importação:** Permitir que o usuário adicione empresas manualmente ou importe listas (ex: CSV).
*   **Critérios de Busca (Frontend):**
    *   Filtros por setor de atuação.
    *   Filtros por localização (cidade, estado, país).
    *   Filtros por estimativa de número de funcionários (como proxy para folha de pagamento).
    *   Palavras-chave relacionadas a notícias de crescimento, contratação em massa, etc.
*   **Processamento (Backend):**
    *   Orquestrar chamadas às APIs de dados ou executar scripts de scraping.
    *   Normalizar e agregar dados de múltiplas fontes.
    *   Implementar lógica para estimar o "tamanho da folha de pagamento" com base nos dados disponíveis (ex: número de funcionários, receita anual, setor).

### 2.2. Extração de E-mails de Contato (Compras e Diretoria)

*   **Descrição:** Uma vez identificada a empresa alvo, o sistema tentará encontrar os e-mails de contato dos decisores relevantes.
*   **Métodos de Extração:**
    *   **APIs de Enriquecimento de Contatos:** Utilizar as mesmas APIs de dados empresariais (Clearbit, ZoomInfo, etc.) que geralmente oferecem funcionalidades de busca de contatos por cargo/departamento.
    *   **Ferramentas de Busca de E-mail:** Integração com ferramentas como Hunter.io, Snov.io, Skrapp.io (avaliar custos).
    *   **Padrões de E-mail Comuns:** Tentar construir e-mails com base em padrões conhecidos da empresa (ex: nome.sobrenome@empresa.com, inicial_nome.sobrenome@empresa.com) e verificar sua validade (ver seção 2.3).
    *   **Web Scraping (com cautela):** Buscar e-mails em páginas de "contato", "sobre nós", "equipe" dos sites das empresas.
*   **Critérios de Busca de Contatos:**
    *   Cargos: Diretor de Compras, Gerente de Compras, Head de Suprimentos, CFO, CEO, Diretor Financeiro, etc.
    *   Departamentos: Compras, Financeiro, Diretoria Executiva.
*   **Processamento (Backend):**
    *   Gerenciar as chamadas às APIs de busca de e-mail.
    *   Aplicar heurísticas para identificar os contatos mais relevantes.

### 2.3. Validação de E-mails

*   **Descrição:** Garantir a qualidade dos e-mails coletados para aumentar a taxa de entrega das campanhas.
*   **Métodos de Validação:**
    *   **Verificação de Sintaxe:** Checar se o e-mail possui um formato válido.
    *   **Verificação de DNS (MX Records):** Confirmar se o domínio do e-mail existe e possui registros de servidor de e-mail.
    *   **Verificação SMTP (Ping):** Tentar uma conexão SMTP para verificar se o servidor de e-mail reconhece o endereço (com cuidado para não ser bloqueado).
    *   **Serviços de Validação de E-mail:** Integração com APIs como ZeroBounce, NeverBounce, Kickbox (avaliar custos).
*   **Processamento (Backend):**
    *   Implementar um fluxo de validação em etapas.
    *   Marcar e-mails como válidos, inválidos ou arriscados.

### 2.4. Armazenamento de Leads

*   **Descrição:** Os dados das empresas e contatos coletados devem ser armazenados de forma organizada e segura.
*   **Estrutura de Dados (Exemplo - Banco de Dados Relacional):
    *   **Tabela `Empresas`:** ID, Nome, Setor, Localização, Nº Funcionários (estimado), Website, Fonte da Informação, Data de Criação, Data de Atualização.
    *   **Tabela `Contatos`:** ID, ID_Empresa (FK), Nome, Cargo, Departamento, E-mail, Status_Email (verificado, inválido, etc.), Telefone (se disponível), Fonte do Contato, Data de Criação, Data de Atualização.
*   **Segurança:** Conforme definido no documento de arquitetura (criptografia de dados sensíveis, se houver).

### 2.5. Interface do Usuário (Frontend)

*   **Visualização de Leads:** Listagem de empresas e contatos com filtros e ordenação.
*   **Busca de Empresas:** Formulário com os critérios de busca definidos em 2.1.
*   **Detalhes da Empresa/Contato:** Visualização completa das informações de um lead específico.
*   **Ações Manuais:** Adicionar/editar/excluir empresas e contatos.
*   **Importação/Exportação:** Funcionalidade para importar listas de empresas/contatos (CSV) e exportar os dados coletados.
*   **Status da Coleta:** Feedback visual sobre o progresso da busca e extração de informações.

## 3. Integrações

*   **APIs de Dados Empresariais e de Contatos:** Conforme selecionado (ex: Clearbit, ZoomInfo, Hunter.io).
*   **Serviços de Validação de E-mail:** Conforme selecionado (ex: ZeroBounce).
*   **Backend API:** Para todas as operações de CRUD e processamento de lógica de negócios.

## 4. Considerações Técnicas

*   **Gerenciamento de API Keys:** Armazenamento seguro das chaves de acesso para serviços externos.
*   **Rate Limiting:** Respeitar os limites de uso das APIs externas para evitar bloqueios.
*   **Processamento Assíncrono:** As tarefas de busca e extração de dados podem ser demoradas e devem ser executadas em background para não bloquear a interface do usuário.
*   **Tratamento de Erros:** Implementar um sistema robusto de tratamento de erros para lidar com falhas nas APIs externas ou durante o scraping.
*   **Custos:** Monitorar o uso de APIs pagas para controlar os custos.
*   **Conformidade Legal e Ética:** Especialmente para web scraping, garantir a conformidade com os termos de serviço dos sites e as leis de proteção de dados (LGPD).

## 5. Fluxo de Trabalho do Usuário (Exemplo)

1.  O usuário acessa o módulo de "Captura de Leads".
2.  Define os critérios de busca para empresas (setor, tamanho, etc.).
3.  O sistema inicia a busca (via APIs ou scraping) em background.
4.  As empresas encontradas são listadas na interface.
5.  O usuário seleciona uma ou mais empresas para a extração de contatos.
6.  O sistema busca os e-mails de compras/diretoria para as empresas selecionadas.
7.  Os e-mails encontrados são validados.
8.  Os contatos válidos são armazenados e exibidos na interface, associados às suas respectivas empresas.
9.  O usuário pode visualizar, editar ou exportar os leads coletados.

