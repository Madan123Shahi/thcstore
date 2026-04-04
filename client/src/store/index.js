import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import orderReducer from './slices/orderSlice';
import uiReducer from './slices/uiSlice';
import wishlistReducer from './slices/wishlistSlice';

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
  key: 'thcstore',
  version: 1,
  storage,
  whitelist: ['auth', 'cart', 'wishlist'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
