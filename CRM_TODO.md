# Limpeza e Otimização do CRM

## 1. Segurança e Autenticação (Prioridade Alta)
- [ ] Criar nova rota de autenticação robusta (`/auth`).
- [ ] Implementar middleware `requireSupabaseAuth` em todas as `createServerFn` do CRM.
- [ ] Adicionar guardas de rota no TanStack Router para o subdiretório `/admin`.
- [ ] Configurar tabelas de roles (`user_roles`) conforme as diretrizes de segurança.

## 2. Performance e Core Web Vitals
- [ ] Otimizar imagens do site para formatos modernos (WebP/AVIF).
- [ ] Implementar `React.lazy` para componentes pesados no dashboard (Gráficos, Kanban).
- [ ] Refinar os Skeletons para garantir zero Cumulative Layout Shift (CLS) em todas as resoluções.
- [ ] Auditar o bundle size e remover dependências não utilizadas.

## 3. Limpeza de Código
- [ ] Remover logs de debug e comentários redundantes.
- [ ] Padronizar tratamento de erros com um utilitário global.
- [ ] Migrar lógica de negócio complexa de dentro dos componentes para as `functions.ts`.
- [ ] Unificar tipos TypeScript em ficheiros `.d.ts` ou módulos compartilhados.

## 4. Melhorias UX/UI
- [ ] Implementar Drag & Drop para o Kanban de projetos.
- [ ] Adicionar feedback visual instantâneo (optimistic updates) em ações de leads.
- [ ] Refinar as pré-visualizações do Google Drive para suportar mais formatos.
- [ ] Melhorar a acessibilidade do Dashboard para leitores de ecrã.
