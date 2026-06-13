import mongoose from "mongoose";
import request from "supertest";
import app from "../app.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// ─────────────────────────────────────────────
// ✅ Connect to test database
// Uses a separate DB so tests don't affect real data
// ─────────────────────────────────────────────
export const connectTestDB = async () => {
  const uri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  await mongoose.connect(uri);
};

export const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase(); // ✅ clean up after tests
  await mongoose.connection.close();
};

export const clearCollections = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// ─────────────────────────────────────────────
// ✅ Create test user and get auth token
// ─────────────────────────────────────────────
export const createTestUser = async (overrides = {}) => {
  const user = await User.create({
    name: overrides.name || "Test User",
    email: overrides.email || "test@example.com",
    password: overrides.password || "password123",
    phone: overrides.phone || "9876543210",
    dob: overrides.dob || new Date("1990-01-01"),
    uploadDL: overrides.uploadDL || "https://cloudinary.com/test-dl.jpg",
    role: overrides.role || "user",
  });
  return user;
};

export const createTestAdmin = async () => {
  return createTestUser({
    name: "Admin User",
    email: "admin@example.com",
    phone: "9876543211",
    role: "admin",
  });
};

// ✅ Generate JWT token for a user
export const getAuthToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ✅ Get auth cookie header for supertest requests
export const getAuthCookie = (userId) => {
  const token = getAuthToken(userId);
  return `token=${token}`;
};

export { request, app };
