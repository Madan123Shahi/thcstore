// ─────────────────────────────────────────────
// Sentry — Frontend Error Monitoring
// Put this file at: frontend/src/config/sentry.js
// ─────────────────────────────────────────────
import * as Sentry from "@sentry/react";

export const initSentry = () => {
  // ✅ Only initialize in production
  if (import.meta.env.DEV) return;
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn("⚠️ VITE_SENTRY_DSN not set — error monitoring disabled");
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.2, // 20% of transactions — enough for performance monitoring

    integrations: [
      // ✅ Tracks React component errors
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: import("react").then((r) => r.useEffect),
      }),
      // ✅ Replays sessions when errors occur — see exactly what user did
      Sentry.replayIntegration({
        maskAllText: true, // ✅ hides sensitive text (passwords, personal info)
        blockAllMedia: false,
      }),
    ],

    // ✅ Session Replay — only when errors occur (saves quota)
    replaysSessionSampleRate: 0.0, // don't record all sessions
    replaysOnErrorSampleRate: 1.0, // record 100% of sessions with errors

    // ✅ Don't send noisy/expected errors
    ignoreErrors: [
      "Network Error",
      "Request aborted",
      "ResizeObserver loop limit exceeded",
      /^401$/, // unauthorized — expected for logged-out users
    ],
  });
};

export { Sentry };
