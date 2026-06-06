import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { requestNotificationPermission, onForegroundMessage } from '../config/firebase';
import api from '../utils/api';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────
// ✅ useFCM — requests permission, gets token,
// sends token to backend, listens for foreground messages
// Call this once in Layout.jsx after user logs in
// ─────────────────────────────────────────────
export const useFCM = () => {
  const { user } = useSelector(s => s.auth);

  useEffect(() => {
    if (!user?._id) return;

    const setupFCM = async () => {
      const token = await requestNotificationPermission();
      if (!token) return;

      // ✅ Send FCM token to backend to store against user
      try {
        await api.post('/auth/fcm-token', { token });
      } catch (err) {
        console.error('Failed to save FCM token:', err);
      }

      // ✅ Handle foreground notifications (app is open)
      const unsubscribe = onForegroundMessage((payload) => {
        const { title, body } = payload.notification || {};
        if (title) {
          toast(body || title, {
            icon: '🔔',
            duration: 6000,
          });
        }
      });

      return unsubscribe;
    };

    let cleanup;
    setupFCM().then(fn => { cleanup = fn; });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, [user?._id]);
};