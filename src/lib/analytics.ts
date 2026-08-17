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
  const domain = window.location.hostname.includes('.') ? `.${window.location.hostname.split('.').slice(-2).join('.')}` : window.location.hostname; // e.g., .quimeratech.pt
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  if (consent !== "none") {
    localStorage.setItem(cookieName, consent);
    // Also set a cookie for cross-subdomain persistence
    document.cookie = `${cookieName}=${consent}; domain=${domain}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  } else {
    localStorage.removeItem(cookieName);
    document.cookie = `${cookieName}=; domain=${domain}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
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
 * Events are only tracked if consent is granted or if they are non-PII technical events.
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window === "undefined") return;
  
  const localConsent = localStorage.getItem('cookie-consent');
  const isGranted = localConsent === 'all';

  // Only track GA events if consent is granted
  if (isGranted) {
    if (window.gtag) {
      window.gtag("event", eventName, params);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        ...params
      });
    }
  } else {
    // Optional: Log to console in development when tracking is blocked by consent
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Event "${eventName}" blocked by consent.`, params);
    }
  }
};

/**
 * Web Vitals tracking.
 * Sends Core Web Vitals to GA4.
 */
export const trackWebVitals = async () => {
  if (typeof window === "undefined") return;
  
  try {
    const { onCLS, onLCP, onINP, onFCP, onTTFB } = await import('web-vitals');
    
    const sendToGoogleAnalytics = ({ name, delta, id, value }: any) => {
      trackEvent(name, {
        value: delta,
        metric_id: id,
        metric_value: value,
        metric_delta: delta,
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
