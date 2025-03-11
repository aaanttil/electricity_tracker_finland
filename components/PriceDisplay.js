// app/PriceDisplay.js
'use client';
process.env.TZ = 'Europe/Helsinki';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import DateNavigation from './DateNavigation';
import { PriceDisplayGrid } from './PriceDisplayGrid';
import PriceExplanation from './PriceExplanation';


const PriceChart = dynamic(() => import('./PriceChart_homepage'), {
  ssr: false
});

export function PriceDisplay({ initialData, initialDate }) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState(initialData);
  const [selectedDate, setSelectedDate] = useState(
    new Date(`${initialDate.year}-${initialDate.month}-${initialDate.day}`)
  );
  const [displayDate, setDisplayDate] = useState(initialDate);
  const [displayText, setDisplayText] = useState('');

  const handleDateChange = async (date) => {
    const newYear = date.getFullYear().toString();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');
    
    router.push(`/paiva/${newYear}/${newMonth}/${newDay}`);

    try {
      const apiUrl = `https://www.sahko.tech/api/get-day?year=${newYear}&month=${newMonth}&day=${newDay}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch data');
      const newData = await response.json();
      
      setData(newData);
      setSelectedDate(date);
      setDisplayDate({ year: newYear, month: newMonth, day: newDay });
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    }
  };

  const getCurrentHourPrice = () => {
    const currentHour = new Date().getHours();
    const currentPosition = currentHour === 0 ? 24 : currentHour;
    const currentHourData = data.find((item) => item.position === currentPosition);
    return currentHourData ? currentHourData.price / 10 : null;
  };

  useEffect(() => {
    const handlePopState = async () => {
      const path = window.location.pathname;
      const matches = path.match(/\/(\d{4})\/(\d{2})\/(\d{2})/);
      if (matches) {
        const [, year, month, day] = matches;
        const newDate = new Date(`${year}-${month}-${day}`);
        await handleDateChange(newDate);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const updateDisplayText = () => {
      if (window.innerWidth < 768) {
        setDisplayText(``);
      } else {
        setDisplayText(`Pörssisähkön tuntihinnat päivämäärälle: ${displayDate.day}.${displayDate.month}.${displayDate.year}`);
      }
    };

    updateDisplayText();
    window.addEventListener('resize', updateDisplayText);
    return () => window.removeEventListener('resize', updateDisplayText);
  }, [displayDate]);

  return (
    <div className="container">
      <h2 className="text-2xl font-bold">{displayText}</h2>
      
      <DateNavigation 
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
      <PriceChart data={data} />
      <PriceDisplayGrid 
        data={data} 
        currentPrice={getCurrentHourPrice()} 
      />
      <PriceExplanation data={data} date={selectedDate}/>
    </div>
  );
}