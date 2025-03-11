import { db } from '../../lib/db';

export default async function handler(req, res) {
  const { day } = req.query;

  if (!day) {
    return res.status(400).json({ error: 'Day is required' });
  }

  const [rows] = await db.execute('SELECT * FROM eprices WHERE date = ?', [day]);

  if (!rows.length) {
    return res.status(404).json({ error: 'No data found for the given day' });
  }

  res.status(200).json(rows);
}
