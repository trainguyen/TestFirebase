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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Missing token' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    
    // Kiểm tra xem token đã tồn tại chưa để tránh lưu trùng
    const checkResult = await pool.request()
      .input('Token', sql.NVarChar, token)
      .query('SELECT TOP 1 Id FROM DeviceTokens WHERE Token = @Token');
      
    if (checkResult.recordset.length === 0) {
      await pool.request()
        .input('Token', sql.NVarChar, token)
        .query('INSERT INTO DeviceTokens (Token) VALUES (@Token)');
    }
    
    await pool.close();
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving token:', error);
    return res.status(500).json({ error: error.message });
  }
}
