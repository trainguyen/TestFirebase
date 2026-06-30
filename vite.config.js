import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';
import sql from 'mssql';

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

// Tạo plugin Vite để mô phỏng Serverless Function của Vercel chạy ở môi trường local
function firebaseApiPlugin() {
  return {
    name: 'firebase-api',
    configureServer(server) {
      server.middlewares.use('/api/save-token', (req, res, next) => {
        if (req.method !== 'POST') return next();
        
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            if (!data.token) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing token' }));
              return;
            }

            const pool = await sql.connect(dbConfig);
            
            const checkResult = await pool.request()
              .input('Token', sql.NVarChar, data.token)
              .query('SELECT TOP 1 Id FROM DeviceTokens WHERE Token = @Token');
              
            if (checkResult.recordset.length === 0) {
              await pool.request()
                .input('Token', sql.NVarChar, data.token)
                .query('INSERT INTO DeviceTokens (Token) VALUES (@Token)');
            }
            
            await pool.close();
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            console.error("Lỗi lưu token:", e);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      server.middlewares.use('/api/send', (req, res, next) => {
        if (req.method !== 'POST') return next();
        
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', async () => {
          try {
            // Khởi tạo Firebase Admin nếu chưa khởi tạo
            if (!getApps().length) {
              const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
              if (fs.existsSync(serviceAccountPath)) {
                const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
                initializeApp({
                  credential: cert(serviceAccount)
                });
              } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
                initializeApp({
                  credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
                });
              } else {
                throw new Error("Không tìm thấy service-account.json hoặc biến môi trường FIREBASE_SERVICE_ACCOUNT");
              }
            }

            const data = JSON.parse(body);
            
            if (!data.token || !data.title || !data.body) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing token, title, or body' }));
              return;
            }

            const message = {
              notification: { title: data.title, body: data.body },
              token: data.token
            };

            const response = await getMessaging().send(message);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, messageId: response }));
          } catch (e) {
            console.error("Lỗi gửi thông báo:", e);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), firebaseApiPlugin()],
});
