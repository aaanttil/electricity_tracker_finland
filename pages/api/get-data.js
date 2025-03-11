
import mysql from 'mysql2/promise';
process.env.TZ = 'UTC';

export default async function handler(req, res) {
  const { year, month, day } = req.query;
  let query = '';
  
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

    // Build query based on the request parameters
    if (year && month && day) {
      // Query for a specific day
      query = `
        SELECT * FROM eprices
        WHERE DATE(datetime) = '${year}-${month}-${day}'
      `;
      console.log('Fetching data for specific day:', year, month, day);
    } else if (year && month) {
      // Query for a specific month
      query = `
        SELECT * FROM eprices
        WHERE YEAR(datetime) = ${year} AND MONTH(datetime) = ${month}
      `;
      console.log('Fetching data for specific month:', year, month);
    } else if (year) {
      // Query for a specific year
      query = `
        SELECT * FROM eprices
        WHERE YEAR(datetime) = ${year}
      `;
      console.log('Fetching data for specific year:', year);
    } else {
      // If no parameters, return an error
      console.log('Invalid query, no parameters provided');
      res.status(400).json({ message: 'Invalid query, please provide year, month, or day parameters.' });
      return;
    }

    // Execute the query
    const [rows] = await connection.execute(query);

    // Check if rows are returned
    if (rows.length > 0) {
      console.log('Query executed successfully, rows returned:', rows);
      // Send the result back to the client
      res.status(200).json(rows);
    } else {
      console.log('No data found for the specified parameters');
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
