import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { convertPositionToTime } from './posToTime';

Chart.register(...registerables);
Chart.register(ChartDataLabels);
process.env.TZ = 'Europe/Helsinki';

export default function PriceChart({ data }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [windowWidth, setWindowWidth] = useState(0);

  // Initialize window width after mount
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to get background colors based on price
  const getBackgroundColors = (prices) => {
    return prices.map(price => {
      if (price > 10) return 'rgba(255, 0, 0, 0.4)';
      if (price > 5) return 'rgba(255, 255, 0, 0.4)';
      if (price > 0) return 'rgba(0, 128, 0, 0.4)';
      return 'rgba(0, 0, 255, 0.5)';
    });
  };

  useEffect(() => {
    // Only create chart on client-side and when we have a valid window width
    if (typeof window === 'undefined' || windowWidth === 0) return;

    // Cleanup previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (chartRef.current && data && Array.isArray(data) && data.length > 0) {
      const ctx = chartRef.current.getContext('2d');

      const prices = data.map((item) => (item.price / 10) * 1.255);
      const positions = data.map((item) => item.position);
      
      const minYValue = Math.min(...prices);
      const maxYValue = Math.max(...prices);
      const yMin = minYValue < 0 ? minYValue - 1 : 0;
      const yMax = maxYValue + 1;

      const backgroundColors = getBackgroundColors(prices);
      const hours = positions.map((pos) => convertPositionToTime(pos));
      const isMobile = windowWidth < 850;

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: hours,
          datasets: [
            {
              data: prices,
              backgroundColor: backgroundColors,
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: (value) => {
                  return isMobile ? '' : value.toFixed(2);
                },
                color: 'rgba(0, 0, 0, 0.6)',
                font: {
                  size: 12
                },
                display: true,
              },
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Tunti',
              },
              ticks: {
                callback: (value) => (value % 2 === 0 ? value : ''),
              },
            },
            y: {
              title: {
                display: true,
                text: 'Hinta (snt/kWh)',
              },
              beginAtZero: true,
              min: yMin,
              max: yMax,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                title: (tooltipItems) => `Tunti: ${tooltipItems[0].label}:00`,
                label: (tooltipItem) => `Hinta: ${tooltipItem.raw.toFixed(2)}`,
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, windowWidth]);

  if (!data || data.length === 0) {
    return <div className="chart-container"><p>Hintoja ei vielä saatavilla.</p></div>;
  }

  if (data.length < 10) {
    return (
      <div className="chart-container">
        <p className="text-xl text-gray-500">Hintoja ei vielä saatavilla</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <canvas 
        ref={chartRef} 
        style={{ 
          width: '100%',
          maxHeight: '60vh' // Add a specific max height
        }} 
      />
    </div>
  );
  
}