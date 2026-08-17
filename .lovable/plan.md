# Landing Page Optimization Plan

Enhancing QuimeraTech's landing page to a "top level" standard by refining visual impact, performance, and conversion signals.

## User Review Required

> [!IMPORTANT]
> This plan focuses on high-end visual refinements and technical optimizations. Should we prioritize the interactive Portfolio section first, or focus on the current section enhancements?

- **Visual Theme**: Does the current "Midnight/Blue/Cyan" palette meet the "top level" expectation, or should we introduce a more sophisticated dark theme with deeper grays?
- **Interactions**: Should the cursor follower be more reactive (e.g., expanding into a spotlight) or stay minimal?

## Proposed Changes

### Visual & Interactive Refinement
- **Glassmorphism 2.0**: Update `src/styles.css` to use more refined backdrop-blur values and subtle border gradients for a cleaner "glass" look.
- **Micro-Interactions**: Add subtle hover animations to all cards using `framer-motion` (e.g., slight lift + glowing border).
- **Cursor Follower Upgrade**: Enhance `src/components/site/CursorFollower.tsx` with a "magnetic" effect near buttons and links.

### Performance & SEO
- **Image Optimization**: Ensure all image assets use `loading="lazy"` (except Hero) and suggest/implement WebP fallbacks where possible.
- **Semantic SEO**: Update `src/lib/seo.ts` with more specific meta descriptions for service sections.

### Content & Layout
- **Portfolio Preview**: Create a new `src/components/site/Portfolio.tsx` section showing high-quality project mockups.
- **Social Proof**: Add a "Trusted By" or "Technology Stack" ticker to build immediate credibility.

## Technical Details

- **Tailwind v4**: Using theme variables for consistent translucency.
- **Framer Motion**: Leveraging `useSpring` for smoother interaction responsiveness.
- **Next-Gen Images**: Utilizing `.asset.json` capabilities for optimized loading.
