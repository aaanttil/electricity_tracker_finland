'use client';

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

  const getCurrentHour = () => {
    return new Date().getHours();
  };

  // Function to get background colors and borders
  const getBackgroundColorsAndBorders = (prices) => {
    const currentHour = getCurrentHour();

    const backgroundColors = [];
    const borderColors = [];
    const borderWidths = [];

    prices.forEach((price, index) => {
      let color, borderColor, borderWidth;
      if (price > 10) color = 'rgba(255, 0, 0, 0.4)';
      else if (price > 5) color = 'rgba(255, 225, 0, 0.4)'; // Orange instead of yellow
      else if (price > 0) color = 'rgba(0, 128, 0, 0.4)';
      else color = 'rgba(0, 0, 255, 0.3)';

      borderColor = 'rgba(0, 0, 0, 0.2)';
      borderWidth = 1;

      // Highlight current hour
      if (index === currentHour) {
        if (price > 10) color = 'rgba(255, 0, 0, 1)';
        else if (price > 5) color = 'rgba(255, 225, 0, 1)'; // Bright orange
        else if (price > 0) color = 'rgba(0, 128, 0, 1)'; // Dark green
        else color = 'rgba(0, 0, 255, 0.9)';

        borderColor = 'rgba(0, 0, 0, 1)'; // Bold black border
        borderWidth = 3;
      }

      backgroundColors.push(color);
      borderColors.push(borderColor);
      borderWidths.push(borderWidth);
    });

    return { backgroundColors, borderColors, borderWidths };
  };

  useEffect(() => {
    if (typeof window === 'undefined' || windowWidth === 0) return;

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

      const { backgroundColors, borderColors, borderWidths } = getBackgroundColorsAndBorders(prices);
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
              borderColor: borderColors,
              borderWidth: borderWidths,
              datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: (value, context) => {
                  const currentHour = getCurrentHour();
                  const index = context.dataIndex;

                  // Show current hour value on mobile, and all values on desktop
                  if (isMobile) {
                    return index === currentHour ? value.toFixed(2) : '';
                  }
                  return value.toFixed(2);
                },
                color: 'rgba(0, 0, 0, 0.6)',
                font: {
                  size: 12,
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
    <div className="chart-container" style={{ width: '100%', height: '60vh', maxWidth: '2000px', maxHeight: '1000px', margin: 'auto' }}>
      <canvas ref={chartRef} style={{ minHeight: '100%' }} />
    </div>
  );
}
