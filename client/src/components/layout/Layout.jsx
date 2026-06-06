// Layout.jsx
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "../cart/CartDrawer";
import AgeVerificationModal from "../common/AgeVerificationModal";
import { fetchCategories } from "../../store/slices/categorySlice";
import { setWishlist } from "../../store/slices/wishlistSlice";
import { useSocket } from '../../hooks/useSocket'; // ✅ real-time order updates
import { useFCM }    from '../../hooks/useFCM';    // ✅ push notifications

export default function Layout() {
  const dispatch   = useDispatch();
  const user       = useSelector((s) => s.auth.user);
  const ageVerified = useSelector((s) => s.ui.ageVerified);

  const showAgeModal = !ageVerified && !user;

  // ✅ Socket.io — connects when user logs in, disconnects on logout
  useSocket();

  // ✅ FCM — requests notification permission, listens for foreground messages
  useFCM();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (user?.wishlist) dispatch(setWishlist(user.wishlist));
  }, [user, dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {showAgeModal && <AgeVerificationModal />}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}