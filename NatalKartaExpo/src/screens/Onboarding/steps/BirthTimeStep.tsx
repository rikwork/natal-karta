import React from 'react';
import { AstralTimePicker } from '../../../components/AstralTimePicker';

interface BirthTimeStepProps {
  selectedTime: {
    hour: number;
    minute: number;
  };
  onTimeChange: (time: { hour: number; minute: number }) => void;
}

const BirthTimeStep: React.FC<BirthTimeStepProps> = ({ selectedTime, onTimeChange }) => {
  return <AstralTimePicker selectedTime={selectedTime} onTimeChange={onTimeChange} />;
};

export default BirthTimeStep;
