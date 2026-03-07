import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface GenderStepProps {
  gender: 'male' | 'female' | 'other' | '';
  onSelect: (gender: 'male' | 'female' | 'other') => void;
}

const GenderStep: React.FC<GenderStepProps> = ({ gender, onSelect }) => {
  const options = [
    { key: 'male', label: 'Мужской', emoji: '♂' },
    { key: 'female', label: 'Женский', emoji: '♀' },
  ] as const;

  return (
    <View style={styles.stepContainer}>
      <View style={styles.genderContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.genderOption, gender === option.key && styles.genderOptionSelected]}
            onPress={() => onSelect(option.key)}
          >
            <Text style={styles.genderEmoji}>{option.emoji}</Text>
            <Text style={styles.genderLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  genderOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 15, 40, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.15)',
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  genderOptionSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  genderEmoji: {
    fontSize: 50,
    marginBottom: 12,
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  genderLabel: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'serif',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default GenderStep;
