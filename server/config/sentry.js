// ─────────────────────────────────────────────
// Sentry — Backend Error Monitoring
// Put this file at: backend/config/sentry.js
// ─────────────────────────────────────────────
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export const initSentry = () => {
  // ✅ Only initialize in production
  if (process.env.NODE_ENV !== "production") return;
  if (!process.env.SENTRY_DSN) {
    console.warn("⚠️ SENTRY_DSN not set — error monitoring disabled");
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0, // 100% of transactions — reduce to 0.1 in high traffic
    profilesSampleRate: 1.0,
    environment: process.env.NODE_ENV,

    // ✅ Don't send errors for expected operational errors (404s, validation etc.)
    beforeSend(event, hint) {
      const err = hint.originalException;
      if (err?.isOperational) return null; // suppress AppError — already handled
      return event;
    },
  });

  console.log("✅ Sentry initialized");
};

export { Sentry };
