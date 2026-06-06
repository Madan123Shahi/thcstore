import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import productReducer from "./slices/productSlice";
import categoryReducer from "./slices/categorySlice";
import orderReducer from "./slices/orderSlice";
import uiReducer from "./slices/uiSlice";
import wishlistReducer from "./slices/wishlistSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  products: productReducer,
  categories: categoryReducer,
  orders: orderReducer,
  ui: uiReducer,
  wishlist: wishlistReducer,
});

const persistConfig = {
  key: "thcstore",
  version: 1,
  storage,
  whitelist: ["cart", "wishlist", "ui"], // ✅ only persist what's needed
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ✅ required for redux-persist — ignore its internal actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // ✅ increase threshold — 32ms default is too tight for redux-persist overhead
        // this is dev-only, disabled automatically in production
        warnAfter: 128,
      },
      // ✅ increase immutability check threshold too — same cause
      immutableCheck: { warnAfter: 128 },
    }),
});

export const persistor = persistStore(store);
