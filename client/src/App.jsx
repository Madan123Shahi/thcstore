import { useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchMe } from "./store/slices/authSlice";
import { useAuth } from "./hooks";

// ─── Customer routes — in main bundle (load immediately) ─────────────────────
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ProfilePage from "./pages/ProfilePage";
import WishlistPage from "./pages/WishlistPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import Loader from "./components/common/Loader";

// ─── Admin routes — lazy loaded (separate chunk, not in customer bundle) ──────
// ✅ Customers never download admin code — faster initial load
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));

// ─── Scroll To Top ────────────────────────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }); // no dep array = fires on every route change
  return null;
}

// ─── Route Guards ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, fetchMeLoading } = useAuth();
  if (fetchMeLoading) return null;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, fetchMeLoading } = useAuth();
  if (fetchMeLoading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isLoggedIn, fetchMeLoading } = useAuth();
  if (fetchMeLoading) return null;
  return isLoggedIn ? <Navigate to="/" replace /> : children;
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const dispatch = useDispatch();
  const { fetchMeLoading } = useAuth();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontFamily: '"DM Sans", sans-serif', fontSize: "14px" },
          success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
        }}
      />
      {fetchMeLoading ? (
        <Loader />
      ) : (
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* ── Public routes ── */}
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:slug" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="wishlist" element={<WishlistPage />} />

            {/* ── Guest only ── */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              }
            />

            {/* ── Protected ── */}
            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="order-success/:id"
              element={
                <ProtectedRoute>
                  <OrderSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* ── Admin routes — lazy loaded in Suspense ── */}
            {/* ✅ Suspense shows Loader while admin JS chunk downloads */}
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <Suspense fallback={<Loader />}>
                    <AdminDashboard />
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="admin/products"
              element={
                <AdminRoute>
                  <Suspense fallback={<Loader />}>
                    <AdminProducts />
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="admin/products/new"
              element={
                <AdminRoute>
                  <Suspense fallback={<Loader />}>
                    <AdminProductForm />
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="admin/products/:id/edit"
              element={
                <AdminRoute>
                  <Suspense fallback={<Loader />}>
                    <AdminProductForm />
                  </Suspense>
                </AdminRoute>
              }
            />
            <Route
              path="admin/orders"
              element={
                <AdminRoute>
                  <Suspense fallback={<Loader />}>
                    <AdminOrders />
                  </Suspense>
                </AdminRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}
