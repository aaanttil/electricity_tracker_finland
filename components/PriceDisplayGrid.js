import React from 'react';

export const PriceDisplayGrid = ({ data, currentPrice }) => {
  const calculateStats = () => {
    if (!data || data.length === 0) {
      return {
        highest: 'No data',
        lowest: 'No data',
        average: 'No data',
      };
    }
    const prices = data.map((item) => (item.price / 10) * 1.255); // Convert to snt/kWh
    const highest = `${Math.max(...prices).toFixed(2)}`;
    const lowest = `${Math.min(...prices).toFixed(2)}`;
    const average = `${(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)}`;
    currentPrice = currentPrice * 1.255;
    return { highest, lowest, average };
  };

  const stats = calculateStats();

  return (
    <div className="stats-container chart-container">
      <div className="stats-wrapper">
        {/* Current Price */}
        <div className="stats-box">
          <h6 className="stats-heading">Hinta nyt</h6>
          <p className="stats-text">
            {currentPrice ? `${currentPrice.toFixed(2)} snt/kWh` : 'No data'}
          </p>
        </div>

        {/* Highest/Lowest of the Day */}
        <div className="stats-box">
          <h6 className="stats-heading">Ylin/Alin</h6>
          <p className="stats-text">
            {stats.highest}/{stats.lowest} snt/kWh
          </p>
        </div>

        {/* Average Price */}
        <div className="stats-box stats-box-highlight">
          <h6 className="stats-heading">Keskihinta</h6>
          <p className="stats-text">{stats.average} snt/kWh</p>
        </div>
      </div>
    </div>
  );
};
