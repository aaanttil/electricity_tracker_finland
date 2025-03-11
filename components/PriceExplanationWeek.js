import React from 'react';

export default function PriceExplanation({ data, labels, isCurrentWeek }) {
  if (!data || !labels || data.length !== labels.length) {
    return null;
  }

  // Calculate average price for the week
  const avgPrice = (data.reduce((sum, price) => sum + price, 0) / data.length).toFixed(2);

  // Find the cheapest and most expensive days
  const minPrice = Math.min(...data).toFixed(2);
  const maxPrice = Math.max(...data).toFixed(2);
  const cheapestDay = labels[data.indexOf(Math.min(...data))];
  const mostExpensiveDay = labels[data.indexOf(Math.max(...data))];

  // Determine tense based on whether it's the current week
  const tense = isCurrentWeek ? 'on' : 'oli';
  const pastTense = isCurrentWeek ? 'ovat' : 'olivat';

  // Find all days with high prices (> 10 snt/kWh)
  const highPriceDays = labels.filter((label, index) => data[index] > 10);

  // Function to format day names (e.g., "maanantai" -> "maanantaina")
  const formatDayName = (day) => {
    const dayMap = {
      ma: 'maanantaina',
      ti: 'tiistaina',
      ke: 'keskiviikkona',
      to: 'torstaina',
      pe: 'perjantaina',
      la: 'lauantaina',
      su: 'sunnuntaina',
    };
    return dayMap[day] || day;
  };

  // Generate explanation text
  let explanation = `Viikon keskihinta ${tense} ${avgPrice} snt/kWh. `;
  explanation += `Halvin päivä ${tense} ${formatDayName(cheapestDay)}, jolloin hinta ${tense} ${minPrice} snt/kWh. `;
  explanation += `Kallein päivä ${tense} ${formatDayName(mostExpensiveDay)}, jolloin hinta ${tense} ${maxPrice} snt/kWh. `;

  // Add description of price levels
  if (avgPrice < 2) {
    explanation += `Sähkö ${tense} erittäin halpaa koko viikon ajan. `;
  } else if (avgPrice < 5) {
    explanation += `Sähkön hinnat ${pastTense} pääosin edulliset. `;
  } else if (avgPrice < 8) {
    if (highPriceDays.length > 0) {
      const highDaysFormatted = highPriceDays.map(formatDayName).join(', ');
      explanation += `Vaikka keskihinta ${tense} kohtuullinen, hinta ${tense} korkea ${highDaysFormatted}. `;
    } else {
      explanation += `Sähkön hinnat ${pastTense} kohtuulliset. `;
    }
  } else if (avgPrice < 12) {
    if (highPriceDays.length > 0) {
      const highDaysFormatted = highPriceDays.map(formatDayName).join(', ');
      explanation += `Keskihinta ${tense} melko korkea, ja hinta ${tense} erityisen korkea ${highDaysFormatted}. `;
    } else {
      explanation += `Sähkön hinnat ${pastTense} melko korkeat. `;
    }
  } else if (avgPrice < 15) {
    explanation += `Sähkö ${tense} kallista. `;
  } else {
    explanation += `Sähkö ${tense} erittäin kallista. `;
  }

  return (
    <div className='stats-container'>
      <h3>Viikon hintatiedot</h3>
      <p>{explanation}</p>
    </div>
  );
}