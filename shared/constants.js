// ─────────────────────────────────────────────
// SHARED CONSTANTS
// Single source of truth for all magic numbers
// and config values used across the app
// ─────────────────────────────────────────────

// ── Shipping ─────────────────────────────────
export const FREE_SHIPPING_THRESHOLD = 999; // ₹999+ gets free shipping
export const SHIPPING_PRICE = 99; // flat shipping fee in ₹

// ── Pricing ──────────────────────────────────
export const TAX_RATE = 0.05; // 5% tax

// ── Stock ────────────────────────────────────
export const LOW_STOCK_THRESHOLD = 5; // show "Only X left" warning
export const OUT_OF_STOCK = 0;

// ── Pagination ───────────────────────────────
export const DEFAULT_PAGE_SIZE = 12; // products per page
export const MAX_PAGE_SIZE = 50; // max products per page
export const ADMIN_DEFAULT_PAGE_SIZE = 20; // admin tables

// ── Cart ─────────────────────────────────────
export const MAX_CART_QUANTITY = 10; // max qty per item in cart

// ── Images ───────────────────────────────────
export const MAX_PRODUCT_IMAGES = 10;
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_DL_SIZE_MB = 5;

// ── Auth ─────────────────────────────────────
export const JWT_EXPIRE_DAYS = 30;
export const PASSWORD_RESET_EXPIRES = 60 * 60 * 1000; // 1 hour in ms
export const MIN_PASSWORD_LENGTH = 6;
export const MIN_AGE_YEARS = 18;

// ── Orders ───────────────────────────────────
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

// ── Payment ──────────────────────────────────
export const PAYMENT_METHODS = ["stripe", "cod"];
export const STRIPE_CURRENCY = "usd";

// ── Coupon ───────────────────────────────────
export const COUPON_TYPES = ["percentage", "flat", "free_shipping"];

// ── Search ───────────────────────────────────
export const SEARCH_DEBOUNCE_MS = 300;
export const AUTOCOMPLETE_LIMIT = 6;
export const MAX_SEARCH_LENGTH = 100;

// ── FCM ──────────────────────────────────────
export const FCM_LOG_EXPIRY_DAYS = 90; // auto-delete event logs after 90 days
