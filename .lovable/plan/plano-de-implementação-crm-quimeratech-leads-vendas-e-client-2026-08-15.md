# Plano de Implementação: CRM QuimeraTech (Leads, Vendas e Clientes)

Implementação de um CRM interno robusto para gestão de leads, clientes, projetos e finanças, com integração automatizada com Google Drive e autenticação via Google SSO.

## 1. Infraestrutura e Base de Dados (Supabase)
*   **Tabelas de CRM**:
    *   `crm_leads`: Armazenar leads vindos do site e manuais (Nome, Email, Telefone, Origem, Estado, Valor Estimado).
    *   `crm_projects`: Converter leads em projetos ativos (Datas, Cliente, Estado do Projeto).
    *   `crm_finances`: Fluxo de caixa detalhado (Receitas, Despesas, Pagamentos Parciais/Milestones).
    *   `crm_documents`: Mapeamento de ficheiros e pastas do Google Drive por Lead/Projeto.
*   **Segurança**: RLS configurado para acesso exclusivo ao admin (via `user_roles`).

## 2. Autenticação e Integração Google
*   **Google SSO**: Configurar Supabase Auth com Google Provider para login seguro.
*   **Integração Google Drive (Server-Side)**:
    *   Utilizar `google-auth-library` e `googleapis` em Server Functions.
    *   Criar pastas automatizadas no Drive ao converter um lead para projeto (Estrutura: `QuimeraTech/Clientes/[Nome_Cliente]/[Projeto]`).
    *   Implementar upload direto para o Drive via interface do CRM.

## 3. Interface Administrativa (Dashboard)
*   **Pipeline de Vendas**: Vista Kanban ou Lista para arrastar leads entre estados (Novo -> Contactado -> Proposta -> Fechado/Perdido).
*   **Vista Financeira**: Dashboards com indicadores (MRR, Total Faturado, Pagamentos Pendentes, Margem de Lucro).
*   **Ficha do Cliente**: Histórico completo de interações, documentos anexados e estados financeiros.

## 4. Integração com Site Existente
*   Atualizar a Server Function de contacto para inserir leads automaticamente na tabela `crm_leads`.

## Detalhes Técnicos
*   **Frontend**: React (React Query para dados do CRM, Lucide para ícones, Tailwind/Shadcn para UI).
*   **Backend**: TanStack Start Server Functions para lógica pesada e API do Google Drive.
*   **Ficheiros**: Alojamento de ficheiros críticos no Google Drive (via Service Account ou OAuth).
*   **Rotas**: Proteção de rotas `/admin/*` via middleware de autenticação.

---

### Próximos Passos (Após Aprovação):
1. Criar migrações de base de dados para o CRM.
2. Configurar o middleware de autenticação e rotas protegidas.
3. Desenvolver o dashboard inicial de leads.
4. Implementar a ponte com a API do Google Drive.
