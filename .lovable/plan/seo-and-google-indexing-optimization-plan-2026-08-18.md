# SEO and Google Indexing Optimization Plan

Improve search engine visibility, indexing, and overall SEO health for QuimeraTech by optimizing metadata, technical structure, and rich snippets.

## User Review Required

> [!IMPORTANT]
> - Ensure you have a favicon set up (currently using default).
> - Google Search Console verification might require adding a meta tag or DNS record which I can't do without the specific code from you.

## Proposed Changes

### Technical SEO & Indexing
- **Robots.txt & Sitemap:** Synchronize `robots.txt` and `sitemap.xml` to ensure all relevant pages are indexed and API routes are properly ignored.
- **Canonical Tags:** Ensure every page has a self-referencing canonical URL to prevent duplicate content issues.
- **Language Tags:** Refine `hreflang` implementation for the Portuguese market.
- **Lazy Loading Strategy:** Verify that lazy-loaded components don't block search engine crawlers.

### Rich Snippets & Metadata
- **JSON-LD Schema:** 
    - Enhance `Organization` schema with specific service offerings.
    - Add `ProfessionalService` or `LocalBusiness` schema if a physical office is relevant.
    - Add `SoftwareApplication` schema for specific project types (CRM, etc.).
    - Implement `FAQ` schema for common service questions.
- **Meta Descriptions:** Refine descriptions across all pages to include primary keywords naturally and improve CTR.
- **Open Graph & Twitter:** Ensure high-quality OG images are referenced correctly with absolute URLs.

### Accessibility & Performance
- **Alt Text:** Audit and improve `alt` text for all images and icons.
- **Semantic HTML:** Ensure H1-H6 hierarchy is consistent across all sections.
- **Core Web Vitals:** Add specific performance hints (preload) for critical assets.

## Technical Details

### 1. Enhanced `Organization` Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "QuimeraTech",
  "url": "https://quimeratech.pt",
  "logo": "https://quimeratech.pt/logo.png",
  "description": "Software House de Excelência em Portugal, especializada em CRM personalizado e Cloud Architecture.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Portugal"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "hello@quimeratech.pt",
    "availableLanguage": "Portuguese, English"
  }
}
```

### 2. Route Head Refinement
- Update `src/routes/index.tsx` to include an `FAQ` schema.
- Update `src/lib/seo.ts` to support more granular schema generation.

### 3. File Updates
- `src/routes/robots.txt.ts`: Add specific crawl-delay or Disallow rules if needed.
- `src/routes/sitemap.xml.ts`: Update `lastmod` to current date and ensure all routes are included.
