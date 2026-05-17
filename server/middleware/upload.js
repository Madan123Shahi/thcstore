import multer from "multer";
import path from "path";
import fs from "fs";

// ─── Ensure uploads folder exists ─────────────────────────────────────────────
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Storage config ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir); // files saved to /uploads
  },
  filename: (_req, file, cb) => {
    // e.g.  dl-1714901234567-482910234.pdf
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `dl-${unique}${ext}`);
  },
});

// ─── File filter ──────────────────────────────────────────────────────────────
const fileFilter = (_req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // accept
  } else {
    cb(
      new Error("Only JPEG, PNG, GIF, WEBP, and PDF files are allowed"),
      false, // reject
    );
  }
};

// ─── Multer instance ──────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

export default upload;
