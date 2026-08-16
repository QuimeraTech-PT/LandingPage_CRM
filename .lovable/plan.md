# Plano de Implementação: Notificações, Kanban e Alertas Financeiros

Este plano detalha a implementação das melhorias solicitadas no CRM: Notificações (Lark Bot), Kanban para Leads/Projetos e Alertas Financeiros.

## Alterações

### 1. Notificações e Automação (Lark Bot)
- **Extensão do `lark.server.ts`**: Adicionar funções para notificações de CRM:
    - `sendLarkCRMNotification`: Notificar novas leads, conversões e alertas financeiros.
- **Integração no `crm.functions.ts`**:
    - Disparar notificações ao criar leads e converter projetos.
    - Adicionar lógica de verificação de orçamento nas finanças.

### 2. Experiência Kanban (UX)
- **Novo Componente `KanbanBoard.tsx`**: Criar um componente de quadro Kanban reutilizável usando `dnd-kit` ou similar (ou uma implementação simplificada com colunas Tailwind se preferir evitar deps pesadas).
- **Integração nas Páginas**:
    - `/admin/leads`: Adicionar alternância entre vista de Lista e Kanban.
    - `/admin/projects`: Adicionar alternância entre vista de Cards e Kanban por estado.

### 3. Alertas Financeiros
- **Dashboard Principal**: Adicionar um widget de "Alertas Críticos" (ex: Projetos com prejuízo ou margem baixa).
- **Finanças**: 
    - Implementar verificação automática de saldo por projeto.
    - Notificar via Lark se uma despesa colocar o projeto em saldo negativo.

## Detalhes Técnicos

- **Dependências**: Requer `LARK_APP_ID`, `LARK_APP_SECRET` e `LARK_CHAT_ID` configurados nos Secrets do CRM.
- **Segurança**: Todas as novas funções de servidor manterão o middleware `requireAdmin`.
- **UX**: Uso de animações suaves e feedback visual imediato para drag & drop no Kanban.

## Próximos Passos
1. Atualizar `lark.server.ts` com novos tipos de notificação.
2. Modificar `crm.functions.ts` para disparar alertas.
3. Criar e integrar a visualização Kanban nas rotas admin.
4. Adicionar secção de alertas no Dashboard.
