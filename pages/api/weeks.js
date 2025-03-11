import mysql from 'mysql2/promise';
require('dotenv').config();

export default async function handler(req, res) {
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

    // SQL query to get distinct weeks and years with data
    const query = `
      SELECT 
        YEAR(datetime) as year, 
        WEEK(datetime, 1) as week  # Using mode 1 to start weeks on Monday
      FROM eprices
      GROUP BY year, week
      ORDER BY year DESC, week DESC;
    `;

    // Execute the query
    const [rows] = await connection.execute(query);

    if (rows.length > 0) {
      console.log('Weeks query executed successfully');
      res.status(200).json(rows);
    } else {
      console.log('No weeks data found');
      res.status(404).json({ message: 'No weeks found' });
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