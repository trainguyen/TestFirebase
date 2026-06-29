import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      // VAPID key is optional if you have configured it in Firebase Console, 
      // but recommended to put here if you generate one in Project Settings > Cloud Messaging > Web configuration
      // vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE'
    });
    if (currentToken) {
      console.log('current token for client: ', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
