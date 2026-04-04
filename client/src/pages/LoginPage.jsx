import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GiLeafSkeleton } from "react-icons/gi";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { login, clearError } from "../store/slices/authSlice";
import toast from "react-hot-toast";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }
    const res = await dispatch(login(form));
    if (!res.error) navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <GiLeafSkeleton className="text-white text-2xl" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Sign in to your THC Store account
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="input-field"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By signing in, you confirm you are 18+ years old and agree to our{" "}
          <Link to="/terms" className="underline">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}
