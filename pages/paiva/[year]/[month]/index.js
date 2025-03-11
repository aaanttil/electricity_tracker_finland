import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart.js components for Bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MonthPage({ year, month, chartData }) {
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false, 
      },
      title: {
        display: true,
        text: `Keskihinnat ${month}/${year}`,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Päivä',
        },
        ticks: {
          autoSkip: true,
          callback: (value) => {
            return value % 2 === 0 ? value + 1 : '';
          },
        },
      },
      
    }
  };

  return (
    <div>
      <h1>Vuosi: {year}, Kuukausi: {month}</h1>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}

export async function getStaticProps({ params }) {
  const { year, month } = params;

  // Fetch average prices for the specific month
  const response = await fetch(`https://www.sahko.tech/api/get-avg-prices?year=${year}&month=${month}`);
  const data = await response.json();

  // Adjust prices: divide by 10 and multiply by 1.255
  const adjustedPrices = data.map(item => (item.avg_price / 10) * 1.255);

  // Format the x-axis labels as "day.month"
  const labels = data.map(item => {
    const date = new Date(item.day); // Assuming item.day is a full date string
    const day = date.getDate(); // Extract day
    return `${day}`; // Format as "day"
  });

  // Prepare data for chart, with backgroundColors based on adjusted price
  const backgroundColors = adjustedPrices.map((price) => {
    if (price > 10) return 'rgba(255, 0, 0, 0.5)';  // Red for price > 10
    if (price > 5) return 'rgba(255, 255, 0, 0.5)'; // Yellow for price > 5
    if (price > 0) return 'rgba(0, 128, 0, 0.5)';   // Green for price between 0 and 5
    return 'rgba(0, 0, 255, 0.5)';                   // Blue for price < 0
  });

  const chartData = {
    labels: labels, // Use the formatted day labels
    datasets: [{
      label: 'Keskihinta',
      data: adjustedPrices, // Use the adjusted prices for the chart
      backgroundColor: backgroundColors, // Set the bar colors based on the adjusted price
      borderColor: 'rgba(0, 0, 0, 1)',
      borderWidth: 1
    }]
  };

  return {
    props: {
      year,
      month,
      chartData
    },
    revalidate: 86400, // Revalidate every 24 hours (86400 seconds)
  };
}

export async function getStaticPaths() {
  const response = await fetch(`https://www.sahko.tech/api/months`);
  const months = await response.json();
  
  const paths = months.map((month) => ({
    params: { year: month.year.toString(), month: month.month.toString()}, // Ensure two-digit month format
  }));

  return { paths, fallback: 'blocking' };
}