import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { addToCart } from "../store/slices/cartSlice";
import { toggleCart } from "../store/slices/uiSlice";
import { toggleWishlist } from "../store/slices/wishlistSlice";
import { selectIsWishlisted } from "../store/slices/wishlistSlice";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

export const useCart = () => {
  const dispatch = useDispatch();
  const handleAddToCart = useCallback(
    (product, quantity = 1) => {
      dispatch(addToCart({ product, quantity }));
      dispatch(toggleCart());
      toast.success(`${product.name} added to cart!`);
    },
    [dispatch],
  );
  return { handleAddToCart };
};

export const useWishlist = (productId) => {
  const dispatch = useDispatch();
  const isWishlisted = useSelector(selectIsWishlisted(productId));
  const user = useSelector((s) => s.auth.user);

  const handleToggle = useCallback(() => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }
    dispatch(toggleWishlist(productId));
  }, [dispatch, productId, user]);

  return { isWishlisted, handleToggle };
};

// ✅ token removed — auth is now based on user + cookie
const selectAuth = createSelector(
  (s) => s.auth.user,
  (s) => s.auth.fetchMeLoading, // ✅ was s.auth.loading (wrong key)
  (s) => s.auth.fetchMeError, // ✅ was s.auth.error (wrong key)
  (user, fetchMeLoading, fetchMeError) => ({
    user,
    fetchMeLoading,
    fetchMeError,
    isLoggedIn: !!user, // ✅ was !!token — token no longer exists
    isAdmin: user?.role === "admin",
  }),
);

export const useAuth = () => useSelector(selectAuth);
