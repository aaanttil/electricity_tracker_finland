import mysql from 'mysql2/promise';
require('dotenv').config();

export default async function handler(req, res) {
  try {
    // Create a connection to the MySQL database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306, // Default to 3306 if not specified
    });

    // Query to get the available dates
    const [rows] = await connection.execute(`
      SELECT DISTINCT DATE(datetime) as date FROM eprices
    `);

    // Format the result to match { params: { date: 'YYYY-MM-DD' } }
    const dates = rows.map(row => ({
      params: { date: row.date }, // Use the date directly from the row
    }));

    res.status(200).json(dates);
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
