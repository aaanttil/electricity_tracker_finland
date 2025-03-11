import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DatepickerWithIcon from './Datepicker';
import styles from './DateNavigation.module.css';

const DateNavigation = ({ selectedDate, onDateChange, viewMode = 'day' }) => {
  const navigate = (direction) => {
    if (!selectedDate) return;
    
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    
    if (viewMode === 'week') {
      // Add or subtract 7 days for week navigation
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
      
      // Ensure we land on a Monday
      while (newDate.getDay() !== 1) {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      }
    } else {
      // Regular day navigation
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    
    onDateChange(newDate);
  };

  const formatDisplayDate = () => {
    if (!selectedDate) return '';
    
    const date = new Date(selectedDate);
    if (viewMode === 'week') {
      // Get the end of the week (Sunday)
      const endOfWeek = new Date(date);
      endOfWeek.setDate(date.getDate() + 6);
      
      return `${date.getDate()}.${date.getMonth() + 1} - ${endOfWeek.getDate()}.${endOfWeek.getMonth() + 1}.${endOfWeek.getFullYear()}`;
    }
    
    return date.toLocaleDateString('fi-FI');
  };

  return (
    <div className={styles.navigationContainer}>
      <button
        onClick={() => navigate('prev')}
        className={styles.navigationButton}
        aria-label={viewMode === 'week' ? 'Previous week' : 'Previous day'}
      >
        <ChevronLeft className={styles.icon} />
      </button>

      <DatepickerWithIcon 
        selectedDate={selectedDate} 
        onChange={onDateChange}
        dateFormat={viewMode === 'week' ? 'week' : 'day'}
      />

      <button
        onClick={() => navigate('next')}
        className={styles.navigationButton}
        aria-label={viewMode === 'week' ? 'Next week' : 'Next day'}
      >
        <ChevronRight className={styles.icon} />
      </button>
    </div>
  );
};

export default DateNavigation;