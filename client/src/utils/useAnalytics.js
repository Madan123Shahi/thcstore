import api from '../utils/api';

// ─────────────────────────────────────────────
// ✅ useAnalytics — tracks user behavior events
// Call anywhere in the app to log events
// ─────────────────────────────────────────────

export const trackEvent = async (event, data = {}) => {
  try {
    await api.post('/analytics/event', {
      event,
      page: window.location.pathname,
      data,
    });
  } catch {
    // ✅ Silently fail — tracking should never break the app
  }
};

// ── Preset event helpers ──────────────────────────────────────
export const trackPageView    = (page)              => trackEvent('page_view',     { page });
export const trackProductView = (productId, name)   => trackEvent('product_view',  { productId, name });
export const trackAddToCart   = (productId, name)   => trackEvent('add_to_cart',   { productId, name });
export const trackSearch      = (query)             => trackEvent('search',        { query });
export const trackCheckout    = ()                  => trackEvent('checkout_start');
export const trackPurchase    = (orderId, total)    => trackEvent('purchase',      { orderId, total });