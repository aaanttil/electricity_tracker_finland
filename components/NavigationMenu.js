'use client';

import React from 'react';
import Link from 'next/link';

const NavigationMenu = ({closeMenu }) => {
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
    <div className="dropdown-menu show bg-dark" style={{ position: 'absolute', width: '200px', right: 0 }}>
      <Link 
        href="/" 
        className="dropdown-item text-light py-2 hover:bg-gray-700"
        onClick={closeMenu}
      >
        Tänään
      </Link>
      <Link 
        href={tomorrowPath}
        className="dropdown-item text-light py-2 hover:bg-gray-700"
        onClick={closeMenu}
      >
        Huomenna
      </Link>
      <Link 
        href={weekPath}
        className="dropdown-item text-light py-2 hover:bg-gray-700"
        onClick={closeMenu}
      >
        Viikko
      </Link>
    </div>
  );
};

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export default NavigationMenu;