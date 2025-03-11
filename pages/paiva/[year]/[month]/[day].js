import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PriceChart from '../../../../components/PriceCharts';
import DateNavigation from '../../../../components/DateNavigation';
import Link from 'next/link';
import Head from 'next/head';
import PriceExplanation from '../../../../components/PriceExplanation';
import { generatePriceExplanation } from '../../../../components/PriceExplanation';

export default function DayPage({ year, month, day, data }) {
  const router = useRouter();
  const initialDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [displayDate, setDisplayDate] = useState({ year, month, day });

  // Calculate tomorrow's date for the navigation
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


  const generateTitle = () => {
    return `Pörssisähkön hinta ${displayDate.day}.${displayDate.month}.${displayDate.year} | Sahko.tech`;
  };

  const handleDateChange = (date) => {
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');

    router.push(`/paiva/${newYear}/${newMonth}/${newDay}`);
  };

  useEffect(() => {
    if (router.isReady) {
      const { year: newYear, month: newMonth, day: newDay } = router.query;
      if (newYear && newMonth && newDay) {
        const newSelectedDate = new Date(`${newYear}-${newMonth.padStart(2, '0')}-${newDay.padStart(2, '0')}`);
        setSelectedDate(newSelectedDate);
        setDisplayDate({ year: newYear, month: newMonth, day: newDay });
      }
    }
  }, [router.query, router.isReady]);

  return (
  <>
    <Head>
      <title>{generateTitle()}</title>
      <meta name="description" content={generatePriceExplanation(data)} />
    </Head>
    <div className="responsive-padding">
      <div className="container">
        <h2 className="hidden-on-mobile">
          Pörssisähkön tuntihinnat päivämäärälle: {displayDate.day}.{displayDate.month}.{displayDate.year}
        </h2>
        
        <DateNavigation 
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
        <PriceChart data={data} />

        {/* Use the PriceExplanation component */}
        <PriceExplanation data={data} date={selectedDate}/>
      </div>      
    </div>
  </>
  );
}
export async function getStaticProps({ params }) {
  const { year, month, day } = params;
  const date = new Date(`${year}-${month}-${day}`);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Calculate seconds until midnight
  const nowUTC = now.getTime();
  const midnightUTC = new Date(now);
  midnightUTC.setHours(24, 0, 0, 0); // Set to midnight UTC
  const secondsUntilMidnight = Math.round((midnightUTC.getTime() - nowUTC) / 1000);

  // Create the full URL for fetching day-specific data
  const apiUrl = `https://www.sahko.tech/api/get-day?year=${year}&month=${month}&day=${day}`;
  const isFutureDate = date > now;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error('Failed to fetch data:', response.statusText);
      return { 
        props: { year, month, day, data: null },
        revalidate: isFutureDate ? 300 : secondsUntilMidnight, // Future dates revalidate every 5 minutes
      };
    }

    const data = await response.json();

    return {
      props: {
        year,
        month,
        day,
        data,
      },
      // Adjust revalidation strategy:
      // - Future dates: revalidate every 5 minutes
      // - Past or current day: revalidate at midnight
      revalidate: isFutureDate ? 300 : secondsUntilMidnight,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { 
      props: { year, month, day, data: null },
      revalidate: isFutureDate ? 300 : secondsUntilMidnight,
    };
  }
}


export async function getStaticPaths() {
  // Fetch all possible dates from the API
  const response = await fetch(`https://www.sahko.tech/api/dates`);
  const dates = await response.json();

  if (!Array.isArray(dates)) {
    console.error('Dates data is not an array:', dates);
    return { paths: [], fallback: false };
  }

  const paths = dates.map((dateObj) => {
    if (dateObj.params && dateObj.params.date) {
      const date = new Date(dateObj.params.date);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure two-digit format for month
      const day = date.getDate().toString().padStart(2, '0'); // Ensure two-digit format for day

      return {
        params: {
          year,
          month,
          day,
        },
      };
    } else {
      console.error('Date object is missing properties:', dateObj);
      return null; // Handle invalid date object
    }
  }).filter(Boolean); // Remove any null values

  return { paths, fallback: 'blocking' };
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
