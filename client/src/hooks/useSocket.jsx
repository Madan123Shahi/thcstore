import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { updateOrderRealTime } from '../store/slices/orderSlice';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

// ─────────────────────────────────────────────
// ✅ useSocket — connects to Socket.io server
// Call this once in Layout.jsx so it's always active
// ─────────────────────────────────────────────
export const useSocket = () => {
  const dispatch    = useDispatch();
  const { user }    = useSelector(s => s.auth);
  const socketRef   = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    // ✅ Connect to socket server
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Socket connected');

      // ✅ Join user's private room
      socket.emit('join:user', user._id);

      // ✅ Join admin room if admin
      if (user.role === 'admin') {
        socket.emit('join:admin');
      }
    });

    // ✅ Listen for order status updates
    socket.on('order:updated', (data) => {
      // Update Redux state instantly — no re-fetch needed
      dispatch(updateOrderRealTime(data));

      // Show toast notification to user
      toast.success(
        `Order #${data.orderNumber} is now ${data.orderStatus}`,
        { duration: 5000, icon: '📦' }
      );
    });

    // ✅ Admin: listen for new orders
    socket.on('order:new', (data) => {
      if (user.role === 'admin') {
        toast.success(
          `New order #${data.orderNumber} — ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(data.totalPrice)}`,
          { duration: 6000, icon: '🛒' }
        );
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    // ✅ Cleanup on unmount or user change
    return () => {
      socket.disconnect();
    };
  }, [user?._id, user?.role, dispatch]);

  return socketRef;
};