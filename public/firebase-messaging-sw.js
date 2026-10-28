
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAHwyE4s_2nSvs1AZefCJWj14_MCbdB2OY",
  authDomain: "emailticketsystem-878ec.firebaseapp.com",
  projectId: "emailticketsystem-878ec",
  storageBucket: "emailticketsystem-878ec.firebasestorage.app",
  messagingSenderId: "1048626026814",
  appId: "1:1048626026814:web:035c090892aaa25b25346f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload.notification?.title || "New Support Ticket";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "A new ticket has been created.",
    icon: "/favicon.ico",
    data: {
      url: payload.data?.url || "/admin/dashboard",
    },
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    event.notification.data?.url || "/admin/dashboard";

  event.waitUntil(clients.openWindow(url));
});
