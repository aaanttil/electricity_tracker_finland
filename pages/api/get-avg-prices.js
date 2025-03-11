import mysql from 'mysql2/promise';
require('dotenv').config();

export default async function handler(req, res) {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ message: 'Year and month are required' });
  }

  let connection;

  try {
    // Create a connection to the MySQL database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306, // Default to 3306 if not specified
    });

    console.log('Database connection successful');

    // SQL query to calculate the average price per day
    const query = `
      SELECT DATE(datetime) AS day, AVG(price) AS avg_price
      FROM eprices
      WHERE YEAR(datetime) = ? AND MONTH(datetime) = ?
      GROUP BY day
      ORDER BY day;
    `;

    // Execute the query and pass the year and month as parameters to avoid SQL injection
    const [rows] = await connection.execute(query, [year, month]);

    if (rows.length > 0) {
      console.log('Query executed successfully, rows returned:');
      res.status(200).json(rows); // Send the average prices to the client
    } else {
      console.log('No data found for the specified month');
      res.status(404).json({ message: 'No data found' });
    }

  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (connection) {
      await connection.end(); // Ensure the connection is closed
      console.log('Database connection closed');
    }
  }
}
