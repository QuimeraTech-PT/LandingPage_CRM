# SEO, Performance & Conversion Optimization Plan

## 1. Performance & Core Web Vitals
- **Image Optimization**: Ensure hero images use `loading="eager"` and `fetchpriority="high"`. Add `webp` variants where possible.
- **Code Splitting**: Maintain current lazy loading of site sections.
- **Asset Preloading**: Preload critical fonts and the main logo.
- **Script Optimization**: Review GTM/GA4 loading to ensure it doesn't block the main thread.

## 2. A/B Testing & Conversion (CRO)
- **CTA Variations**: Define secondary CTAs for different scroll depths.
- **Form UX**: Implement real-time validation feedback (already partially done, will refine).
- **Social Proof**: Enhance visibility of "Pillars" and "Methodology" as trust signals.

## 3. Advanced Tracking
- **Conversion Goals**: Ensure `hero_cta_click`, `contact_form_submit`, and `outbound_click` are correctly mapped in GA4.
- **Scroll Tracking**: Implement events for 25%, 50%, 75%, and 100% scroll depth to measure engagement.

## 4. Accessibility Audit (WCAG)
- **Keyboard Navigation**: Verify focus traps in modals/menus.
- **Contrast**: Ensure all text meets AA/AAA standards (especially in Light Theme).
- **Alt Text**: Audit all decorative vs. functional images.

## Technical Tasks
- Update `src/lib/analytics.ts` with scroll tracking.
- Refine `src/components/site/Hero.tsx` with fetch priority.
- Update `src/routes/__root.tsx` with font preloading.
