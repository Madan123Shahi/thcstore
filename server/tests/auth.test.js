import {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
  createTestUser,
  getAuthCookie,
  request,
  app,
} from "../utils/testHelpers.js";

// ─────────────────────────────────────────────
// Auth Tests
// ─────────────────────────────────────────────
describe("Auth API", () => {
  beforeAll(async () => await connectTestDB());
  afterAll(async () => await disconnectTestDB());
  afterEach(async () => await clearCollections());

  // ── POST /api/auth/register ───────────────
  describe("POST /api/auth/register", () => {
    const validUser = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      phone: "9876543210",
      dob: "1990-01-01",
    };

    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .field("name", validUser.name)
        .field("email", validUser.email)
        .field("password", validUser.password)
        .field("phone", validUser.phone)
        .field("dob", validUser.dob)
        .attach("uploadDL", Buffer.from("fake-file"), "license.jpg"); // mock file

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(validUser.email);
      expect(res.body.user.password).toBeUndefined(); // ✅ password not returned
    });

    it("should fail with missing required fields", async () => {
      const res = await request(app).post("/api/auth/register").send({ email: "john@example.com" });

      expect(res.statusCode).toBe(400);
    });

    it("should fail with duplicate email", async () => {
      await createTestUser({ email: "john@example.com" });

      const res = await request(app)
        .post("/api/auth/register")
        .field("name", validUser.name)
        .field("email", "john@example.com") // duplicate
        .field("password", validUser.password)
        .field("phone", "9999999999")
        .field("dob", validUser.dob)
        .attach("uploadDL", Buffer.from("fake-file"), "license.jpg");

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already registered/i);
    });
  });

  // ── POST /api/auth/login ──────────────────
  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await createTestUser({ email: "login@example.com", password: "password123" });
    });

    it("should login with valid email and password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ emailOrPhone: "login@example.com", password: "password123" });

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.headers["set-cookie"]).toBeDefined(); // ✅ cookie set
    });

    it("should login with phone number", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ emailOrPhone: "9876543210", password: "password123" });

      expect(res.statusCode).toBe(200);
    });

    it("should fail with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ emailOrPhone: "login@example.com", password: "wrongpassword" });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });

    it("should fail with non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ emailOrPhone: "nobody@example.com", password: "password123" });

      expect(res.statusCode).toBe(401);
    });
  });

  // ── GET /api/auth/me ──────────────────────
  describe("GET /api/auth/me", () => {
    it("should return current user when authenticated", async () => {
      const user = await createTestUser();

      const res = await request(app).get("/api/auth/me").set("Cookie", getAuthCookie(user._id));

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(user._id.toString());
      expect(res.body.email).toBe(user.email);
    });

    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.statusCode).toBe(401);
    });
  });

  // ── POST /api/auth/logout ─────────────────
  describe("POST /api/auth/logout", () => {
    it("should clear the auth cookie", async () => {
      const user = await createTestUser();

      const res = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", getAuthCookie(user._id));

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/logged out/i);
    });
  });
});
