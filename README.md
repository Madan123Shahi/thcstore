# 🌿 THC Store India — MERN Stack E-Commerce

**India's #1 Hemp & CBD Wellness Platform** — Production-ready full-stack e-commerce built with MERN + Redux Toolkit + Tailwind CSS + Vite.

---

## ✨ Features

### Customer Features
- 🛒 **Cart & Checkout** — Persistent cart with Redux Persist, 3-step checkout
- 🔍 **Product Search & Filtering** — By category, price range, brand, flags
- ❤️ **Wishlist** — Save products for later
- 📦 **Order Tracking** — Real-time status with visual progress bar
- 👤 **Auth** — JWT-based register/login with password strength meter
- 📍 **Address Management** — Multiple saved addresses
- ⭐ **Reviews** — Leave star ratings and comments
- 🔞 **Age Verification** — Required modal before browsing
- 🚚 **Free Shipping** — Automatic above ₹999

### Admin Features
- 📊 **Dashboard** — Revenue, orders, stock alerts
- 📦 **Product CRUD** — Full create/edit/delete with image, specs, features
- 🛍️ **Order Management** — Status updates via dropdown
- 🔒 **Admin-only routes** — Role-based route protection

### Technical
- **Stack:** MongoDB, Express, React 18, Node.js
- **State:** Redux Toolkit + Redux Persist (no React Query)
- **Styling:** Tailwind CSS v3 with custom design system
- **Bundler:** Vite 5
- **Security:** Helmet, CORS, Rate limiting, JWT
- **Custom fonts:** DM Sans + Playfair Display

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install
```bash
# Install all dependencies
npm run install:all
```

### 2. Configure Environment
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed Database
```bash
cd server
node seed.js
```
This creates:
- **Admin:** admin@thcstore.in / Admin@123
- **Customer:** customer@thcstore.in / Test@123
- 8 categories + 8 sample products

### 4. Run Development
```bash
# From root — runs both server and client
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

---

## 📁 Project Structure

```
thcstore/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Navbar, Footer, Layout, AdminLayout
│   │   │   ├── cart/         # CartDrawer
│   │   │   ├── product/      # ProductCard
│   │   │   └── common/       # Spinner, Pagination, EmptyState, etc.
│   │   ├── pages/
│   │   │   ├── admin/        # Dashboard, Products, Orders, ProductForm
│   │   │   └── *.jsx         # Home, Products, Detail, Cart, Checkout, etc.
│   │   ├── store/
│   │   │   ├── index.js      # Redux store + persist config
│   │   │   └── slices/       # auth, cart, products, categories, orders, ui, wishlist
│   │   ├── hooks/            # useCart, useWishlist, useAuth
│   │   ├── utils/            # api.js (Axios), helpers.js
│   │   └── App.jsx           # Routes (public, protected, admin)
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/                    # Express + MongoDB backend
    ├── config/db.js           # MongoDB connection
    ├── middleware/auth.js     # JWT protect + admin guard
    ├── models/                # User, Product, Category, Order
    ├── controllers/           # Business logic per resource
    ├── routes/                # API routes
    ├── seed.js                # Database seeder
    └── index.js               # Express app entry
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | User | Get profile |
| PUT | /api/auth/profile | User | Update profile |
| PUT | /api/auth/password | User | Change password |
| POST | /api/auth/address | User | Add address |
| PUT | /api/auth/wishlist/:id | User | Toggle wishlist |
| GET | /api/products | — | List products (filters, pagination) |
| GET | /api/products/featured | — | Featured products |
| GET | /api/products/bestsellers | — | Best sellers |
| GET | /api/products/:id | — | Single product |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/:id | Admin | Update product |
| DELETE | /api/products/:id | Admin | Delete product |
| POST | /api/products/:id/reviews | User | Add review |
| GET | /api/categories | — | All categories |
| POST | /api/orders | User | Place order |
| GET | /api/orders/mine | User | My orders |
| GET | /api/orders/:id | User | Order detail |
| GET | /api/orders/admin | Admin | All orders |
| PUT | /api/orders/:id/status | Admin | Update status |

---

## 🏗️ Production Build

```bash
# Build frontend
npm run build

# Serve static files from Express in production
# Set NODE_ENV=production in .env
```

---

## 🌿 Design System

| Token | Value |
|-------|-------|
| Primary | Green (#16a34a) |
| Hemp | Olive/tan tones |
| Earth | Amber/brown tones |
| Font Display | Playfair Display |
| Font Body | DM Sans |

---

## ⚠️ Compliance Notes

- THC/Vijaya products require a valid prescription
- All products should have a Certificate of Analysis (CoA)
- AYUSH-approved products are marked accordingly
- Products are for 18+ users only
