// lib/db.js
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: '164.90.160.133',
  user: 'nikblom',
  password: 'viininSiemailua',
  database: 'eprices_db',
  port: 3306, // Ensure it's the correct MySQL port (3306 by default)
});
