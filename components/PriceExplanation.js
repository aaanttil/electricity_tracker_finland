import React from 'react';
import { convertPositionToTime } from './posToTime';

// Function to format date in Finnish
function formatFinnishDate(date) {
  const weekdays = ['Sunnuntaina', 'Maanantaina', 'Tiistaina', 'Keskiviikkona', 'Torstaina', 'Perjantaina', 'Lauantaina'];
  const months = ['tammikuuta', 'helmikuuta', 'maaliskuuta', 'huhtikuuta', 'toukokuuta', 'kesäkuuta', 
                 'heinäkuuta', 'elokuuta', 'syyskuuta', 'lokakuuta', 'marraskuuta', 'joulukuuta'];
  
  const d = new Date(date);
  const weekday = weekdays[d.getDay()];
  const day = d.getDate();
  const month = months[d.getMonth()];
  
  return `${weekday} ${day}. ${month}`;
}

function calculateMiddle16Mean(prices) {
  if (prices.length < 16) return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  
  // Sort prices
  const sortedPrices = [...prices].sort((a, b) => a - b);
  
  // Calculate start index to get middle 16 prices
  // For 24 prices: (24 - 16) / 2 = 4, so we start at index 4 to get indices 4-19 (16 prices)
  const startIndex = Math.floor((prices.length - 16) / 2);
  const middle16 = sortedPrices.slice(startIndex, startIndex + 16);
  
  // Calculate mean of middle 16 prices
  return middle16.reduce((sum, price) => sum + price, 0) / 16;
}

export function generatePriceExplanation(data, date) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return 'Hintatietoja ei ole saatavilla tälle päivälle.';
  }

  // Format the date first
  const formattedDate = formatFinnishDate(date);

  // Check if the date is before today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const isPastDate = targetDate < today;

  // Convert prices from €/MWh to snt/kWh (divide by 10 and multiply by 1.255 for tax)
  const convertPrice = (price) => (price / 10 * 1.255).toFixed(2);

  // Extract and convert prices
  const prices = data.map((entry) => parseFloat(convertPrice(entry.price)));

  // Calculate min, max, and average prices
  const minPrice = Math.min(...prices).toFixed(2);
  const maxPrice = Math.max(...prices).toFixed(2);
  const avgPrice = (prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2);
  const middle16Mean = calculateMiddle16Mean(prices).toFixed(2);

  // Find the positions with the lowest and highest price
  const minPosition = data.find(
    (entry) => parseFloat(convertPrice(entry.price)) === parseFloat(minPrice)
  ).position;
  const maxPosition = data.find(
    (entry) => parseFloat(convertPrice(entry.price)) === parseFloat(maxPrice)
  ).position;

  // Convert positions to time strings (without minutes)
  const minTime = convertPositionToTime(minPosition);
  const maxTime = convertPositionToTime(maxPosition);

  // Define verb forms based on tense
  const vaihteluVerb = isPastDate ? 'vaihteli' : 'vaihtelee';
  const oliVerb = isPastDate ? 'oli' : 'on';
  const oleVerb = isPastDate ? 'ollut' : 'ole';
  const olivatVerb = isPastDate ? 'olivat' : 'ovat';

  // Generate price level description based on average price
  let priceDescription = '';
  if (avgPrice < 2) {
    priceDescription = `Sähkö ${oliVerb} todella halpaa (päivän keskihinta ${avgPrice} snt/kWh)`;
  } else if (avgPrice < 5) {
    priceDescription = `Sähkö ${oliVerb} melko edullista (päivän keskihinta ${avgPrice} snt/kWh)`;
  } else if (avgPrice < 8) {
    priceDescription = `Sähkö ei ${oleVerb} kovin kallista (päivän keskihinta ${avgPrice} snt/kWh)`;
  } else if (avgPrice < 12) {
    priceDescription = `Sähkön hinta ${oliVerb} jokseenkin korkea (päivän keskihinta ${avgPrice} snt/kWh)`;
  } else if (avgPrice < 15) {
    priceDescription = `Sähkö ${oliVerb} kallista (päivän keskihinta ${avgPrice} snt/kWh)`;
  } else {
    priceDescription = `Sähkö ${oliVerb} erittäin kallista (päivän keskihinta ${avgPrice} snt/kWh)`;
  }

  // Check for price spikes (hours where price > 20)
  const spikeHours = data
    .filter(entry => parseFloat(convertPrice(entry.price)) > parseFloat(middle16Mean) * 1.5 && parseFloat(convertPrice(entry.price)) > 10)
    .map(entry => convertPositionToTime(entry.position));

  // Generate the explanation text - start with date and price description
  let explanation = `${formattedDate}: ${priceDescription}. `;
  explanation += `Sähkön hinta ${vaihteluVerb} ${minPrice} snt/kWh ja ${maxPrice} snt/kWh välillä. `;

  // Add spike hours information
  if (spikeHours.length > 0 && spikeHours.length <= 6 && spikeHours.length > 1 && parseFloat(middle16Mean) < 10) {
    const spikeText = spikeHours.join(', ');
    explanation += `Hintataso ${oliVerb} pääosin kohtuullinen, lukuunottamatta hintapiikkejä klo ${spikeText}. `;
  }

  if (spikeHours.length > 0 && spikeHours.length == 1 && parseFloat(middle16Mean) < 10) {
    const spikeText = spikeHours.join(', ');
    explanation += `Hintataso ${oliVerb} pääosin kohtuullinen, lukuunottamatta klo ${spikeText} hintapiikkiä. `;
  }

  explanation += `Halvin tunti ${oliVerb} klo ${minTime}, jolloin hinta ${oliVerb} ${minPrice} snt/kWh. `;
  explanation += `Kallein tunti ${oliVerb} klo ${maxTime}, jolloin hinta ${oliVerb} ${maxPrice} snt/kWh. `;

  return explanation;
}

export default function PriceExplanation({ data, date }) {
  const explanation = generatePriceExplanation(data, date);

  return (
    <div className='stats-container'>
      <h3>Päivän hintatiedot</h3>
      <p>{explanation}</p>
    </div>
  );
}