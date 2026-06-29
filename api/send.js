import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Khởi tạo Firebase Admin SDK (chỉ khởi tạo 1 lần)
if (!getApps().length) {
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountString) {
      const serviceAccount = JSON.parse(serviceAccountString);
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      console.warn("Chưa cấu hình biến môi trường FIREBASE_SERVICE_ACCOUNT.");
    }
  } catch (error) {
    console.error("Lỗi khởi tạo Firebase Admin:", error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: 'Missing token, title, or body' });
  }

  if (!getApps().length) {
    return res.status(500).json({ 
      error: 'Firebase Admin chưa được cấu hình. Bạn cần thêm biến môi trường FIREBASE_SERVICE_ACCOUNT chứa nội dung file JSON Service Account.' 
    });
  }

  try {
    const message = {
      notification: { title, body },
      token
    };

    const response = await getMessaging().send(message);
    console.log('Successfully sent message:', response);

    return res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: error.message });
  }
}
