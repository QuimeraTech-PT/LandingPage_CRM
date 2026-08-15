# Plano de Finalização do CRM QuimeraTech

Este plano foca na conclusão das funcionalidades principais (Stage 3 e 4 do roadmap) para garantir um sistema operacional completo antes de avançar para integrações externas.

## 1. Módulo Financeiro (`/admin/finances`)
- **Backend**: Adicionar `getTransactions`, `createTransaction` e `deleteTransaction` em `crm.functions.ts`.
- **UI**: Criar rota `/admin/finances.tsx` com:
  - Lista de transações (Data, Descrição, Valor, Tipo: Entrada/Saída).
  - Filtro por projeto (para calcular lucro por projeto).
  - Resumo de fluxo de caixa (Total Receitas, Total Despesas, Saldo).
  - Modal para adicionar novas transações.

## 2. Dashboard de Projetos Melhorado
- **Backend**: Atualizar `getProjects` para incluir métricas financeiras (valor total vs custos).
- **UI**: Atualizar `/admin/projects.tsx` para:
  - Mostrar progresso visual (estados: Planeamento -> Ativo -> Concluído).
  - Associar transações financeiras diretamente ao projeto.
  - Exibir rentabilidade estimada por projeto.

## 3. Dashboard Principal e Inteligência
- **UI**: Atualizar `/admin/index.tsx` para:
  - Substituir o placeholder do "Pipeline de Vendas" por um funil real baseado nos estados das leads.
  - Adicionar lista de "Próximas Tarefas/Follow-ups" (leads paradas há mais de 3 dias).
  - Widgets de acesso rápido para as secções mais importantes.

## 4. Segurança e Auditoria
- **Backend**: Implementar um sistema básico de logs para ações críticas (ex: conversão de lead, eliminação de transação).
- **UI**: Adicionar confirmações em todas as ações destrutivas.

---
**Com este plano, o CRM passará de uma ferramenta de registo para um sistema de gestão de negócio completo.**
