import React from 'react';
import { View, StyleSheet } from 'react-native';
import AstralDatePicker, { getAstralDatePickerData } from '../../../components/AstralDatePicker';

interface BirthDateStepProps {
  selectedDate: {
    day: number;
    month: number;
    year: number;
  };
  onDateChange: (type: 'day' | 'month' | 'year', value: number) => void;
}

const BirthDateStep: React.FC<BirthDateStepProps> = ({ selectedDate, onDateChange }) => {
  const { days, months, years } = getAstralDatePickerData();

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
