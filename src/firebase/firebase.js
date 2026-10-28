
import { initializeApp, getApps, getApp } from "firebase/app";

import {
  getMessaging,
  isSupported,
  getToken,
  onMessage,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAHwyE4s_2nSvs1AZefCJWj14_MCbdB2OY",
  authDomain: "emailticketsystem-878ec.firebaseapp.com",
  projectId: "emailticketsystem-878ec",
  storageBucket: "emailticketsystem-878ec.firebasestorage.app",
  messagingSenderId: "1048626026814",
  appId: "1:1048626026814:web:035c090892aaa25b25346f",
  measurementId: "G-D4VH26SBP9",
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Get Firebase Messaging safely
export async function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;

  if (!("serviceWorker" in navigator)) return null;

  try {
    if (!(await isSupported())) return null;

    return getMessaging(firebaseApp);
  } catch (error) {
    console.error("Firebase Messaging initialization error:", error);
    return null;
  }
}

// Request notification permission and generate FCM token
export async function getAdminPushToken() {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator)
  ) {
    throw new Error(
      "This browser does not support push notifications."
    );
  }

  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    throw new Error("Firebase Messaging is not supported.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Please allow notification permission.");
  }

  // Register the service worker from the public folder
  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );

  const token = await getToken(messaging, {
    vapidKey:
      "BIckSEjhgHFvT1qvkFMIqip85U_KaiIucMEJYyruoMvibKVKy_QEuTDmFidiK1RdGc8QD_H3M3O5NFINN3SUpqA",
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error("FCM token could not be generated.");
  }

  console.log("FCM token generated successfully.");

  return token;
}

// Backward-compatible function name
export async function requestNotificationPermission() {
  try {
    return await getAdminPushToken();
  } catch (error) {
    console.error("FCM setup error:", error);
    return null;
  }
}

// Listen for messages while the website is open
export async function listenForForegroundMessages(callback) {
  const messaging = await getFirebaseMessaging();

  if (!messaging) return () => {};

  return onMessage(messaging, callback);
}

// Optional: export Firebase SDK functions if needed elsewhere
export { getToken, onMessage };
