import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import AgeVerificationModal from '../common/AgeVerificationModal';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchMe } from '../../store/slices/authSlice';
import { setWishlist } from '../../store/slices/wishlistSlice';

export default function Layout() {
  const dispatch = useDispatch();
  const { token, user } = useSelector(s => s.auth);
  const ageVerified = useSelector(s => s.ui.ageVerified);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [token, dispatch]);

  useEffect(() => {
    if (user?.wishlist) dispatch(setWishlist(user.wishlist));
  }, [user, dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {!ageVerified && <AgeVerificationModal />}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
