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
- [x] **Listagem de Projetos**: Criada rota `/admin/projects` robusta.
- [x] **Automação Drive**: Estrutura de criação de pastas pronta (resiliente a falta de secrets).
- [ ] **Notificações**: Ligar Lark Bot para alertas de novas leads e projetos.



### Etapa 3: Gestão de Projetos e Ficheiros (Concluída ✅)
- [x] **Dashboard de Projetos**: Criado `/admin/projects` com rentabilidade e estados.
- [x] **Explorador de Ficheiros**: Integrado visualizador de ficheiros do Drive dentro de cada projeto (com fallback).
- [x] **Upload de Propostas**: Fluxo de criação de pastas automatizado na conversão.
- [ ] **Gestão Local**: Permitir drag & drop para o Drive via CRM (requer secrets).


### Etapa 4: Inteligência Financeira e Dashboards (Concluída ✅)
- [x] **Módulo Financeiro**: Interface `/admin/finances` funcional para receitas e despesas.
- [x] **Cálculo de Margem**: Transações associadas a projetos com lucro em tempo real.
- [x] **Visualização Avançada**: Funil de vendas real e atalhos de gestão no dashboard principal.

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
