# Plan: Methodology Detail Card Visual Improvement

Enhance the visual design of the methodology step details card in `src/components/site/Methodology.tsx` to match the high-end tech aesthetic shown in the reference image.

## User Review Required
> [!IMPORTANT]
> The design uses the QuimeraTech brand colors (Midnight background, Cyan/Blue accents). The new layout will reorganize the "What we do" items into a more structured grid and style the checklist items as cohesive cards.

## Proposed Changes

### UI Components
#### `src/components/site/Methodology.tsx`
- Update the step details panel layout to match the reference image.
- Enhance the "O que fazemos" section with clearer numbering and alignment.
- Style the checklist items at the bottom as distinct cards with subtle borders and shadows.
- Refine typography (font sizes, weights, and spacing) for better hierarchy.
- Ensure the dark theme background is consistent with the methodology section's "Midnight" background.

## Technical Details
- Use `framer-motion` for smooth entry animations of grid items.
- Apply Tailwind utility classes for the new grid layout (`grid-cols-2` with appropriate spacing).
- Maintain responsiveness for mobile devices.
