import { useState } from "react";
import { Link } from "react-router-dom";
import { GiLeafSkeleton } from "react-icons/gi";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-16 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <GiLeafSkeleton className="text-white text-2xl" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Forgot Password?
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Enter your email to receive a reset link
          </p>
        </div>

        <div className="card p-8">
          {sent ? (
            // ✅ Success state
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FiMail className="text-3xl text-green-600" />
              </div>
              <h2 className="font-semibold text-gray-900 text-lg">
                Check your inbox
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                If <strong>{email}</strong> is registered, we've sent a password
                reset link. Check your spam folder if you don't see it.
              </p>
              <p className="text-xs text-gray-400">
                The link expires in 1 hour.
              </p>
              <Link
                to="/login"
                className="btn-primary w-full py-3 mt-4 block text-center"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            // ✅ Form state
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-9"
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <Link
                to="/login"
                className="flex items-center gap-1.5 justify-center text-sm text-gray-500 hover:text-primary-600 transition-colors mt-2"
              >
                <FiArrowLeft className="text-xs" /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
