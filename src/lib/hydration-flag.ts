/* eslint-disable prettier/prettier */
// src/lib/hydration-flag.ts
// Mantém-se `false` durante o SSR e a primeira renderização no cliente,
// para o conteúdo acima da dobra sair do servidor já visível (sem
// opacity:0). Passa a `true` depois da primeira hidratação, para
// navegações seguintes dentro da SPA continuarem a ter a animação de entrada.
export const hasHydratedOnce = { current: false };
