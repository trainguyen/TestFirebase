# Kiến trúc Dự án TestFirebase

## 1. Mô hình các luồng quy trình (Execution Flows)
Dựa trên phân tích từ GitNexus và mã nguồn, dự án hoạt động với 2 luồng chính giao tiếp qua Firebase Cloud Messaging (FCM):

### Luồng 1: Nhận Thông Báo (Client Registration & Listener)
1. **Khởi tạo & Cấp quyền:** Người dùng truy cập trang Client (`src/pages/Client.jsx`). Ứng dụng yêu cầu quyền hiển thị thông báo.
2. **Lấy Token:** Gọi hàm `requestForToken()` trong `src/firebase.js` kết nối với Firebase để lấy FCM Token định danh cho trình duyệt/thiết bị.
3. **Lắng nghe:** Gọi hàm `setupMessageListener()` và `initGlobalFCM()` để lắng nghe các sự kiện nhận thông báo đẩy.
4. **Xử lý ngầm (Background):** `public/firebase-messaging-sw.js` nhận trách nhiệm hiển thị thông báo ngay cả khi đóng tab.

### Luồng 2: Gửi Thông Báo (Admin -> API -> FCM)
1. **Giao diện Admin:** Người dùng truy cập trang `src/pages/Admin.jsx`, nhập nội dung thông báo và Token của thiết bị đích.
2. **Gọi API:** Giao diện gọi API `POST` đến Serverless Function tại `api/send.js`.
3. **Xác thực Admin SDK:** File `api/send.js` khởi tạo Firebase Admin SDK thông qua biến môi trường `FIREBASE_SERVICE_ACCOUNT` hoặc file `service-account.json`.
4. **Gửi Push Notification:** Gọi hàm `getMessaging().send(message)` để đẩy tin nhắn qua máy chủ Firebase. Firebase sau đó sẽ phân phối đến thiết bị Client tương ứng.

## 2. Thông số kết nối Firebase (Firebase Configuration)
Các thông số dùng để khởi tạo Firebase Client-Side (từ file `src/firebase.js`):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDphvwtLh9jndCY9q2yPXAkCLPYmpa4GZY",
  authDomain: "mylove-7f36f.firebaseapp.com",
  projectId: "mylove-7f36f",
  storageBucket: "mylove-7f36f.firebasestorage.app",
  messagingSenderId: "614144014271",
  appId: "1:614144014271:web:9187d109f70c1447f6130a",
  measurementId: "G-T01BTDK0DY"
};
```

> **Lưu ý Bảo mật**:
> Phía Server (`api/send.js`) yêu cầu khóa bí mật (Service Account). Đảm bảo không bao giờ commit file `service-account.json` lên Git.
