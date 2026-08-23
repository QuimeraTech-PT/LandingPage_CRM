# Plano de Implementação: Autenticação CRM (Dev & Prod)

Este plano detalha a implementação do sistema de login para o CRM da QuimeraTech, com suporte a impersonificação em ambiente de desenvolvimento e Google OAuth em produção.

## Alterações Propostas

### 1. Infraestrutura de Autenticação
- Restaurar e configurar rotas de autenticação:
  - `/auth`: Página de login unificada.
  - `/auth/callback`: Endpoint para processar o retorno do Google OAuth.
- Reativar middlewares de segurança:
  - `attachSupabaseAuth`: Middleware de cliente para anexar tokens.
  - `requireSupabaseAuth`: Middleware de servidor para validar sessões.
- Configurar guardas de rota no arquivo `src/routes/admin.tsx` e sub-rotas.

### 2. Fluxo de Login (DEV vs PROD)
- **Em Desenvolvimento (DEV):**
  - Botão "Impersonar Desenvolvedor" que realiza login automático com um utilizador de teste (ex: dev@quimeratech.pt).
  - Facilita o desenvolvimento rápido sem necessidade de tokens reais.
- **Em Produção (PROD):**
  - Apenas Google OAuth disponível.
  - Obrigatório para garantir acesso ao Google Drive (tokens de utilizador).

### 3. Integração com o CRM e Funções de Servidor
- Migrar funções em `src/lib/crm.functions.ts` e `src/lib/google-drive.functions.ts` de `supabaseAdmin` para `context.supabase`.
- Garantir que as atividades sejam registadas com o `userId` real do utilizador autenticado.

### 4. Interface do Utilizador
- Criar um componente de login moderno seguindo o design system QuimeraTech (Midnight/Cyan).
- Adicionar suporte a estados de carregamento e feedback de erro.

## Detalhes Técnicos

### Ficheiros a Criar/Modificar
- `src/routes/auth.tsx`: Nova página de login.
- `src/routes/auth.callback.tsx`: Manipulador de OAuth.
- `src/routes/admin.tsx`: Adicionar `beforeLoad` para proteger a rota.
- `src/start.ts`: Registrar `attachSupabaseAuth` no `functionMiddleware`.
- `src/lib/crm.functions.ts`: Adicionar `.middleware([requireSupabaseAuth])` em todas as funções.
- `src/lib/google-drive.functions.ts`: Mesma proteção e uso do cliente autenticado.

### Dependências
- `import.meta.env.DEV` para detetar o ambiente.
- Supabase Auth (Google Provider).
