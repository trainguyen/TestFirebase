import admin from 'firebase-admin';

// Khởi tạo Firebase Admin SDK (chỉ khởi tạo 1 lần)
if (!admin.apps.length) {
  try {
    // Để gửi thông báo từ server, bạn cần Service Account JSON của Firebase.
    // Cách 1: Sử dụng biến môi trường (Khuyên dùng khi deploy lên Vercel)
    // FIREBASE_SERVICE_ACCOUNT là chuỗi JSON của file service-account.json
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountString) {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
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

  if (!admin.apps.length) {
    return res.status(500).json({ 
      error: 'Firebase Admin chưa được cấu hình. Bạn cần thêm biến môi trường FIREBASE_SERVICE_ACCOUNT chứa nội dung file JSON Service Account.' 
    });
  }

  try {
    const message = {
      notification: {
        title,
        body
      },
      token
    };

    // Gửi thông báo
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);

    return res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: error.message });
  }
}
