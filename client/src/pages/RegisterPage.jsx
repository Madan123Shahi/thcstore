import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GiLeafSkeleton } from "react-icons/gi";
import { FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import { register, clearError } from "../store/slices/authSlice";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────

const STRENGTH_LEVELS = [
  { label: "Weak", color: "bg-red-500" },
  { label: "Fair", color: "bg-orange-500" },
  { label: "Good", color: "bg-yellow-500" },
  { label: "Strong", color: "bg-primary-500" },
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
const PHONE_REGEX = /^\d{10}$/;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns 0–4 based on how many of the 4 character-type rules pass.
 * Hard gate: password must be at least 8 characters to score anything.
 */
const getPasswordStrength = (pw) => {
  if (!pw || pw.length < 8) return 0;

  const rules = [
    /[A-Z]/.test(pw), // 1 uppercase
    /[a-z]/.test(pw), // 1 lowercase
    /[0-9]/.test(pw), // 1 number
    /[~`!@#$%^&*();:'"?,.]/.test(pw), // 1 special char
  ];

  return rules.filter(Boolean).length; // 0–4 → maps to 4 strength bars
};

const isAtLeast18 = (dob) => {
  if (!dob) return false;
  const birthDate = new Date(dob);
  const today = new Date();
  const age18Date = new Date(
    birthDate.getFullYear() + 18,
    birthDate.getMonth(),
    birthDate.getDate(),
  );
  return today >= age18Date;
};

const getMaxDOB = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0];
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { registerLoading, registerError } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    file: null,
    password: "",
    confirmPassword: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
  useEffect(() => {
    if (registerError) toast.error(registerError);
  }, [registerError]);

  const strength = getPasswordStrength(form.password);

  // ── Field helpers ──
  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, phone: digits }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    if (file) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(
          "Only images (JPEG, PNG, GIF, WEBP) and PDF files are allowed",
        );
        e.target.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`File must be smaller than ${MAX_FILE_SIZE_MB} MB`);
        e.target.value = "";
        return;
      }
    }
    setForm((prev) => ({ ...prev, file }));
  };

  // ── Validation ──
  const validate = () => {
    if (!form.name.trim()) {
      toast.error("Full name is required");
      return false;
    }

    if (!EMAIL_REGEX.test(form.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (form.phone && !PHONE_REGEX.test(form.phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
    }

    if (!form.dob) {
      toast.error("Date of birth is required");
      return false;
    }

    if (!isAtLeast18(form.dob)) {
      toast.error("You must be 18 years or older to register");
      return false;
    }

    if (!form.file) {
      toast.error("Please upload your Driver's License or State ID");
      return false;
    }

    // ── Password: minimum 8 characters ──
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }

    // ── Password: all 4 character-type rules must pass ──
    const passwordRules = [
      {
        test: /[A-Z]/.test(form.password),
        msg: "at least 1 uppercase letter (A–Z)",
      },
      {
        test: /[a-z]/.test(form.password),
        msg: "at least 1 lowercase letter (a–z)",
      },
      { test: /[0-9]/.test(form.password), msg: "at least 1 number (0–9)" },
      {
        test: /[~`!@#$%^&*();:'"?,.]/.test(form.password),
        msg: "at least 1 special character (!@#…)",
      },
    ];

    const failedRule = passwordRules.find((r) => !r.test);
    if (failedRule) {
      toast.error(`Password must contain ${failedRule.msg}`);
      return false;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (!agreed) {
      toast.error("You must agree to the terms and conditions");
      return false;
    }

    return true;
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("email", form.email.trim().toLowerCase());
    formData.append("phone", form.phone);
    formData.append("dob", form.dob);
    formData.append("password", form.password);
    formData.append("file", form.file);

    const res = await dispatch(register(formData));
    if (!res.error) navigate("/");
  };

  // ── Derived state ──
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex items-center justify-center py-12 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Header */}
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
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Full Name *
              </label>
              <input
                value={form.name}
                onChange={set("name")}
                className="input-field"
                placeholder="Rahul Kumar"
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
              {form.email && !EMAIL_REGEX.test(form.email) && (
                <p className="text-xs text-red-500 mt-1">
                  Enter a valid email address
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={handlePhoneChange}
                className="input-field"
                placeholder="10-digit mobile number"
                maxLength={10}
                autoComplete="tel"
                inputMode="numeric"
              />
              {form.phone && !PHONE_REGEX.test(form.phone) && (
                <p className="text-xs text-red-500 mt-1">
                  Phone number must be exactly 10 digits
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Date of Birth *
              </label>
              <input
                type="date"
                value={form.dob}
                onChange={set("dob")}
                className="input-field"
                max={getMaxDOB()}
                required
              />
              {form.dob && !isAtLeast18(form.dob) && (
                <p className="text-xs text-red-500 mt-1">
                  You must be 18 years or older to register
                </p>
              )}
            </div>

            {/* ID Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Upload DL or State ID *
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="input-field"
                required
              />
              {form.file ? (
                <p className="text-xs text-primary-600 mt-1">
                  ✓ {form.file.name}{" "}
                  <span className="text-gray-400">
                    ({(form.file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">
                  Accepted: JPEG, PNG, WEBP, GIF, PDF — max {MAX_FILE_SIZE_MB}{" "}
                  MB
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  className="input-field pr-10"
                  placeholder="Min. 8 chars, A–Z, a–z, 0–9, !@#…"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {/* Strength meter + per-rule checklist */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < strength
                            ? STRENGTH_LEVELS[Math.min(strength - 1, 3)].color
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {strength > 0
                      ? STRENGTH_LEVELS[Math.min(strength - 1, 3)].label
                      : ""}
                  </p>

                  {/* Live checklist */}
                  <ul className="mt-1.5 space-y-0.5">
                    {[
                      {
                        test: form.password.length >= 8,
                        label: "At least 8 characters",
                      },
                      {
                        test: /[A-Z]/.test(form.password),
                        label: "1 uppercase letter (A–Z)",
                      },
                      {
                        test: /[a-z]/.test(form.password),
                        label: "1 lowercase letter (a–z)",
                      },
                      {
                        test: /[0-9]/.test(form.password),
                        label: "1 number (0–9)",
                      },
                      {
                        test: /[~`!@#$%^&*();:'"?,.]/.test(form.password),
                        label: "1 special character",
                      },
                    ].map(({ test, label }) => (
                      <li
                        key={label}
                        className={`text-xs flex items-center gap-1 transition-colors ${
                          test ? "text-primary-600" : "text-gray-400"
                        }`}
                      >
                        <span>{test ? "✓" : "○"}</span>
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  className="input-field pr-10"
                  placeholder="Re-enter password"
                  required
                  autoComplete="new-password"
                />
                {passwordsMatch ? (
                  <FiCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 pointer-events-none" />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={
                      showConfirmPass ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                )}
              </div>
              {passwordsMismatch && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Terms checkbox */}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={registerLoading || !agreed}
              className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {registerLoading ? (
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
