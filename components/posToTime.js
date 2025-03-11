
export function convertPositionToTime(position) {
    // Subtract 1 from the position and handle the case where position = 24
    const hour = (position) % 24;
  
    // If the hour is 23, set it to '00' (for midnight)
    const formattedHour = hour === 24 ? '00' : hour.toString().padStart(2, '0');
  
    // Append ':00' to create the full time string
    return `${formattedHour}:00`;
  }
  