# CRM QuimeraTech - Roadmap e Plano de Implementação

Este documento detalha as etapas de finalização do CRM, priorizadas por impacto e dependências técnicas.

## 📌 Prioridades Imediatas (Bloqueadores)
1. **Segurança e Acesso**: Sem o middleware e SSO, o CRM está vulnerável ou inacessível.
2. **Ciclo de Vida da Lead**: Converter leads em projetos é o "core" da automação esperada.
3. **Integração Google Drive**: Ativar a gestão de ficheiros para centralizar documentos.

---

## 🗓️ Plano de Implementação por Etapas

### Etapa 1: Fundação e Segurança (Concluída ✅)
- [x] **Middleware de Proteção**: Implementado `context.supabase.rpc` para verificação de admin em todas as `createServerFn`.
- [x] **Segurança das Funções**: Aplicado `requireAdmin` logic em `src/lib/crm.functions.ts`.
- [x] **Auth & Roles**: Configurar Google SSO no backend. (Estrutura pronta, aguarda credenciais)
- [ ] **Verificação de Secrets**: Validar conexão com as chaves do Google Drive. (Ação do Utilizador)

### Etapa 2: Automação e Conversão (Em Progresso ⏳)
- [x] **UI de Gestão de Leads**: Criado `/admin/leads` com modal de criação e troca de estados.
- [x] **Motor de Conversão**: Implementada função `convertLeadToProject`.
- [x] **Listagem de Projetos**: Criada rota `/admin/projects` (básica).
- [ ] **Automação Drive**: Ligar a criação de pastas no Drive (requer secrets configurados).


### Etapa 3: Gestão de Projetos e Ficheiros (Dia 4)
*Foco: Operação e entrega.*
- [ ] **Dashboard de Projetos**: Criar `/admin/projects` com lista de projetos ativos e estados.
- [ ] **Explorador de Ficheiros**: Integrar a visualização de documentos do Drive dentro de cada projeto.
- [ ] **Upload de Propostas**: Permitir subir PDFs diretamente para o Drive via CRM.
- **Dependência**: Etapa 2 (pastas criadas no Drive).

### Etapa 4: Inteligência Financeira e Dashboards (Dia 5)
*Foco: Gestão de contas e rentabilidade.*
- [ ] **Módulo Financeiro**: Interface `/admin/finances` para registo de entradas e saídas.
- [ ] **Cálculo de Margem**: Ligar custos a projetos para ver o lucro real.
- [ ] **Visualização Avançada**: Gráfico de funil de vendas e MRR no dashboard principal.
- **Dependência**: Estrutura de dados de projetos estável.

---

## 🛠️ Resumo de Dependências Técnicas

| Módulo | Depende de | Risco |
| :--- | :--- | :--- |
| **Auth Admin** | Google SSO Config | Alto (Acesso) |
| **Google Drive** | Service Account Secrets | Médio (Integração) |
| **Finanças** | Projetos Criados | Baixo |
| **Conversão Lead** | Tabela crm_projects | Baixo |

---
*Documento atualizado em: 15 de Agosto de 2026*
