# Implementation Plan: Design Tokens, Theme Toggle, Spam Protection, and SEO Optimization

Implement a series of improvements to the landing page and CRM architecture focusing on maintainability, user experience, security, and search engine visibility.

## User-facing changes

- **Theme Toggle**: A new sun/moon icon in the header (next to the accessibility menu) to switch between Light and Dark modes. The choice is saved in the browser.
- **Contact Form Improvements**: 
    - Added "Honeypot" spam protection (invisible to humans, blocks bots).
    - Success/Error messages are more descriptive and persist longer for clarity.
    - Improved validation feedback.
- **SEO & Social**: Better titles and descriptions when sharing the site on LinkedIn, WhatsApp, etc., thanks to rich Open Graph and JSON-LD metadata.

## Technical details

### 1. Design Tokens & Theme Toggle
- Centralize semantic colors in `src/styles.css` using CSS variables (`--color-primary`, `--color-background`, etc.) mapped to Tailwind v4 `@theme`.
- Create `src/components/site/ThemeToggle.tsx` using `lucide-react` icons.
- Update `src/components/site/Header.tsx` to include the toggle.
- Add theme persistence logic in `src/routes/__root.tsx` (inline script for fast execution) to prevent flashing.

### 2. Contact Form & Spam Protection
- Update `src/components/site/Contact.tsx` to include a "honeypot" field.
- Refactor `src/lib/contact.functions.ts` to verify the honeypot field on the server.
- Add specific success/error UI states in the contact form instead of just toasts.

### 3. SEO & Structured Data
- Enhance `src/routes/index.tsx` metadata.
- Ensure unique `head()` metadata for all content routes.
- Verify JSON-LD implementation for Organization, Website, and BreadcrumbList.

## Detailed Steps

1. **Tokens & CSS**: Refactor `src/styles.css` to use a complete set of semantic variables for both Light and Dark themes.
2. **Theme Component**: Create `src/components/site/ThemeToggle.tsx`.
3. **Header Integration**: Add the toggle to `src/components/site/Header.tsx`.
4. **Form Logic**: Update `src/components/site/Contact.tsx` with honeypot and better state management.
5. **Server Verification**: Update `submitContactForm` in `src/lib/contact.functions.ts` to block honeypot-filled submissions.
6. **SEO Refinement**: Polish metadata in `src/routes/index.tsx` and ensure site-wide consistency.
