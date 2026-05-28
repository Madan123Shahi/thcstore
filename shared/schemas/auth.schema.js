/**
 * shared/schemas/auth.schemas.js
 *
 * Single source of truth for ALL auth validation rules.
 * Import this on BOTH the backend (Express middleware) and
 * frontend (zodResolver for React Hook Form).
 *
 * Usage:
 *   Backend  → import { registerSchema } from '../../shared/schemas/auth.schemas.js'
 *   Frontend → import { registerSchema } from '../../../shared/schemas/auth.schemas.js'
 */

import { z } from "zod";

// ─── Reusable field primitives ────────────────────────────────────────────────

const nameField = z
  .string({ required_error: "Name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(60, "Name must be less than 60 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens and apostrophes",
  );

const emailField = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .max(254, "Email address is too long");

const passwordField = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be less than 72 characters") // bcrypt limit
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

// Indian mobile: 10 digits, starting with 6-9
const phoneField = z
  .string({ required_error: "Phone number is required" })
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

// Must be 18+ years old, not more than 100 years ago
const dobField = z
  .string({ required_error: "Date of birth is required" })
  .refine((val) => {
    const dob = new Date(val);
    if (isNaN(dob.getTime())) return false;
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const hadBirthday =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
    const actualAge = hadBirthday ? age : age - 1;
    return actualAge >= 18 && actualAge <= 100;
  }, "You must be at least 18 years old");

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: nameField,
    email: emailField,
    password: passwordField,
    confirmPassword: z.string({
      required_error: "Please confirm your password",
    }),
    phone: phoneField,
    dob: dobField,
    // uploadDL is a file — validated separately on backend (multer) and frontend (File object)
    // We expose a helper below for frontend File validation
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Backend-only: strip confirmPassword before hitting the DB
export const registerBodySchema = registerSchema.transform(
  ({ confirmPassword, ...rest }) => rest,
);

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  emailOrPhone: z
    .string({ required_error: "Email or phone is required" })
    .trim()
    .min(1, "Email or phone is required")
    .refine(
      (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || // email
        /^[6-9]\d{9}$/.test(val), // Indian mobile
      "Enter a valid email address or 10-digit phone number",
    ),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

// ─── Update Profile ───────────────────────────────────────────────────────────

export const updateProfileSchema = z
  .object({
    name: nameField.optional(),
    phone: phoneField.optional(),
    dateOfBirth: dobField.optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Provide at least one field to update",
  });

// ─── Change Password ──────────────────────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Current password is required" })
      .min(1, "Current password is required"),
    newPassword: passwordField,
    confirmPassword: z.string({
      required_error: "Please confirm your new password",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

// ─── Add Address ──────────────────────────────────────────────────────────────

export const addAddressSchema = z.object({
  label: z.enum(["home", "work", "other"]).default("home"),
  line1: z
    .string({ required_error: "Address line 1 is required" })
    .trim()
    .min(5, "Address is too short")
    .max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string({ required_error: "City is required" }).trim().min(2).max(100),
  state: z
    .string({ required_error: "State is required" })
    .trim()
    .min(2)
    .max(100),
  pincode: z
    .string({ required_error: "Pincode is required" })
    .regex(/^\d{6}$/, "Enter a valid 6-digit Indian pincode"),
  isDefault: z.boolean().default(false),
});

// ─── Frontend file validation helper (not used on backend) ───────────────────

/**
 * Call this manually in the frontend before submitting the registration form.
 * React Hook Form doesn't handle File inputs natively with Zod — use this separately.
 *
 * @example
 *   const fileError = validateDLFile(fileInputRef.current.files[0]);
 *   if (fileError) setError('uploadDL', { message: fileError });
 */
export const validateDLFile = (file) => {
  if (!file) return "Driver licence document is required";
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type))
    return "Only JPG, PNG, WEBP or PDF files are accepted";
  const maxSize = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSize) return "File must be smaller than 5 MB";
  return null; // valid
};

// ─── TypeScript-style type exports (JSDoc for plain JS projects) ──────────────

/**
 * @typedef {import('zod').infer<typeof registerSchema>}    RegisterInput
 * @typedef {import('zod').infer<typeof loginSchema>}       LoginInput
 * @typedef {import('zod').infer<typeof updateProfileSchema>} UpdateProfileInput
 * @typedef {import('zod').infer<typeof changePasswordSchema>} ChangePasswordInput
 * @typedef {import('zod').infer<typeof addAddressSchema>}  AddAddressInput
 */
