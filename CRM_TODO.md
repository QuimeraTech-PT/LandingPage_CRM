# CRM QuimeraTech - Lista de Tarefas (TODO)

Este documento centraliza as funcionalidades pendentes e melhorias necessárias para o CRM QuimeraTech, com foco em Leads, Projetos, Finanças e Integração com Google Drive.

## 🏗️ Infraestrutura e Core
- [ ] **Middleware de Segurança**: Implementar o middleware `requireAdmin` em todas as `createServerFn` do CRM para garantir que apenas utilizadores com `role = 'admin'` acedam aos dados.
- [ ] **Gestão de Roles UI**: Interface para gerir quais os utilizadores que têm acesso de administrador (atualmente manual via base de dados).
- [ ] **Auditoria**: Registar quem alterou o quê (ex: quando uma lead muda de estado ou um projeto é criado).

## 📈 Dashboard Administrativo (`/admin`)
- [ ] **Pipeline de Vendas (Funil)**: Substituir o placeholder por um gráfico real que mostre a distribuição de leads por estado.
- [ ] **Feed de Atividade**: Lista de últimas leads e ações recentes no dashboard inicial.
- [ ] **Indicadores Financeiros Dinâmicos**: Filtros por período (mês, trimestre, ano) para os cards de receita e lucro.

## 👥 Gestão de Leads (`/admin/leads`)
- [ ] **Formulário de "Nova Lead"**: Implementar a modal para adicionar leads manualmente com validação Zod.
- [ ] **Edição de Leads**: Permitir alterar o estado, valor estimado e notas de uma lead existente.
- [ ] **Conversão para Projeto**: Botão "Converter em Projeto" que:
  - Cria um registo na tabela `crm_projects`.
  - Despoleta a criação automática da pasta no Google Drive.
  - Muda o estado da lead para `closed_won`.

## 📁 Projetos e Google Drive (`/admin/projects`) - *Pendente*
- [ ] **Listagem de Projetos**: Criar a rota `/admin/projects` para gerir os projetos ativos.
- [ ] **Integração Drive UI**:
  - Exibir a lista de ficheiros do Drive dentro da ficha do projeto (usando `listProjectFiles`).
  - Botão para abrir a pasta diretamente no Google Drive.
  - Funcionalidade de Upload direto do CRM para a pasta do projeto.
- [ ] **Milestones do Projeto**: Definir etapas e datas de entrega.

## 💰 Finanças (`/admin/finances`) - *Pendente*
- [ ] **Gestão de Transações**: Interface para adicionar receitas (pagamentos de clientes) e despesas (custos operacionais).
- [ ] **Associação a Projetos**: Ligar transações a projetos específicos para calcular a rentabilidade real por projeto.
- [ ] **Geração de Propostas/Recibos**: (Opcional) Automação de documentos simples.

## 🛠️ Configurações Necessárias (Ação do Utilizador)
- [ ] **Secrets do Google**: Garantir que as variáveis `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` e `GOOGLE_DRIVE_ROOT_FOLDER_ID` estão configuradas no painel do Lovable.
- [ ] **SSO do Google**: Configurar o provedor Google no Supabase Auth para permitir o login administrativo.

---
*Última atualização: 15 de Agosto de 2026*
