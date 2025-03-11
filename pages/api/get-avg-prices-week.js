import mysql from 'mysql2/promise';
process.env.TZ = 'Europe/London';
require('dotenv').config();

function getFirstDayOfWeek(year, week) {
  const date = new Date(year, 0, 1);
  date.setDate(date.getDate() + (week - 1) * 7);
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() - 1);
  }
  return date;
}

export default async function handler(req, res) {
  const { year, week } = req.query;

  if (!year || !week) {
    return res.status(400).json({ message: 'Year and week number are required' });
  }

  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306, // Default to 3306 if not specified
    });

    console.log('Database connection successful');

    // Get first day of the week
    const firstDay = getFirstDayOfWeek(parseInt(year), parseInt(week));

    // Fetch data for each day of the week
    const weekData = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(firstDay);
      currentDate.setDate(firstDay.getDate() + i);

      // Calculate start and end times as in get-day.js
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 1);
      startDate.setUTCHours(21, 0, 0);

      const endDate = new Date(currentDate);
      endDate.setUTCHours(21, 0, 0);

      const formattedStartDate = startDate.toISOString().slice(0, 19).replace('T', ' ');
      const formattedEndDate = endDate.toISOString().slice(0, 19).replace('T', ' ');

      // Query for each day
      const query = `
        SELECT *
        FROM eprices
        WHERE datetime >= ?
        AND datetime < ?
      `;

      const [rows] = await connection.execute(query, [formattedStartDate, formattedEndDate]);

      if (rows.length > 0) {
        // Check if we have data for at least 20 hours
        if (rows.length >= 20) {
          // Calculate average price for the day using the same logic as [day].js
          const prices = rows.map(row => (row.price / 10) * 1.255);
          const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

          weekData.push({
            day: currentDate.toISOString().split('T')[0],
            avg_price: avgPrice
          });
        } else {
          // Less than 20 hours of data, set avg_price to 0
          weekData.push({
            day: currentDate.toISOString().split('T')[0],
            avg_price: 0
          });
        }
      } else {
        weekData.push({
          day: currentDate.toISOString().split('T')[0],
          avg_price: 0
        });
      }
    }

    if (weekData.some(day => day.avg_price > 0)) {
      console.log('Week data processed successfully:', weekData);
      res.status(200).json(weekData);
    } else {
      console.log('No data found for the specified week');
      res.status(404).json({ message: 'No data found' });
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}