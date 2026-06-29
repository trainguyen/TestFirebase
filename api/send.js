import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';

// Khởi tạo Firebase Admin SDK (chỉ khởi tạo 1 lần)
if (!getApps().length) {
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
    
    if (serviceAccountString) {
      const serviceAccount = JSON.parse(serviceAccountString);
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      console.warn("Chưa cấu hình biến môi trường FIREBASE_SERVICE_ACCOUNT và không tìm thấy service-account.json.");
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
