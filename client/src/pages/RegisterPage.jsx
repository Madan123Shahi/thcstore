import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GiLeafSkeleton } from "react-icons/gi";
import { FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import { register, clearError } from "../store/slices/authSlice";
import toast from "react-hot-toast";

// ── Import the shared schema (same file your backend uses) ────────────────────
import { registerSchema, validateDLFile } from "../../../shared/schemas/auth.schema.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const STRENGTH_LEVELS = [
  { label: "Weak", color: "bg-red-500" },
  { label: "Fair", color: "bg-orange-500" },
  { label: "Good", color: "bg-yellow-500" },
  { label: "Strong", color: "bg-primary-500" },
];

const MAX_FILE_SIZE_MB = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getPasswordStrength = (pw) => {
  if (!pw || pw.length < 8) return 0;
  return [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length; // 1–4
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
    password: "",
    confirmPassword: "",
  });
  const [file, setFile] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({}); // { fieldName: "message" }
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);
  useEffect(() => {
    if (registerError) toast.error(registerError);
  }, [registerError]);

  const strength = getPasswordStrength(form.password);

  // ── Field helpers ─────────────────────────────────────────────────────────

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear that field's error as the user types
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, phone: digits }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const handleFileChange = (e) => {
    const picked = e.target.files[0] || null;
    const fileError = validateDLFile(picked); // uses the shared helper
    if (fileError) {
      toast.error(fileError);
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(picked);
    if (errors.uploadDL) setErrors((prev) => ({ ...prev, uploadDL: undefined }));
  };

  // ── Validation via Zod ────────────────────────────────────────────────────
  //
  // We call registerSchema.safeParse() directly on our form state.
  // No React Hook Form needed — Zod works with any data object.
  //
  const validate = () => {
    // 1. Parse text fields through the shared Zod schema
    const result = registerSchema.safeParse({ ...form });

    if (!result.success) {
      // Build a flat { fieldName: firstMessage } map from Zod's error list
      const fieldErrors = {};
      for (const issue of result.error.errors) {
        const field = issue.path[0]; // e.g. "email", "confirmPassword"
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);

      // Show the first error as a toast so the user knows something is wrong
      const first = result.error.errors[0];
      toast.error(first.message);
      return false;
    }

    // 2. Validate the file separately (Zod can't inspect File objects)
    const fileError = validateDLFile(file);
    if (fileError) {
      setErrors((prev) => ({ ...prev, uploadDL: fileError }));
      toast.error(fileError);
      return false;
    }

    // 3. Terms checkbox (not a schema field — just a UI gate)
    if (!agreed) {
      toast.error("You must agree to the terms and conditions");
      return false;
    }

    setErrors({});
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("email", form.email.trim().toLowerCase());
    formData.append("phone", form.phone);
    formData.append("dob", form.dob);
    formData.append("password", form.password);
    formData.append("uploadDL", file);

    const res = await dispatch(register(formData));
    if (!res.error) navigate("/");
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
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
          <h1 className="font-display text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-400 mt-1 text-sm">Join thousands on their wellness journey</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <Field label="Full Name" required error={errors.name}>
              <input
                value={form.name}
                onChange={set("name")}
                className={inputCls(errors.name)}
                placeholder="Rahul Kumar"
                autoComplete="name"
              />
            </Field>

            {/* Email */}
            <Field label="Email Address" required error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                className={inputCls(errors.email)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </Field>

            {/* Phone */}
            <Field label="Phone Number" error={errors.phone}>
              <input
                type="tel"
                value={form.phone}
                onChange={handlePhoneChange}
                className={inputCls(errors.phone)}
                placeholder="10-digit mobile number"
                maxLength={10}
                autoComplete="tel"
                inputMode="numeric"
              />
            </Field>

            {/* Date of Birth */}
            <Field label="Date of Birth" error={errors.dob}>
              <input
                type="date"
                value={form.dob}
                onChange={set("dob")}
                className={inputCls(errors.dob)}
                max={getMaxDOB()}
              />
            </Field>

            {/* Driver Licence Upload */}
            <Field label="Upload DL or State ID" required error={errors.uploadDL}>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="input-field"
              />
              {file ? (
                <p className="text-xs text-primary-600 mt-1">
                  ✓ {file.name}{" "}
                  <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">
                  Accepted: JPEG, PNG, WEBP, PDF — max {MAX_FILE_SIZE_MB} MB
                </p>
              )}
            </Field>

            {/* Password */}
            <Field label="Password" required error={errors.password}>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  className={`${inputCls(errors.password)} pr-10`}
                  placeholder="Min. 8 chars, A–Z, a–z, 0–9, !@#…"
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

              {/* Strength meter + live checklist */}
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
                    {strength > 0 ? STRENGTH_LEVELS[Math.min(strength - 1, 3)].label : ""}
                  </p>
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
                        test: /[^A-Za-z0-9]/.test(form.password),
                        label: "1 special character",
                      },
                    ].map(({ test, label }) => (
                      <li
                        key={label}
                        className={`text-xs flex items-center gap-1 transition-colors ${
                          test ? "text-primary-600" : "text-gray-400"
                        }`}
                      >
                        <span>{test ? "✓" : "○"}</span> {label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password" required error={errors.confirmPassword}>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  className={`${inputCls(errors.confirmPassword)} pr-10`}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
                {passwordsMatch ? (
                  <FiCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 pointer-events-none" />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showConfirmPass ? "Hide password" : "Show password"}
                  >
                    {showConfirmPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                )}
              </div>
              {/* inline mismatch hint (before submit) */}
              {passwordsMismatch && !errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </Field>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-400"
              />
              <span className="text-xs text-gray-500 leading-relaxed">
                I confirm I am <strong>18 years or older</strong> and agree to the{" "}
                <Link to="/terms" className="text-primary-600 underline">
                  Terms of Service
                </Link>
                ,{" "}
                <Link to="/privacy" className="text-primary-600 underline">
                  Privacy Policy
                </Link>
                , and understand that prescription products require a valid doctor's prescription.
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
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Tiny shared helpers ──────────────────────────────────────────────────────

/** Red border when there's an error, normal otherwise */
const inputCls = (err) =>
  `input-field ${err ? "border-red-400 focus:ring-red-300 focus:border-red-400" : ""}`;

/** Label + input slot + inline error message */
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
