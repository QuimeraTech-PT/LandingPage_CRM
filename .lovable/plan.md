# Plano de Integração Google Drive (Seguro e Incremental)

Este plano detalha a implementação da gestão de ficheiros do Google Drive dentro do CRM da QuimeraTech, mantendo o sistema funcional mesmo sem as credenciais (secrets) configuradas.

## 📌 Objetivos
1.  **Automação**: Criar uma pasta no Drive ao converter uma Lead em Projeto.
2.  **Visualização**: Listar ficheiros do Drive dentro da página de cada projeto.
3.  **Segurança**: Garantir que o CRM não "crasha" se as chaves não estiverem presentes.

## 🛠️ Detalhes Técnicos

### 1. Backend (`src/lib/google-drive.functions.ts`)
*   Reforçar o tratamento de erros em `createProjectFolder` e `listProjectFiles`.
*   Retornar um estado de "Não Configurado" em vez de lançar erros fatais quando faltarem `GOOGLE_SERVICE_ACCOUNT_EMAIL` ou `GOOGLE_PRIVATE_KEY`.

### 2. UI de Gestão de Ficheiros (`src/components/crm/ProjectFiles.tsx`)
*   Criar um novo componente para exibir a lista de ficheiros.
*   Incluir ícones para diferentes tipos de ficheiro (PDF, Doc, Imagem).
*   Adicionar botão para abrir o ficheiro diretamente no Google Drive.
*   **Fallback**: Mostrar uma mensagem amigável "Configuração do Drive Pendente" se as chaves não existirem.

### 3. Integração na Página de Projetos (`src/routes/admin.projects.tsx`)
*   Adicionar uma secção expansível ou um modal para "Ficheiros do Projeto".
*   Garantir que o link para a pasta principal do Drive esteja sempre acessível se o `folderId` existir.

### 4. Fluxo de Conversão (`src/lib/crm.functions.ts`)
*   Manter a chamada assíncrona para criação de pasta durante a conversão de Lead.

## 🗓️ Etapas

1.  **Componente UI**: Criar `ProjectFiles.tsx` com estados de loading e erro.
2.  **Refactor Backend**: Atualizar funções de servidor para serem resilientes a falhas de config.
3.  **Integração UI**: Adicionar o visualizador de ficheiros na lista de projetos.
4.  **Verificação**: Testar o fluxo de erro (sem secrets) para garantir estabilidade.
