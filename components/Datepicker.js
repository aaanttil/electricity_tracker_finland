import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import styles from './Datepicker.module.css';
import { registerLocale } from 'react-datepicker';
import fi from 'date-fns/locale/fi';

// Register the Finnish locale
registerLocale('fi', fi);

export default function DatepickerWithIcon({ selectedDate, onChange }) {
  return (
    <div className={styles.datepickerContainer}>
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        calendarStartDay={1}
        locale="fi"
        customInput={
          <div className={styles.datepickerInput}>
            <FaCalendarAlt className={styles.icon} />
            <span>{selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}</span>
          </div>
        }
        dateFormat="dd.MM.yyyy"
      />
    </div>
  );
}