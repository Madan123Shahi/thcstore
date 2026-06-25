import {
  connectTestDB,
  disconnectTestDB,
  clearCollections,
  createTestUser,
  createTestAdmin,
  getAuthCookie,
  request,
  app,
} from "../utils/testHelpers.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";

// ─────────────────────────────────────────────
// Orders Tests
// ─────────────────────────────────────────────
describe("Orders API", () => {
  let user, admin, product, category;

  beforeAll(async () => await connectTestDB());
  afterAll(async () => await disconnectTestDB());

  beforeEach(async () => {
    await clearCollections();

    // ✅ Create test data
    user = await createTestUser();
    admin = await createTestAdmin();

    category = await Category.create({
      name: "Test Category",
      slug: "test-category",
      isActive: true,
    });

    product = await Product.create({
      name: "Test CBD Oil",
      slug: "test-cbd-oil",
      brand: "TestBrand",
      category: category._id,
      description: "A test product",
      price: 500,
      mrp: 600,
      stock: 10,
    });
  });

  // ── POST /api/orders ──────────────────────
  describe("POST /api/orders", () => {
    const shippingAddress = {
      name: "Test User",
      phone: "9876543210",
      line1: "123 Test Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    };

    it("should create a COD order successfully", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Cookie", getAuthCookie(user._id))
        .send({
          items: [{ product: product._id, quantity: 2 }],
          shippingAddress,
          paymentMethod: "cod",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.orderNumber).toBeDefined();
      expect(res.body.totalPrice).toBeDefined();
      expect(res.body.paymentMethod).toBe("cod");
      expect(res.body.isPaid).toBe(false); // ✅ COD not paid yet
    });

    it("should deduct stock after order", async () => {
      await request(app)
        .post("/api/orders")
        .set("Cookie", getAuthCookie(user._id))
        .send({
          items: [{ product: product._id, quantity: 3 }],
          shippingAddress,
          paymentMethod: "cod",
        });

      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct.stock).toBe(7); // 10 - 3 = 7
    });

    it("should fail when product is out of stock", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Cookie", getAuthCookie(user._id))
        .send({
          items: [{ product: product._id, quantity: 99 }], // more than stock
          shippingAddress,
          paymentMethod: "cod",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/out of stock/i);
    });

    it("should fail with no items", async () => {
      const res = await request(app)
        .post("/api/orders")
        .set("Cookie", getAuthCookie(user._id))
        .send({ items: [], shippingAddress, paymentMethod: "cod" });

      expect(res.statusCode).toBe(400);
    });

    it("should fail when not authenticated", async () => {
      const res = await request(app)
        .post("/api/orders")
        .send({
          items: [{ product: product._id, quantity: 1 }],
          shippingAddress,
          paymentMethod: "cod",
        });

      expect(res.statusCode).toBe(401);
    });
  });

  // ── GET /api/orders/mine ──────────────────
  describe("GET /api/orders/mine", () => {
    it("should return user orders", async () => {
      // Create an order first
      await Order.create({
        user: user._id,
        items: [{ product: product._id, name: product.name, price: product.price, quantity: 1 }],
        shippingAddress: {
          name: "Test",
          phone: "9876543210",
          line1: "123",
          city: "Mumbai",
          state: "MH",
          pincode: "400001",
        },
        paymentMethod: "cod",
        itemsPrice: 500,
        shippingPrice: 99,
        taxPrice: 25,
        totalPrice: 624,
      });

      const res = await request(app).get("/api/orders/mine").set("Cookie", getAuthCookie(user._id));

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });

    it("should not return other users orders", async () => {
      const otherUser = await createTestUser({ email: "other@example.com", phone: "9111111111" });

      await Order.create({
        user: otherUser._id,
        items: [{ product: product._id, name: product.name, price: product.price, quantity: 1 }],
        shippingAddress: {
          name: "Other",
          phone: "9111111111",
          line1: "456",
          city: "Delhi",
          state: "DL",
          pincode: "110001",
        },
        paymentMethod: "cod",
        itemsPrice: 500,
        shippingPrice: 99,
        taxPrice: 25,
        totalPrice: 624,
      });

      const res = await request(app).get("/api/orders/mine").set("Cookie", getAuthCookie(user._id));

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(0); // ✅ user sees 0 — other user's order not returned
    });
  });

  // ── GET /api/orders/admin ─────────────────
  describe("GET /api/orders/admin", () => {
    it("should return all orders for admin", async () => {
      const res = await request(app)
        .get("/api/orders/admin")
        .set("Cookie", getAuthCookie(admin._id));

      expect(res.statusCode).toBe(200);
      expect(res.body.orders).toBeDefined();
    });

    it("should deny access to non-admin", async () => {
      const res = await request(app)
        .get("/api/orders/admin")
        .set("Cookie", getAuthCookie(user._id));

      expect(res.statusCode).toBe(403);
    });
  });

  // ── PATCH /api/orders/:id/status ─────────
  describe("PATCH /api/orders/:id/status", () => {
    it("should allow admin to update order status", async () => {
      const order = await Order.create({
        user: user._id,
        items: [{ product: product._id, name: product.name, price: product.price, quantity: 1 }],
        shippingAddress: {
          name: "Test",
          phone: "9876543210",
          line1: "123",
          city: "Mumbai",
          state: "MH",
          pincode: "400001",
        },
        paymentMethod: "cod",
        itemsPrice: 500,
        shippingPrice: 99,
        taxPrice: 25,
        totalPrice: 624,
      });

      const res = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .set("Cookie", getAuthCookie(admin._id))
        .send({ status: "confirmed" });

      expect(res.statusCode).toBe(200);
      expect(res.body.orderStatus).toBe("confirmed");
    });

    it("should deny status update to non-admin", async () => {
      const order = await Order.create({
        user: user._id,
        items: [{ product: product._id, name: product.name, price: product.price, quantity: 1 }],
        shippingAddress: {
          name: "Test",
          phone: "9876543210",
          line1: "123",
          city: "Mumbai",
          state: "MH",
          pincode: "400001",
        },
        paymentMethod: "cod",
        itemsPrice: 500,
        shippingPrice: 99,
        taxPrice: 25,
        totalPrice: 624,
      });

      const res = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .set("Cookie", getAuthCookie(user._id))
        .send({ status: "confirmed" });

      expect(res.statusCode).toBe(403);
    });
  });
});
