import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useOnboarding } from '../hooks/useOnboarding';
import NameStep from './Onboarding/steps/NameStep';
import GenderStep from './Onboarding/steps/GenderStep';
import BirthDateStep from './Onboarding/steps/BirthDateStep';
import BirthTimeStep from './Onboarding/steps/BirthTimeStep';
import BirthPlaceStep from './Onboarding/steps/BirthPlaceStep';
import AstralButton from '../components/AstralButton';

interface OnboardingScreenProps {
  onComplete: (data: any) => void;
  onStepChange: (step: number) => void;
}

const steps = [
  {
    id: 'name',
    title: 'Как тебя зовут?',
    subtitle: 'Это поможет персонализировать твою натальную карту',
  },
  { id: 'gender', title: 'Твой пол', subtitle: 'Важно для точного расчета' },
  {
    id: 'birthDate',
    title: 'Когда вы родились?',
    subtitle:
      'Введите вашу точную дату рождения для раскрытия\nвашего уникального космического чертежа.',
  },
  {
    id: 'birthTime',
    title: 'Время рождения',
    subtitle: 'Точное время очень важно для астрологии',
  },
  { id: 'birthPlace', title: 'Место рождения', subtitle: 'Город, где ты родился' },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, onStepChange }) => {
  const {
    currentStep,
    formData,
    fadeAnim,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    citySearch,
    setCitySearch,
    filteredCities,
    showCityList,
    setShowCityList,
    isSearchingCities,
    legalAccepted,
    setLegalAccepted,
    handleNext,
    handlePrev,
    panResponder,
    searchCities,
    selectCity,
    isStepValid,
    setFormData,
  } = useOnboarding({ onComplete, onStepChange });

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <NameStep
            name={formData.name}
            onNameChange={(name) => setFormData({ ...formData, name })}
            legalAccepted={legalAccepted}
            onLegalToggle={setLegalAccepted}
          />
        );
      case 1:
        return (
          <GenderStep
            gender={formData.gender}
            onSelect={(gender) => setFormData({ ...formData, gender })}
          />
        );
      case 2:
        return (
          <BirthDateStep
            selectedDate={selectedDate}
            onDateChange={(type, value) => setSelectedDate((prev) => ({ ...prev, [type]: value }))}
          />
        );
      case 3:
        return (
          <BirthTimeStep
            selectedTime={selectedTime}
            onTimeChange={(time) => setSelectedTime(time)}
          />
        );
      case 4:
        return (
          <BirthPlaceStep
            citySearch={citySearch}
            onCitySearchChange={(text) => {
              setCitySearch(text);
              searchCities(text);
            }}
            isSearchingCities={isSearchingCities}
            showCityList={showCityList}
            filteredCities={filteredCities}
            onSelectCity={selectCity}
            onFocus={() => {
              if (citySearch.length >= 2) setShowCityList(true);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {currentStep > 0 && (
        <TouchableOpacity style={styles.topBackButton} onPress={handlePrev} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        <View style={styles.dotsProgressContainer}>
          <View style={styles.progressLine} />
          <View style={styles.dotsRow}>
            {steps.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.dot,
                  currentStep === index ? styles.activeDot : styles.inactiveDot,
                  currentStep === index && styles.activeDotGlow,
                ]}
              />
            ))}
          </View>
        </View>
        <Text style={styles.stepCounterText}>
          {currentStep + 1} из {steps.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[styles.stepWrapper, { opacity: fadeAnim }]}>
          <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
          <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>

          <View style={{ flex: 1, width: '100%', position: 'relative' }}>
            {renderStepContent()}
          </View>
        </Animated.View>

        <View style={styles.navigationContainer}>
          <AstralButton
            title={currentStep === steps.length - 1 ? 'Завершить' : 'Continue'}
            onPress={handleNext}
            disabled={!isStepValid}
            style={styles.nextButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    alignItems: 'center',
    marginBottom: 20,
  },
  topBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 45,
    left: 15,
    zIndex: 100,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsProgressContainer: {
    width: 140,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  inactiveDot: { backgroundColor: '#666' },
  activeDot: {
    backgroundColor: '#FFD700',
    width: 12,
    height: 12,
    marginTop: -2,
    borderRadius: 6,
  },
  activeDotGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  stepCounterText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 8,
    fontWeight: '300',
  },
  stepWrapper: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'serif',
    color: '#F0E6D2',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 30,
  },
  navigationContainer: { marginTop: 40 },
  nextButton: {
    width: '90%',
    alignSelf: 'center',
  },
});

export default OnboardingScreen;
