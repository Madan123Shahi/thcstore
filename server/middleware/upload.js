import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { AppError } from "../utils/appError.js";

// ─────────────────────────────────────────────
// Driver License Upload
// Private — not publicly accessible
// ─────────────────────────────────────────────
const dlStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "driver-licenses",
    resource_type: "auto",
    type: "authenticated", // ✅ private — not publicly accessible
  },
});

export const uploadDL = multer({
  storage: dlStorage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new AppError("Only images and PDF allowed", 400), false);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5MB
}).single("uploadDL");

// ─────────────────────────────────────────────
// Product Image Upload
// ✅ Stores 3 responsive sizes via Cloudinary transformations
// ─────────────────────────────────────────────
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    // ✅ Auto-compress on upload — Cloudinary handles this
    transformation: [
      { quality: "auto", fetch_format: "auto" }, // ✅ auto format (webp for browsers that support it)
      { width: 800, height: 800, crop: "limit" }, // ✅ cap max size
    ],
    // ✅ eager = pre-generate responsive sizes on upload
    // so they're ready instantly when requested
    eager: [
      {
        width: 100,
        height: 100,
        crop: "fill",
        quality: "auto",
        fetch_format: "auto",
      }, // thumbnail
      {
        width: 400,
        height: 400,
        crop: "fill",
        quality: "auto",
        fetch_format: "auto",
      }, // medium
      {
        width: 800,
        height: 800,
        crop: "limit",
        quality: "auto",
        fetch_format: "auto",
      }, // large
    ],
    eager_async: true, // ✅ generate in background — doesn't slow upload response
  }),
});

export const uploadProduct = multer({
  storage: productStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new AppError("Only JPEG, PNG, WEBP allowed", 400), false);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // max 5 images per product
  },
}).array("images", 5);

// ─────────────────────────────────────────────
// ✅ Helper — extract all 3 responsive URLs from
// a Cloudinary public_id for use in productController
// ─────────────────────────────────────────────
export const getResponsiveUrls = (publicId) => ({
  thumbnail: cloudinary.url(publicId, {
    width: 100,
    height: 100,
    crop: "fill",
    quality: "auto",
    fetch_format: "auto",
  }),
  medium: cloudinary.url(publicId, {
    width: 400,
    height: 400,
    crop: "fill",
    quality: "auto",
    fetch_format: "auto",
  }),
  large: cloudinary.url(publicId, {
    width: 800,
    height: 800,
    crop: "limit",
    quality: "auto",
    fetch_format: "auto",
  }),
});
