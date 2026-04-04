import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { addToCart } from '../store/slices/cartSlice';
import { toggleCart } from '../store/slices/uiSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { selectIsWishlisted } from '../store/slices/wishlistSlice';

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export const useCart = () => {
  const dispatch = useDispatch();
  const handleAddToCart = useCallback((product, quantity = 1) => {
    dispatch(addToCart({ product, quantity }));
    dispatch(toggleCart());
    toast.success(`${product.name} added to cart!`);
  }, [dispatch]);
  return { handleAddToCart };
};

export const useWishlist = (productId) => {
  const dispatch = useDispatch();
  const isWishlisted = useSelector(selectIsWishlisted(productId));
  const user = useSelector(s => s.auth.user);

  const handleToggle = useCallback(() => {
    if (!user) { toast.error('Please login to add to wishlist'); return; }
    dispatch(toggleWishlist(productId));
  }, [dispatch, productId, user]);

  return { isWishlisted, handleToggle };
};

export const useAuth = () => useSelector((s) => ({
  user: s.auth.user,
  token: s.auth.token,
  loading: s.auth.loading,
  error: s.auth.error,
  isLoggedIn: !!s.auth.token,
  isAdmin: s.auth.user?.role === 'admin',
}));
