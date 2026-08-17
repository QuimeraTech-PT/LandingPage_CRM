# Plano de Implementação: Kanban, Notificações e Alertas Financeiros

Este plano foca em transformar o CRM numa ferramenta proativa com visualização Kanban e alertas automáticos.

## Alterações

### 1. Servidor e Automação (`src/lib/`)
- **`lark.server.ts`**: 
  - Adicionar `sendLarkCRMNotification(type: 'lead' | 'project' | 'finance', details: any)`.
- **`crm.functions.ts`**:
  - Integrar chamadas de notificação no `createLead`, `convertLeadToProject` e `createTransaction`.
  - Implementar lógica de alerta financeiro: se `type === 'expense'` e `project_id` definido, verificar se despesas totais > receitas totais.

### 2. Interface Kanban
- **`src/components/crm/KanbanBoard.tsx`**: Novo componente utilizando `dnd-kit` para arrastar itens entre colunas de estado.
- **`src/routes/admin.leads.tsx`**: Botão de toggle para alternar entre Tabela e Kanban.
- **`src/routes/admin.projects.tsx`**: Vista Kanban por fase de projeto (Planeamento, Ativo, etc).

### 3. Alertas e Dashboard
- **`src/routes/admin.index.tsx`**:
  - Novo widget "Alertas de Risco" no topo.
  - Listar projetos com rentabilidade negativa ou prazos em risco.

### 4. Gestão de Ficheiros
- **`src/components/crm/ProjectFiles.tsx`**: 
  - Adicionar suporte a `onDrop` para upload visual.

## Detalhes Técnicos
- **Notificações**: Usarão o `LARK_CHAT_ID` principal para centralizar alertas.
- **Kanban**: Persistência imediata no banco de dados após o "drop".

## Próximos Passos
1. Atualizar funções de servidor (Lark + CRM).
2. Criar componente Kanban base.
3. Integrar Kanban nas rotas de Leads e Projetos.
4. Adicionar secção de Alertas no Dashboard.

