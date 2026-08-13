# Plano de Implementação: Controle de Micro-interações e Cursor Follower

Este plano visa adicionar uma nova opção no menu de acessibilidade para permitir que os usuários desativem ou ajustem micro-interações (como o cursor follower e animações específicas) de forma independente, garantindo também que o sistema respeite sempre a preferência global de "Movimento Reduzido".

## Alterações

### 1. Backend e Estado
- Adicionar a chave `a11y-interactions` ao `localStorage` para persistir a preferência do usuário.
- Atualizar o componente `AccessibilityMenu` para gerenciar este novo estado (Interações Ativas/Desativadas).
- Adicionar uma classe global `disable-interactions` ao `<html>` quando o usuário desativar as micro-interações.

### 2. Componentes UI
- **AccessibilityMenu.tsx**:
    - Incluir um novo toggle "Micro-interações" com ícone apropriado (ex: `Zap` ou `MousePointer2`).
    - Garantir que, se o "Movimento Reduzido" estiver ativo, as micro-interações também sejam tratadas como desativadas por padrão ou visualmente indicadas como tal.
- **CursorFollower.tsx**:
    - Atualizar a lógica para verificar tanto `shouldReduceMotion` quanto a nova classe CSS/estado de preferência de interações antes de renderizar.

### 3. CSS e Estilos (src/styles.css)
- Implementar a utilidade `disable-interactions` que remove transições e animações específicas de micro-interações (como hover scales, pulses leves) sem quebrar a navegação básica.

### 4. Acessibilidade
- Garantir que o novo controle tenha labels ARIA claros e feedback visual no menu.

## Detalhes Técnicos
- O estado de "Movimento Reduzido" (sistema) continuará a ter precedência. O novo botão permitirá desativar enfeites visuais mesmo que o movimento reduzido não esteja ativo no SO.
- Uso de `useLayoutEffect` para evitar FOUC (Flash of Unstyled Content) nas preferências de interação.
