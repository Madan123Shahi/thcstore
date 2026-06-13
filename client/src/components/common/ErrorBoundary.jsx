import { Component } from "react";
import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";

// ─────────────────────────────────────────────
// ✅ ErrorBoundary — catches React render errors
// Prevents full-page crash — only affected
// section crashes, rest of app stays working
//
// Must be a CLASS component — hooks can't catch
// render errors (React limitation)
// ─────────────────────────────────────────────
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // ✅ Called when a child component throws
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // ✅ Called after error is caught — log it
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);

    // ✅ Optionally send to your analytics/logging service
    // trackEvent('react_error', { message: error.message, stack: info.componentStack });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    // ── Custom fallback if provided ───────────
    if (this.props.fallback) return this.props.fallback;

    // ── Default error UI ──────────────────────
    const { minimal } = this.props;

    // Minimal — for small sections (cards, widgets)
    if (minimal) {
      return (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <FiAlertTriangle className="shrink-0" />
          <span>Something went wrong.</span>
          <button
            onClick={this.handleReset}
            className="ml-auto text-red-600 hover:text-red-800 underline text-xs"
          >
            Retry
          </button>
        </div>
      );
    }

    // Full — for pages or large sections
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="text-3xl text-red-500" />
          </div>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            An unexpected error occurred. Please try refreshing or go back to the home page.
          </p>
          {/* Show error in development only */}
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-left text-xs bg-gray-100 rounded-xl p-4 mb-6 overflow-auto text-red-600 max-h-32">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="btn-secondary px-5 py-2.5 text-sm flex items-center gap-2"
            >
              <FiRefreshCw className="text-sm" /> Try Again
            </button>
            <a href="/" className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
              <FiHome className="text-sm" /> Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
