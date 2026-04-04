// cartRoutes.js - Cart is managed client-side via Redux, this route handles server-sync
import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.js";

router.get("/", protect, (req, res) =>
  res.json({ message: "Cart is managed client-side" }),
);

export default router;
