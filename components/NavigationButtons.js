'use client';

import Link from 'next/link';
process.env.TZ = 'Europe/Helsinki';

export function NavigationButtons() {
  // Calculate tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowYear = tomorrow.getFullYear();
  const tomorrowMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const tomorrowDay = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowPath = `/paiva/${tomorrowYear}/${tomorrowMonth}/${tomorrowDay}`;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentWeek = getWeekNumber(today);
  const weekPath = `/viikko/${currentYear}/${currentWeek}`;
  
  return (
    <div className="flex gap-2">
      <Link href="/">
        <button className="px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600 transition-colors">
          Tänään
        </button>
      </Link>
      <Link href={tomorrowPath}>
        <button className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-600 transition-colors">
          Huomenna
        </button>
      </Link>
      <Link href={weekPath}>
        <button className="px-4 py-2 bg-gray-500 text-black rounded hover:bg-gray-600 transition-colors">
          Viikko
        </button>
      </Link>
    </div>
  );
}


function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
