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

  // window.gtag and default consent are already set in the root inline script
  // but we ensure window.gtag is available just in case.
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }

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
  if (typeof window === "undefined") return;

  // Persist the choice with cross-subdomain support
  // We use a cookie for cross-subdomain persistence if possible
  const cookieName = "cookie-consent";
  const domain = window.location.hostname.split('.').slice(-2).join('.'); // e.g., quimeratech.pt
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  if (consent !== "none") {
    localStorage.setItem(cookieName, consent);
    // Also set a cookie for cross-subdomain persistence
    document.cookie = `${cookieName}=${consent}; domain=.${domain}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  } else {
    localStorage.removeItem(cookieName);
    document.cookie = `${cookieName}=; domain=.${domain}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }

  // Ensure gtag is available if it was not initialized yet
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      // @ts-ignore
      window.dataLayer.push(arguments);
    };
  }

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
