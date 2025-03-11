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

    // Query to fetch distinct months and years from the `eprices` table
    const query = `
      SELECT DISTINCT 
        YEAR(datetime) as year, 
        MONTH(datetime) as month
      FROM eprices
      ORDER BY year, month
    `;
    const [rows] = await connection.execute(query);

    // If rows are returned, send them back to the client
    if (rows.length > 0) {
      console.log('Months and years fetched successfully:');
      res.status(200).json(rows); // Send the rows as JSON response
    } else {
      console.log('No data found');
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
