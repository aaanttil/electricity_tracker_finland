import mysql from 'mysql2/promise';
process.env.TZ = 'Europe/London';
require('dotenv').config();

export default async function handler(req, res) {
  // Get year, month, and day from the request parameters
  const { year, month, day } = req.query;

  // Create a date object for the specified day
  const specifiedDate = new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed in JS
  const startDate = new Date(specifiedDate);
  startDate.setDate(specifiedDate.getDate() - 1);

  startDate.setUTCHours(21, 0, 0); 

  // Set the end time to 21:00:00 of the specified date
  const endDate = new Date(specifiedDate);
  endDate.setUTCHours(21, 0, 0); // Set end time to 21:00:00 UTC

  const formattedStartDate = startDate.toISOString().slice(0, 19).replace('T', ' '); // Format as YYYY-MM-DD HH:MM:SS
  const formattedEndDate = endDate.toISOString().slice(0, 19).replace('T', ' '); // Format as YYYY-MM-DD HH:MM:SS

  // Log the constructed dates for debugging
  console.log('formStart Date:', formattedStartDate);
  console.log('formEnd Date:', formattedEndDate);

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

    // Execute a query for the specified date
    const query = ` 
      SELECT *  
      FROM eprices
      WHERE datetime >= '${formattedStartDate}' 
      AND datetime < '${formattedEndDate}'
    `;

    // Use parameters to avoid SQL injection
    const [rows] = await connection.execute(query);

    // Check if rows are returned and if there are at least 20 hours of data
    if (rows.length > 0) {
      if (rows.length >= 20) {
        console.log('Query executed successfully, rows returned:', rows);
        // Send the result back to the client
        res.status(200).json(rows);
      } else {
        console.log('Less than 20 hours of data available');
        res.status(200).json([]); // Return empty array for insufficient data
      }
    } else {
      console.log('No data found for the specified date');
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