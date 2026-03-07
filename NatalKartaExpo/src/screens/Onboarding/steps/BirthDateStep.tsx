import React from 'react';
import { View, StyleSheet } from 'react-native';
import AstralDatePicker from '../../../components/AstralDatePicker';

interface BirthDateStepProps {
  selectedDate: {
    day: number;
    month: number;
    year: number;
  };
  onDateChange: (type: 'day' | 'month' | 'year', value: number) => void;
}

const BirthDateStep: React.FC<BirthDateStepProps> = ({ selectedDate, onDateChange }) => {
  // Generate data matching the AstralDatePicker expectations
  const days = Array.from({ length: 31 }, (_, i) => ({
    label: String(i + 1).padStart(2, '0'),
    value: i + 1,
  }));

  const months = [
    { value: 1, label: 'Январь' },
    { value: 2, label: 'Февраль' },
    { value: 3, label: 'Март' },
    { value: 4, label: 'Апрель' },
    { value: 5, label: 'Май' },
    { value: 6, label: 'Июнь' },
    { value: 7, label: 'Июль' },
    { value: 8, label: 'Август' },
    { value: 9, label: 'Сентябрь' },
    { value: 10, label: 'Октябрь' },
    { value: 11, label: 'Ноябрь' },
    { value: 12, label: 'Декабрь' },
  ];

  const years = Array.from({ length: 125 }, (_, i) => ({
    label: String(new Date().getFullYear() - i),
    value: new Date().getFullYear() - i,
  }));

  return (
    <View style={styles.stepContainer}>
      <AstralDatePicker
        days={days}
        months={months}
        years={years}
        selectedDay={selectedDate.day}
        selectedMonth={selectedDate.month}
        selectedYear={selectedDate.year}
        onDateChange={onDateChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BirthDateStep;
