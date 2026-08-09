/**
 * Utility for managing Google Tag Manager and GA4 consent.
 * This script handles the integration with the CookieBanner preference.
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Initialize GTM and set default consent.
 * This should be called early in the root component.
 */
export const initAnalytics = (gtmId: string) => {
  if (typeof window === "undefined" || !gtmId) return;

  window.dataLayer = window.dataLayer || [];
  
  // Set default consent to 'denied' for privacy-centric behavior
  // This is the "Consent Mode v2" approach.
  const gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag = gtag;

  // @ts-ignore
  gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });

  // Load GTM snippet
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(script);
};

/**
 * Update consent based on user preference.
 * Called when user interacts with the CookieBanner.
 */
export const updateAnalyticsConsent = (consent: "all" | "essential" | "none") => {
  if (typeof window === "undefined" || !window.gtag) return;

  if (consent === "all") {
    window.gtag("consent", "update", {
      ad_storage: "granted",
      analytics_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  } else {
    // For 'essential' or 'none', we keep them denied or explicitly set to denied
    window.gtag("consent", "update", {
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
};
