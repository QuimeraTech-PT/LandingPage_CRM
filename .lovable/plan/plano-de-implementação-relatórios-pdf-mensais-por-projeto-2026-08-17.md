# Plano de Implementação: Relatórios PDF Mensais por Projeto

Este plano detalha a implementação da funcionalidade de geração de relatórios PDF para projetos no CRM da QuimeraTech, com foco em controlo financeiro e alertas.

## O que será construído

### 1. Componente de Relatório PDF (`src/components/crm/ProjectReport.tsx`)
*   Um componente que renderiza um template HTML escondido desenhado para exportação.
*   Incluirá:
    *   Logotipo e branding da QuimeraTech.
    *   Resumo do Projeto: Nome, Cliente, Estado, Datas.
    *   **Dashboard Financeiro**: Gráficos simples ou tabelas de Orçamento vs. Despesas e Margem Atual.
    *   **Breakdown por Categoria**: Tabela detalhada de gastos por categoria (Software, Hardware, Consultoria, etc.).
    *   **Sistema de Alertas**: Indicadores visuais (ícones/cores) quando o orçamento total ou de uma categoria específica é ultrapassado.
*   Integração com `html2pdf.js` para download imediato.

### 2. Integração na UI de Projetos (`src/routes/admin.projects.tsx`)
*   Adição de um botão "Gerar Relatório" em cada cartão de projeto.
*   O botão abrirá um menu ou disparará o download do relatório do mês corrente/total.

### 3. Lógica de Agregação de Dados
*   Cálculo em tempo real das despesas agrupadas por categoria para o projeto selecionado.
*   Comparação inteligente com o orçamento (se definido).

## Detalhes Técnicos

### Estrutura do Relatório
```text
[QuimeraTech] Relatório de Projeto - Agosto 2026
------------------------------------------------
Projeto: [Nome] | Cliente: [Lead] | Margem: [X%]

RESUMO FINANCEIRO:
- Orçamento Total: 10.000€
- Despesas Totais: 8.500€
- Alerta: [OK / EM RISCO / ULTRAPASSADO]

CATEGORIAS:
- Infraestrutura: 2.000€ / 1.500€ (!!! EXCEDIDO)
- Licenças: 500€ / 1.000€ (OK)
...
```

### Bibliotecas
*   `html2pdf.js`: Para converter o DOM React em PDF de alta qualidade.
*   `lucide-react`: Para os ícones de alerta e status.

## Próximos Passos
1. Criar o componente `ProjectReport`.
2. Adicionar a ação de download na página de projetos.
3. Testar a geração com dados reais de transações.
