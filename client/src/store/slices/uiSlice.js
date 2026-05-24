import { createSlice } from "@reduxjs/toolkit";
import { logoutUser } from "./authSlice";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isCartOpen: false,
    isMobileMenuOpen: false,
    isSearchOpen: false,
    ageVerified: false,
  },
  reducers: {
    toggleCart: (s) => {
      s.isCartOpen = !s.isCartOpen;
    },
    setCartOpen: (s, a) => {
      s.isCartOpen = a.payload;
    },
    toggleMobileMenu: (s) => {
      s.isMobileMenuOpen = !s.isMobileMenuOpen;
    },
    setMobileMenuOpen: (s, a) => {
      s.isMobileMenuOpen = a.payload;
    },
    toggleSearch: (s) => {
      s.isSearchOpen = !s.isSearchOpen;
    },
    setAgeVerified: (s, a) => {
      s.ageVerified = a.payload;
    },
  },
  extraReducers: (builder) => {
    // ✅ reset ageVerified when user logs out
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.ageVerified = false;
    });
  },
});

export const {
  toggleCart,
  setCartOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  toggleSearch,
  setAgeVerified,
} = uiSlice.actions;
export default uiSlice.reducer;
