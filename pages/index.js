// /pages/index.js
import { PriceDisplay } from '../components/PriceDisplay';
import { generatePriceExplanation } from '../components/PriceExplanation';
import Head from 'next/head';


process.env.TZ = 'Europe/Helsinki';

export async function getServerSideProps() {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  const apiUrl = `https://www.sahko.tech/api/get-day?year=${year}&month=${month}&day=${day}`;
   
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    
    return {
      props: {
        initialData: data || [],
        initialDate: { year, month, day }
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error.message);
    return {
      props: {
        initialData: [],
        initialDate: { year, month, day }
      }
    };
  }
}

export default function HomePage({ initialData, initialDate }) {
  return (
    <>
      <Head>
        <title>{"Pörssisähkön hinta tänään | Sahko.tech"}</title>
        <meta name="description" content={generatePriceExplanation(initialData)} />
      </Head>
      
      <div className="responsive-padding">
        <PriceDisplay initialData={initialData} initialDate={initialDate} />
      </div>
    </>
  );
}
