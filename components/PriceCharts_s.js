import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { convertPositionToTime } from './posToTime';

Chart.register(...registerables);
Chart.register(ChartDataLabels);

export default function PriceChart({ data }) {
  const chartRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (chartRef.current && data && Array.isArray(data) && data.length > 0) {
      const ctx = chartRef.current.getContext('2d');

      const prices = data.map((item) => (item.price / 10) * 1.255);
      const positions = data.map((item) => item.position);
      
      const minYValue = Math.min(...prices);
      const maxYValue = Math.max(...prices);
      const yMin = minYValue < 0 ? minYValue - 1 : 0;
      const yMax = maxYValue + 1;

      const backgroundColors = prices.map((price) => {
        if (price > 10) return 'rgba(255, 0, 0, 0.5)';
        if (price > 5) return 'rgba(255, 255, 0, 0.5)';
        if (price > 0) return 'rgba(0, 128, 0, 0.5)';
        return 'rgba(0, 0, 255, 0.5)';
      });

      const hours = positions.map((pos) => convertPositionToTime(pos));

      const chart = new Chart(ctx, {
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
                formatter: (value) => value.toFixed(2),
                color: 'black',
                font: {
                  size: isMobile ? 8 : 12
                },
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
                display: !isMobile,
                text: 'Tunti',
                font: {
                  size: isMobile ? 10 : 12
                }
              },
              ticks: {
                maxTicksLimit: isMobile ? 6 : 12,
                callback: (value) => {
                  if (isMobile) {
                    return value % 4 === 0 ? value : '';
                  }
                  return value % 2 === 0 ? value : '';
                },
                font: {
                  size: isMobile ? 8 : 12
                }
              },
            },
            y: {
              title: {
                display: !isMobile,
                text: 'Hinta (snt/kWh)',
                font: {
                  size: isMobile ? 10 : 12
                }
              },
              beginAtZero: true,
              min: yMin,
              max: yMax,
              ticks: {
                font: {
                  size: isMobile ? 8 : 12
                },
                callback: (value) => isMobile ? value.toFixed(1) : value.toFixed(2)
              }
            },
          },
          plugins: {
            datalabels: {
              display: !isMobile,
            },
            legend: {
              display: false,
            },
            tooltip: {
              enabled: true,
              titleFont: {
                size: isMobile ? 10 : 14
              },
              bodyFont: {
                size: isMobile ? 10 : 14
              },
              callbacks: {
                title: (tooltipItems) => `Tunti: ${tooltipItems[0].label}:00`,
                label: (tooltipItem) => `Hinta: ${tooltipItem.raw.toFixed(2)}`,
              },
            },
          },
        },
      });

      return () => chart.destroy();
    }
  }, [data, isMobile]);

  if (!data || data.length === 0) {
    return <p className="text-center p-4">No data available for this date.</p>;
  }

  return (
    <div className="relative w-full h-64 md:h-96 max-w-4xl mx-auto px-2">
      <canvas ref={chartRef} />
    </div>
  );
}