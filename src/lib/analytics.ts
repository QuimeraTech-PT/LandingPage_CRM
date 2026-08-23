/**
 * Utility for managing Google Tag Manager and GA4 consent.
 * This script handles the integration with the CookieBanner preference.
 */

type DataLayerItem = Record<string, unknown> | unknown[];

declare global {
  interface Window {
    dataLayer: DataLayerItem[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Initialize GTM and set default consent.
 * This should be called early in the root component.
 */
export const initAnalytics = (gtmId: string) => {
  if (typeof window === "undefined" || !gtmId) return;

  // window.gtag and default consent are already set in the root inline script
  // but we ensure window.gtag is available just in case.
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      window.dataLayer.push(args);
    };
  }

  // Only load scripts if at least one tracking consent is granted
  const currentConsent = getAnalyticsConsent();
  const hasConsent = currentConsent && (currentConsent.analytics || currentConsent.marketing);

  if (hasConsent) {
    // Load GTM snippet
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    document.head.appendChild(script);

    // Add noscript fallback
    const noscript = document.createElement("noscript");
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = "0";
    iframe.width = "0";
    iframe.style.display = "none";
    iframe.style.visibility = "hidden";
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);
  } else {
    // If no consent yet, we'll wait for the updateAnalyticsConsent to be called
    console.debug("[Analytics] GTM loading deferred until consent is granted.");
  }
};

/**
 * Update consent based on user preference.
 * Called when user interacts with the CookieBanner.
 */
export const updateAnalyticsConsent = (
  consent: "all" | "essential" | "none" | Record<string, boolean>,
) => {
  if (typeof window === "undefined") return;

  const cookieName = "cookie-consent";
  const domain = window.location.hostname.includes(".")
    ? `.${window.location.hostname.split(".").slice(-2).join(".")}`
    : window.location.hostname;
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  let consentConfig: Record<string, "granted" | "denied">;
  let consentValue: string;

  if (typeof consent === "string") {
    consentValue = consent;
    const isGranted = consent === "all" ? "granted" : "denied";
    consentConfig = {
      ad_storage: isGranted,
      analytics_storage: isGranted,
      ad_user_data: isGranted,
      ad_personalization: isGranted,
    };
  } else {
    // Granular consent
    consentValue = JSON.stringify(consent);
    consentConfig = {
      ad_storage: consent.marketing ? "granted" : "denied",
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
    };
  }

  // Persist the choice
  localStorage.setItem(cookieName, consentValue);
  document.cookie = `${cookieName}=${encodeURIComponent(consentValue)}; domain=${domain}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

  // Ensure gtag is available
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      window.dataLayer.push(args);
    };
  }

  window.gtag("consent", "update", consentConfig);

  // Update dataLayer
  window.dataLayer.push({
    ...consentConfig,
    event: "consent_updated",
    consent_type: typeof consent === "string" ? consent : "granular",
  });
};

/**
 * Get current consent state
 */
export const getAnalyticsConsent = () => {
  if (typeof window === "undefined") return null;
  const local = localStorage.getItem("cookie-consent");
  if (!local) return null;

  try {
    // Standardize to object format
    const parsed = JSON.parse(local);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as Record<string, boolean>;
    }
    // Fallback for string-based legacy values
    const isAll = parsed === "all";
    return { essential: true, analytics: isAll, marketing: isAll };
  } catch {
    const isAll = local === "all";
    return { essential: true, analytics: isAll, marketing: isAll };
  }
};

/**
 * Track a custom event to dataLayer.
 * Events are only tracked if consent is granted or if they are non-PII technical events.
 */
export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === "undefined") return;

  const localConsent = localStorage.getItem("cookie-consent");
  let isGranted = localConsent === "all";

  if (localConsent && localConsent.startsWith("{")) {
    try {
      const granular = JSON.parse(localConsent);
      // Logic: analytics event tracking requires analytics consent
      // If it's a marketing event, it would require marketing consent, but we'll use a general approach
      isGranted = granular.analytics === true;
    } catch (error) {
      console.debug("[Analytics] Failed to parse consent:", error);
    }
  }

  // Only track GA events if consent is granted
  if (isGranted) {
    if (window.gtag) {
      window.gtag("event", eventName, params);
    }

    // Always push to dataLayer for GTM consistency
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  } else {
    // Optional: Log to console in development when tracking is blocked by consent
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Event "${eventName}" blocked by consent.`, params);
    }
  }
};

/**
 * Automatically tracks outbound link clicks, including mailto and tel links.
 */
export const trackOutboundClick = (url: string) => {
  if (typeof window === "undefined") return;

  try {
    const isMailto = url.startsWith("mailto:");
    const isTel = url.startsWith("tel:");

    if (isMailto || isTel) {
      const type = isMailto ? "email" : "phone";
      const value = url.split(":")[1] || "";

      trackEvent("outbound_click", {
        link_url: url,
        link_domain: isMailto ? "mailto" : "tel",
        link_type: type,
        link_value: value,
        outbound: true,
      });
      return;
    }

    const targetUrl = new URL(url);
    // Only track if it's a different origin
    if (targetUrl.origin !== window.location.origin) {
      trackEvent("outbound_click", {
        link_url: url,
        link_domain: targetUrl.hostname,
        link_path: targetUrl.pathname,
        link_query: targetUrl.search,
        outbound: true,
      });
    }
  } catch (e) {
    // If URL parsing fails, it might be a relative link or something else
    console.debug("[Analytics] Failed to parse outbound link URL:", url);
  }
};

/**
 * Web Vitals tracking.
 * Sends Core Web Vitals to GA4.
 */
export const trackWebVitals = async () => {
  if (typeof window === "undefined") return;

  try {
    const { onCLS, onLCP, onINP, onFCP, onTTFB } = await import("web-vitals");

    const sendToGoogleAnalytics = ({ name, delta, id, value, rating, navigationType }: import("web-vitals").Metric) => {
      trackEvent(name, {
        value: delta,
        metric_id: id,
        metric_value: value,
        metric_delta: delta,
        metric_rating: rating,
        metric_navigation_type: navigationType,
        non_interaction: true,
      });
    };

    onCLS(sendToGoogleAnalytics);
    onLCP(sendToGoogleAnalytics);
    onINP(sendToGoogleAnalytics);
    onFCP(sendToGoogleAnalytics);
    onTTFB(sendToGoogleAnalytics);
  } catch (error) {
    console.error("Failed to load web-vitals:", error);
  }
};

/**
 * Scroll depth tracking.
 * Measures user engagement by tracking how far down the page they scroll.
 */
export const initScrollTracking = () => {
  if (typeof window === "undefined") return;

  const thresholds = [25, 50, 75, 100];
  const reachedThresholds = new Set<number>();

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const scrollPercent = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);

    thresholds.forEach((threshold) => {
      if (scrollPercent >= threshold && !reachedThresholds.has(threshold)) {
        reachedThresholds.add(threshold);
        trackEvent("scroll_depth", {
          percent: threshold,
          page_path: window.location.pathname,
        });
      }
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
};
