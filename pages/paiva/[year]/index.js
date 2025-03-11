import { useState, useEffect } from 'react';

export default function YearPage({ year }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Fetch the base URL from environment variables
    // Create the full URL for fetching year-specific data
    const apiUrl = `https://www.sahko.tech/api/get-data?year=${year}`;

    // Fetch data for the entire year
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, [year]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Year: {year}</h1>
      {/* Display data or charts related to the year */}
    </div>
  );
}

export async function getStaticPaths() {
  
  const response = await fetch(`https://www.sahko.tech/api/years`);
  const years = await response.json();
  const paths = years.map((year) => ({ params: { year: year.toString() } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { year } = params;
  const apiUrl = `https://www.sahko.tech/api/get-data?year=${year}`;
  
  const response = await fetch(apiUrl);
  const yearData = await response.json();

  return {
    props: {
      year,
      yearData, // Pass the fetched year-specific data to the component
    },
  };
}