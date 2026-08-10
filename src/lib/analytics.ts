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

  const consentConfig = consent === "all" ? {
    ad_storage: "granted",
    analytics_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  } : {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };

  window.gtag("consent", "update", consentConfig);
  
  // Push a custom event to dataLayer to signal consent change to GTM tags
  window.dataLayer.push({
    event: "consent_updated",
    consent_type: consent,
    ...consentConfig
  });
};

/**
 * Track a custom event to dataLayer.
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window === "undefined") return;
  
  if (window.gtag) {
    window.gtag("event", eventName, params);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...params
    });
  }
};
