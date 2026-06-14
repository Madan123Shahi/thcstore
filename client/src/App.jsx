import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchMe, refreshSession } from "./store/slices/authSlice";
import { useAuth } from "./hooks";
import ErrorBoundary from "./components/common/ErrorBoundary"; // ✅

// ── Customer routes ───────────────────────────────────────────
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
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";
import Loader from "./components/common/Loader";

// ── Admin routes — lazy loaded ────────────────────────────────
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));

// ── Scroll to top ─────────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  return null;
}

// ── GA4 route tracker ─────────────────────────────────────────
function GA4Tracker() {
  const location = useLocation();
  useEffect(() => {
    if (window.gtag) {
      window.gtag("config", "G-XXXXXXXXXX", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
  return null;
}

// ── Route Guards ─────────────────────────────────────────────
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

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const dispatch = useDispatch();
  const { fetchMeLoading } = useAuth();

  useEffect(() => {
    // ✅ Try to restore session from httpOnly refresh cookie first.
    // Only fetch the user profile if a valid access token was issued.
    dispatch(refreshSession()).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        dispatch(fetchMe());
      }
    });
  }, [dispatch]);

  return (
    // ✅ Top-level boundary — catches catastrophic errors
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <GA4Tracker />
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
              {/* ── Public ── */}
              {/* ✅ Each page wrapped in ErrorBoundary — one page crash won't affect others */}
              <Route
                index
                element={
                  <ErrorBoundary>
                    <HomePage />
                  </ErrorBoundary>
                }
              />
              <Route
                path="products"
                element={
                  <ErrorBoundary>
                    <ProductsPage />
                  </ErrorBoundary>
                }
              />
              <Route
                path="products/:slug"
                element={
                  <ErrorBoundary>
                    <ProductDetailPage />
                  </ErrorBoundary>
                }
              />
              <Route
                path="cart"
                element={
                  <ErrorBoundary>
                    <CartPage />
                  </ErrorBoundary>
                }
              />
              <Route
                path="wishlist"
                element={
                  <ErrorBoundary>
                    <WishlistPage />
                  </ErrorBoundary>
                }
              />

              {/* ── Guest only ── */}
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <ErrorBoundary>
                      <LoginPage />
                    </ErrorBoundary>
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <ErrorBoundary>
                      <RegisterPage />
                    </ErrorBoundary>
                  </GuestRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <GuestRoute>
                    <ErrorBoundary>
                      <ForgotPasswordPage />
                    </ErrorBoundary>
                  </GuestRoute>
                }
              />
              <Route
                path="/reset-password/:token"
                element={
                  <GuestRoute>
                    <ErrorBoundary>
                      <ResetPasswordPage />
                    </ErrorBoundary>
                  </GuestRoute>
                }
              />

              {/* ── Protected ── */}
              <Route
                path="checkout"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <CheckoutPage />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="order-success/:id"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <OrderSuccessPage />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <OrdersPage />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <OrderDetailPage />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <ProfilePage />
                    </ErrorBoundary>
                  </ProtectedRoute>
                }
              />

              {/* ── Admin — lazy + error boundary ── */}
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <Suspense fallback={<Loader />}>
                      <ErrorBoundary>
                        <AdminDashboard />
                      </ErrorBoundary>
                    </Suspense>
                  </AdminRoute>
                }
              />
              <Route
                path="admin/products"
                element={
                  <AdminRoute>
                    <Suspense fallback={<Loader />}>
                      <ErrorBoundary>
                        <AdminProducts />
                      </ErrorBoundary>
                    </Suspense>
                  </AdminRoute>
                }
              />
              <Route
                path="admin/products/new"
                element={
                  <AdminRoute>
                    <Suspense fallback={<Loader />}>
                      <ErrorBoundary>
                        <AdminProductForm />
                      </ErrorBoundary>
                    </Suspense>
                  </AdminRoute>
                }
              />
              <Route
                path="admin/products/:id/edit"
                element={
                  <AdminRoute>
                    <Suspense fallback={<Loader />}>
                      <ErrorBoundary>
                        <AdminProductForm />
                      </ErrorBoundary>
                    </Suspense>
                  </AdminRoute>
                }
              />
              <Route
                path="admin/orders"
                element={
                  <AdminRoute>
                    <Suspense fallback={<Loader />}>
                      <ErrorBoundary>
                        <AdminOrders />
                      </ErrorBoundary>
                    </Suspense>
                  </AdminRoute>
                }
              />
              <Route
                path="admin/coupons"
                element={
                  <AdminRoute>
                    <Suspense fallback={<Loader />}>
                      <ErrorBoundary>
                        <AdminCoupons />
                      </ErrorBoundary>
                    </Suspense>
                  </AdminRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        )}
      </BrowserRouter>
    </ErrorBoundary>
  );
}
