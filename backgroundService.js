import sql from 'mssql';
import admin from 'firebase-admin';

// TODO: Khởi tạo Firebase với cấu hình bạn sẽ cung cấp sau
// import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// Cấu hình kết nối SQL Server từ chuỗi kết nối bạn cung cấp
const dbConfig = {
    user: 'mylove',
    password: 'Admin@1234',
    server: 'mylovedb.database.windows.net',
    database: 'mylovedb',
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
    connectionTimeout: 30000,
    requestTimeout: 30000
};

// Hàm hỗ trợ delay (tương tự như Timer.WaitForNextTickAsync trong C#)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class SendNotificationTaskWorker {
    constructor() {
        this.isRunning = false;
        this.intervalDelay = 60 * 1000; // 1 phút (60.000 ms)
    }

    async start() {
        this.isRunning = true;
        console.log("=== Worker Started ===");
        
        while (this.isRunning) {
            await this.doWorkSendNotification();
            
            // Đợi 1 phút trước khi chạy chu kỳ tiếp theo
            await delay(this.intervalDelay);
        }
    }

    stop() {
        this.isRunning = false;
        console.log("=== Worker Stopped ===");
    }

    async doWorkSendNotification() {
        let pool;
        try {
            console.log(`\n[${new Date().toISOString()}] Bắt đầu kiểm tra dữ liệu...`);
            
            // 1. Kết nối cơ sở dữ liệu
            pool = await sql.connect(dbConfig);
            
            // 2. Lấy dữ liệu từ bảng NotificationHistory chưa gửi
            const result = await pool.request().query(`
                SELECT Id, Title, Type, Status
                FROM NotificationHistory 
                WHERE Status IS NULL OR Status != 'Y'
            `);
            
            const listNotifications = result.recordset;
            
            if (listNotifications.length === 0) {
                console.log("Không có thông báo nào cần gửi.");
                return;
            }

            console.log(`Tìm thấy ${listNotifications.length} thông báo cần gửi.`);

            // 3. Lặp qua danh sách và xử lý (Giống như foreach trong C#)
            for (const item of listNotifications) {
                try {
                    // 3.1 Gửi qua Firebase
                    await this.sendToFirebase(item);
                    
                    // 3.2 Cập nhật trạng thái thành 'Y' nếu gửi thành công
                    await this.updateStatus(pool, item.Id);
                } catch (err) {
                    console.error(`Lỗi khi xử lý thông báo Id ${item.Id}:`, err);
                    // Bỏ qua lỗi và tiếp tục xử lý các thông báo khác
                }
            }
            
        } catch (error) {
            console.error("Lỗi trong quá trình kết nối hoặc lấy dữ liệu:", error);
        } finally {
            // Đóng kết nối để giải phóng tài nguyên
            if (pool) {
                await pool.close();
            }
        }
    }

    async sendToFirebase(item) {
        // TODO: Chờ cấu hình firebase sẽ hoàn thiện phần này
        console.log(`[Firebase] Đang gửi thông báo: ${item.Title} (Type: ${item.Type})`);
        
        /* 
        Đoạn code mẫu khi có cấu hình Firebase:
        
        const message = {
            notification: {
                title: item.Title || 'Tiêu đề',
                body: item.Type || 'Nội dung'
            },
            topic: 'all' // Hoặc gửi theo token
        };
        
        await admin.messaging().send(message);
        */
        
        console.log(`[Firebase] Gửi thành công thông báo Id: ${item.Id}`);
    }

    async updateStatus(pool, id) {
        // Cập nhật trạng thái 'Y' và ghi nhận thời gian gửi
        await pool.request()
            .input('Id', id) 
            .query(`
                UPDATE NotificationHistory 
                SET Status = 'Y', SentTime = GETDATE() 
                WHERE Id = @Id
            `);
            
        console.log(`[DB] Đã cập nhật trạng thái 'Y' cho Id: ${id}`);
    }
}

// Khởi chạy service
const worker = new SendNotificationTaskWorker();
worker.start();
