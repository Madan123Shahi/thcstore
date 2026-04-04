import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GiLeafSkeleton } from "react-icons/gi";
import { FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import { register, clearError } from "../store/slices/authSlice";
import toast from "react-hot-toast";

const STRENGTH_LEVELS = [
  { label: "Weak", color: "bg-red-500" },
  { label: "Fair", color: "bg-orange-500" },
  { label: "Good", color: "bg-yellow-500" },
  { label: "Strong", color: "bg-primary-500" },
];

function getStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("You must agree to the terms");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const res = await dispatch(
      register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      }),
    );
    if (!res.error) navigate("/");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <GiLeafSkeleton className="text-white text-2xl" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Create Account
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Join thousands on their wellness journey
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Full Name *
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="input-field"
                placeholder="Rahul Kumar"
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="input-field"
                placeholder="10-digit mobile number"
                maxLength={10}
                autoComplete="tel"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className="input-field pr-10"
                  placeholder="Min. 6 characters"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${i < strength ? STRENGTH_LEVELS[strength - 1]?.color : "bg-gray-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {strength > 0 ? STRENGTH_LEVELS[strength - 1]?.label : ""}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                  className="input-field pr-10"
                  placeholder="Re-enter password"
                  required
                  autoComplete="new-password"
                />
                {form.confirmPassword &&
                  form.password === form.confirmPassword && (
                    <FiCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500" />
                  )}
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-400"
              />
              <span className="text-xs text-gray-500 leading-relaxed">
                I confirm I am <strong>18 years or older</strong> and agree to
                the{" "}
                <Link to="/terms" className="text-primary-600 underline">
                  Terms of Service
                </Link>
                ,{" "}
                <Link to="/privacy" className="text-primary-600 underline">
                  Privacy Policy
                </Link>
                , and understand that prescription products require a valid
                doctor's prescription.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
