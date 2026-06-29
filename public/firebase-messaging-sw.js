importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDphvwtLh9jndCY9q2yPXAkCLPYmpa4GZY",
  authDomain: "mylove-7f36f.firebaseapp.com",
  projectId: "mylove-7f36f",
  storageBucket: "mylove-7f36f.firebasestorage.app",
  messagingSenderId: "614144014271",
  appId: "1:614144014271:web:9187d109f70c1447f6130a",
  measurementId: "G-T01BTDK0DY"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  const notificationTitle = payload.notification.title || "Background Message";
  const notificationOptions = {
    body: payload.notification.body || "You have a new background message.",
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
