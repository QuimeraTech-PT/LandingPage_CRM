export const SITE_URL = "https://quimeratech.pt";
export const SITE_NAME = "QuimeraTech | Inovação em Software e Cloud";
export const SITE_LOCALE = "pt_PT";

/** Fallback social image used whenever a route has no dedicated image. */
export const DEFAULT_OG_IMAGE = "/og-default.jpg";
export const OG_IMAGE_WIDTH = "1200";
export const OG_IMAGE_HEIGHT = "630";

export const absoluteUrl = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

type SeoInput = {
  title: string;
  description: string;
  path: string;
  /** Route-specific social image. Falls back to DEFAULT_OG_IMAGE. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  keywords?: string;
  robots?: string;
};

export function seoMeta({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
  keywords,
  robots = "index, follow",
}: SeoInput) {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image ?? DEFAULT_OG_IMAGE);
  const alt = imageAlt ?? `${title} — ${SITE_NAME}`;

  return [
    { title },
    { name: "description", content: description },
    ...(keywords ? [{ name: "keywords", content: keywords }] : []),
    { name: "robots", content: robots },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:locale", content: SITE_LOCALE },
    { property: "og:image", content: imageUrl },
    { property: "og:image:secure_url", content: imageUrl },
    { property: "og:image:type", content: "image/jpeg" },
    { property: "og:image:width", content: OG_IMAGE_WIDTH },
    { property: "og:image:height", content: OG_IMAGE_HEIGHT },
    { property: "og:image:alt", content: alt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
    { name: "twitter:image:alt", content: alt },
  ];
}

/** Canonical + hreflang alternates for a route. */
export function seoLinks(path: string) {
  const url = absoluteUrl(path);
  return [
    { rel: "canonical", href: url },
    { rel: "alternate", hrefLang: "pt-PT", href: url },
    { rel: "alternate", hrefLang: "pt", href: url },
    { rel: "alternate", hrefLang: "x-default", href: url },
  ];
}

export function breadcrumbList(items: Array<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * FAQ Schema generator
 */
export function faqSchema(questions: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a,
      },
    })),
  };
}

export function jsonLd(data: unknown) {
  return { type: "application/ld+json", children: JSON.stringify(data) };
}
