# Limpeza e Otimização do CRM

## 1. Segurança e Autenticação (Próxima Etapa)
- [ ] Criar nova rota de autenticação robusta (`/auth`).
- [ ] Implementar middleware `requireSupabaseAuth` em todas as `createServerFn`.
- [ ] Adicionar guardas de rota no TanStack Router para `/admin`.

## 2. Performance e Otimização (Em Progresso)
- [x] Otimizar queries de estatísticas (seleção de colunas específicas).
- [ ] Implementar paginação e filtros de servidor na listagem de leads e projetos.
- [ ] Configurar `staleTime` e `gcTime` globais no `QueryClient`.
- [ ] Implementar prefetching nos loaders das rotas admin.

## 3. Limpeza Técnica
- [x] Consolidar regras de performance na memória do projeto.
- [ ] Remover código morto de `src/lib/animations.ts` e `src/lib/analytics.ts` após refactor.
- [ ] Unificar interfaces TypeScript para evitar duplicação entre frontend e backend.

