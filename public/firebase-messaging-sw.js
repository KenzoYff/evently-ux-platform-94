// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCovHy5DkJOK1NEfG8sNELIXPEKvBDjI14",
  authDomain: "eventos-tecnolog.firebaseapp.com",
  projectId: "eventos-tecnolog",
  storageBucket: "eventos-tecnolog.firebasestorage.app",
  messagingSenderId: "169293941983",
  appId: "1:169293941983:web:2b2fcd0697b2ef7137ad6a"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});