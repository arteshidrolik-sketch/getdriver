"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, Messaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDam6iLsnNkPghBZpha7FIxXQTbw6pagNc",
  authDomain: "getdriver-b3f3b.firebaseapp.com",
  projectId: "getdriver-b3f3b",
  storageBucket: "getdriver-b3f3b.firebasestorage.app",
  messagingSenderId: "104360669536",
  appId: "1:104360669536:web:9903be9d3e6f2d3e5fee05",
  measurementId: "G-CE0KBWCC95"
};

// Initialize Firebase only on client
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export async function initFirebase(): Promise<{ app: FirebaseApp; messaging: Messaging } | null> {
  if (typeof window === "undefined") return null;
  
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("Firebase messaging not supported");
      return null;
    }
    
    if (!app) {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    }
    
    messaging = getMessaging(app);
    return { app, messaging };
  } catch (error) {
    console.error("Firebase init error:", error);
    return null;
  }
}

// Request permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const firebase = await initFirebase();
    if (!firebase?.messaging) return null;
    
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    
    const token = await getToken(firebase.messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    });
    
    return token;
  } catch (error) {
    console.error("FCM token error:", error);
    return null;
  }
}

// Listen for foreground messages
export function onMessageListener(callback: (payload: any) => void) {
  if (typeof window === "undefined") return () => {};
  
  return new Promise((resolve) => {
    initFirebase().then((firebase) => {
      if (firebase?.messaging) {
        const unsubscribe = onMessage(firebase.messaging, (payload) => {
          callback(payload);
        });
        resolve(unsubscribe);
      } else {
        resolve(() => {});
      }
    });
  }).then((unsubscribe: () => void) => unsubscribe);
}