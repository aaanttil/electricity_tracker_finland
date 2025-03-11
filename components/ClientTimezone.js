import React, { useEffect, useState } from 'react';

const ClientTimezone = () => {
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(clientTimezone);
  }, []);

  return (
    <div>
      <p>Your current timezone is: {timezone}</p>
    </div>
  );
};

export default ClientTimezone;
