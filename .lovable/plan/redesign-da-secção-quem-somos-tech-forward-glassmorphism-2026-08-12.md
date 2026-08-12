# Redesign da Secção "Quem Somos" (Tech-Forward Glassmorphism)

O objetivo é transformar a secção "Quem Somos" numa experiência visual mais impactante, moderna e tecnológica, utilizando uma estética de **Glassmorphism** (efeito de vidro) e profundidade visual, mantendo a acessibilidade e performance.

## Alterações Propostas

### 1. Estrutura e Layout
- Substituir o layout de card único por uma composição mais dinâmica.
- Introduzir um fundo com gradientes suaves e formas orgânicas animadas (blur background) para criar profundidade.
- Utilizar painéis com efeito de vidro (backdrop-blur) para o conteúdo principal.

### 2. Estética Visual (Tech-Forward)
- **Efeito de Vidro:** Transparência refinada, bordas sutis brilhantes e desfoque de fundo intenso.
- **Tipografia:** Hierarquia visual melhorada com destaque para palavras-chave em gradiente.
- **Destaques:** Inclusão de pequenos "badges" ou indicadores de métricas/valores da empresa com ícones tecnológicos.

### 3. Animações e Interatividade
- Transições de entrada suaves e coordenadas (staggered animations) usando Framer Motion.
- Efeito de paralaxe suave nos elementos de fundo.
- Respeito integral às preferências de "Movimento Reduzido".

## Detalhes Técnicos
- **Componentes:** Atualização de `src/components/site/About.tsx`.
- **Estilos:** Uso de utilitários Tailwind para `backdrop-blur`, `bg-opacity` e gradientes OKLCH.
- **Acessibilidade:** Garantir contrastes adequados nos textos sobre os fundos transparentes e manter a semântica HTML (H2, P).

O resultado será uma secção que comunica imediatamente "Inovação" e "Tecnologia de Ponta" logo ao primeiro olhar.