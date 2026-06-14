import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100)
    .optional,
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number")
    .optional,
  dob: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date of birth")
    .refine((val) => {
      const age = (Date.now() - new Date(val)) / (1000 * 60 * 60 * 24 * 365);
      return age >= 18;
    }, "You must be at least 18 years old").optional,
});

export const loginSchema = z.object({
  emailOrPhone: z.string().trim().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// ✅ Base schema WITHOUT refine — so Zod v4 .partial() works
const updateProfileBase = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number")
    .optional(),
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date")
    .optional(),
});

export const updateProfileSchema = updateProfileBase.refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: "Provide at least one field to update" },
);

// ─────────────────────────────────────────────
// ✅ validateDLFile — validates driver license file
// Used in RegisterPage.jsx for client-side file validation
// Zod can't inspect File objects, so this is a plain helper function
// ─────────────────────────────────────────────
const ALLOWED_DL_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_DL_SIZE_MB = 5;

export const validateDLFile = (file) => {
  if (!file) return "Driver license or State ID is required";

  if (!ALLOWED_DL_TYPES.includes(file.type))
    return "Only JPEG, PNG, WEBP, or PDF files are allowed";

  if (file.size > MAX_DL_SIZE_MB * 1024 * 1024)
    return `File size must be under ${MAX_DL_SIZE_MB}MB`;

  return null; // ✅ null = valid
};
