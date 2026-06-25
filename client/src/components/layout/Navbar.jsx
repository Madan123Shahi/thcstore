import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiShoppingCart,
  FiUser,
  FiUserPlus,
  FiMenu,
  FiX,
  FiHeart,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";
import { GiLeafSkeleton } from "react-icons/gi";
import { toggleCart } from "../../store/slices/uiSlice";
import { logoutUser } from "../../store/slices/authSlice";
import { clearCart, selectCartCount } from "../../store/slices/cartSlice";
import { useAuth } from "../../hooks";
import SearchBar from "../product/SearchBar"; // ✅ replaced basic form

const NAV_LINKS = [
  { label: "Shop All", to: "/products" },
  { label: "CBD Oils", to: "/products?category=cbd-oils" },
  { label: "THC Gummies", to: "/products?category=thc-gummies" },
  { label: "Hemp Wellness", to: "/products?category=hemp-wellness" },
  { label: "Vijaya Extract", to: "/products?category=vijaya-extract" },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, isAdmin } = useAuth();
  const cartCount = useSelector(selectCartCount);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!userMenuRef.current?.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(clearCart());
    setUserMenuOpen(false);
    navigate("/login");
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300
      ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white border-b border-gray-100"}`}
    >
      {/* Announcement bar */}
      <div className="bg-primary-700 text-white text-xs text-center py-2 px-4 font-medium tracking-wide">
        🌿 Free shipping on orders above ₹999 &nbsp;|&nbsp; Lab-tested &amp; AYUSH-approved products
      </div>

      <div className="page-container">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary-700 transition-colors">
              <GiLeafSkeleton className="text-white text-xl" />
            </div>
            <div className="leading-none">
              <span className="font-display font-bold text-gray-900 text-lg">THC</span>
              <span className="font-display font-bold text-primary-600 text-lg"> Store</span>
              <p className="text-[10px] text-gray-400 font-sans tracking-widest uppercase">India</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150
                  ${
                    location.pathname + location.search === link.to
                      ? "text-primary-700 bg-primary-50"
                      : "text-gray-600 hover:text-primary-700 hover:bg-gray-50"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ✅ SearchBar with autocomplete — replaces basic form */}
          <div className="hidden md:block flex-1 max-w-xs">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Wishlist */}
            <Link to="/wishlist" className="btn-ghost p-2.5 relative hidden sm:flex">
              <FiHeart className="text-lg" />
            </Link>

            {/* Cart */}
            <button onClick={() => dispatch(toggleCart())} className="btn-ghost p-2.5 relative">
              <FiShoppingCart className="text-lg" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* User menu */}
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[80px] truncate">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <FiChevronDown
                    className={`text-gray-400 text-sm transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 animate-scale-in z-50">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiUser className="text-gray-400" /> My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiPackage className="text-gray-400" /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary-700 hover:bg-primary-50 transition-colors"
                      >
                        <FiSettings className="text-primary-500" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut className="text-red-400" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  <FiUser className="text-sm" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                >
                  <FiUserPlus className="text-sm" />
                  New User
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen((v) => !v)} className="btn-ghost p-2.5 lg:hidden">
              {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white animate-slide-down">
          <div className="page-container py-4 space-y-1">
            {/* ✅ SearchBar in mobile menu too */}
            <div className="mb-3">
              <SearchBar />
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <div className="flex items-center gap-2 mt-2">
                <Link
                  to="/login"
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg active:bg-primary-700 transition-colors duration-200"
                >
                  <FiUser className="text-sm" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg active:bg-gray-50 transition-colors duration-200"
                >
                  <FiUserPlus className="text-sm" />
                  New User
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
