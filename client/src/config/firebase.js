import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// ✅ Add your Firebase config from Firebase Console
// Console → Project Settings → Your Apps → Web App
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app       = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ─────────────────────────────────────────────
// ✅ Request notification permission + get FCM token
// Call this after user logs in
// ─────────────────────────────────────────────
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // ✅ Get FCM token — send this to your backend to store against user
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, // from Firebase Console
    });

    console.log('FCM Token:', token);
    return token;
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
};

// ─────────────────────────────────────────────
// ✅ Handle foreground messages (when app is open)
// Background messages are handled by firebase-messaging-sw.js
// ─────────────────────────────────────────────
export const onForegroundMessage = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log('FCM foreground message:', payload);
    callback(payload);
  });
};

export { messaging };