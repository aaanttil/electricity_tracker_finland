import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import DateNavigation from '../../../components/DateNavigation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import PriceExplanation from '../../../components/PriceExplanationWeek';

process.env.TZ = 'Europe/Helsinki';

// Register chart.js components for Bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function WeekPage({ year, week, chartData, isCurrentWeek }) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [displayDate, setDisplayDate] = useState({ year, week });
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (year && week) {
      const firstDayOfWeek = getFirstDayOfWeek(parseInt(year), parseInt(week));
      setSelectedDate(firstDayOfWeek);
    }
  }, [year, week]);

  useEffect(() => {
    if (router.isReady) {
      const { year: newYear, week: newWeek } = router.query;
      if (newYear && newWeek) {
        const firstDayOfWeek = getFirstDayOfWeek(parseInt(newYear), parseInt(newWeek));
        setSelectedDate(firstDayOfWeek);
        setDisplayDate({ year: newYear, week: newWeek });
      }
    }
  }, [router.query, router.isReady]);

  const handleDateChange = (date) => {
    const newYear = date.getFullYear();
    const newWeek = getWeekNumber(date);
    router.push(`/viikko/${newYear}/${newWeek}`);
  };

  const isMobile = windowWidth < 850;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => `Päivä: ${tooltipItems[0].label}`,
          label: (tooltipItem) => `Keskihinta: ${tooltipItem.raw.toFixed(2)} snt/kWh`,
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: (value) => {
          return isMobile ? '' : value.toFixed(2);
        },
        color: 'rgba(0, 0, 0, 0.6)',
        font: {
          size: 12,
        },
        display: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Päivä',
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Hinta (snt/kWh)',
        },
        beginAtZero: true,
      },
    },
  };

  let content;
  if (!chartData?.datasets?.[0]?.data?.some((price) => price > 0)) {
    content = (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
        <p className="text-xl text-gray-500">Hintoja ei vielä saatavilla</p>
      </div>
    );
  } else {
    content = (
      <div
        className="chart-container"
        style={{ width: '100%', height: '70vh', maxWidth: '2000px', maxHeight: '1000px', margin: 'auto' }}
      >
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  }

  return (
    <div className="responsive-padding">
      <Head>
        <title>{`Pörssisähkön keskihinnat viikolle ${displayDate.week}/${displayDate.year}`}</title>
        <meta
          name="description"
          content={`Katso pörssisähkön keskihinnat viikolle ${displayDate.week}/${displayDate.year}. Päivittäiset keskihinnat visualisoituina kaaviossa.`}
        />
      </Head>
      <div className="container">
        <h2 className="hidden-on-mobile">
          Pörssisähkön keskihinnat viikolle {displayDate.week}/{displayDate.year}
          {isCurrentWeek && ' (Tämä viikko)'}
        </h2>

        <DateNavigation selectedDate={selectedDate} onDateChange={handleDateChange} viewMode="week" />

        {content}

                {chartData?.datasets?.[0]?.data?.some((price) => price > 0) && (
          <PriceExplanation data={chartData.datasets[0].data} labels={chartData.labels} isCurrentWeek={isCurrentWeek} />
        )}
      </div>
    </div>
  );
}

export async function getStaticProps({ params }) {
  const { year, week } = params;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentWeek = getWeekNumber(currentDate);
  const isCurrentWeek = year === currentYear.toString() && week === currentWeek.toString();

  try {
    const response = await fetch(`https://www.sahko.tech/api/get-avg-prices-week?year=${year}&week=${week}`);

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();

    // Create array of dates for the week
    const firstDay = getFirstDayOfWeek(parseInt(year), parseInt(week));
    const weekDays = [];
    const weekDayLabels = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDay);
      date.setDate(date.getDate() + i);
      const formattedDate = date.toISOString().split('T')[0];
      weekDays.push({
        date: formattedDate,
        label: `${weekDayLabels[i]} ${date.getDate()}.${date.getMonth() + 1}.`
      });
    }

    const processedData = weekDays.map(({ date, label }) => {
      const dayData = data.find(item => item.day === date);
      return {
        date,
        label,
        price: dayData ? parseFloat(dayData.avg_price.toFixed(2)) : 0
      };
    });

    if (processedData.some(day => day.price > 0)) {
      const chartData = {
        labels: processedData.map(day => day.label),
        datasets: [{
          label: 'Keskihinta',
          data: processedData.map(day => day.price),
          backgroundColor: processedData.map(day => 
            day.price > 10
              ? 'rgba(255, 0, 0, 0.4)'
              : day.price > 5
              ? 'rgba(255, 255, 0, 0.4)'
              : 'rgba(0, 128, 0, 0.4)'
          ),
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }]
      };

      return {
        props: {
          year,
          week,
          chartData,
          isCurrentWeek,
        },
        revalidate: isCurrentWeek ? 86400 : 604800,
      };
    }

    return {
      props: {
        year,
        week,
        chartData: null,
        isCurrentWeek,
      },
      revalidate: isCurrentWeek ? 300 : false,
    };

  } catch (error) {
    console.error('Error fetching data:', error);
    return { 
      props: { 
        year, 
        week, 
        chartData: null,
        isCurrentWeek 
      },
      revalidate: isCurrentWeek ? 300 : false
    };
  }
}

export async function getStaticPaths() {
  const response = await fetch(`https://www.sahko.tech/api/weeks`);
  const weeks = await response.json();

  const paths = weeks.map(weekData => ({
    params: { year: weekData.year.toString(), week: weekData.week.toString() },
  }));

  return { paths, fallback: 'blocking' };
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getFirstDayOfWeek(year, week) {
  const date = new Date(Date.UTC(year, 0, 1));
  date.setUTCDate(date.getUTCDate() + (week - 1) * 7);
  // Get to Monday (1 is Monday, 0 is Sunday in getUTCDay)
  console.log(date.getUTCDate());
  while (date.getUTCDay() !== 1) {
    date.setUTCDate(date.getUTCDate() - 1);
  }
  return date;
}