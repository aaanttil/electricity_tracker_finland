import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function PriceChart({ data }) {
  const chartData = {
    labels: data.map((item) => item.hour), // Assuming you have hourly data
    datasets: [
      {
        label: 'Electricity Price (€)',
        data: data.map((item) => item.price),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Hour',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (€)',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
