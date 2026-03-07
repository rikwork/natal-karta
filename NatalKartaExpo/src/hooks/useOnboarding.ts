import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Animated, PanResponder, BackHandler } from 'react-native';
import ApiService from '../services/api';
import { City } from '../types';

// Debounce функция для оптимизации поиска
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

interface UseOnboardingProps {
  onComplete: (data: any) => void;
  onStepChange: (step: number) => void;
}

export const useOnboarding = ({ onComplete, onStepChange }: UseOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    latitude: '',
    longitude: '',
  });

  const [fadeAnim] = useState(new Animated.Value(1));
  const [selectedDate, setSelectedDate] = useState({
    day: 1,
    month: 1,
    year: 1991,
  });
  const [selectedTime, setSelectedTime] = useState({
    hour: 12,
    minute: 0,
  });
  const [citySearch, setCitySearch] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [showCityList, setShowCityList] = useState(false);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);

  useEffect(() => {
    onStepChange(currentStep);
  }, [currentStep, onStepChange]);

  const animateFade = useCallback(
    (callback?: () => void) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        if (callback) callback();
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    },
    [fadeAnim],
  );

  const handleNext = useCallback(() => {
    if (currentStep < 4) {
      // steps.length - 1 = 4
      if (currentStep === 2) {
        const dateString = `${selectedDate.day.toString().padStart(2, '0')}.${selectedDate.month.toString().padStart(2, '0')}.${selectedDate.year}`;
        setFormData((prev) => ({ ...prev, birthDate: dateString }));
      }
      if (currentStep === 3) {
        const timeString = `${selectedTime.hour.toString().padStart(2, '0')}: ${selectedTime.minute.toString().padStart(2, '0')}`;
        setFormData((prev) => ({ ...prev, birthTime: timeString }));
      }
      animateFade(() => setCurrentStep((prev) => prev + 1));
    } else {
      onComplete(formData);
    }
  }, [currentStep, selectedDate, selectedTime, formData, animateFade, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      animateFade(() => setCurrentStep((prev) => prev - 1));
    }
  }, [currentStep, animateFade]);

  // Hook for back button handling
  useEffect(() => {
    const backAction = () => {
      if (currentStep > 0) {
        handlePrev();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [currentStep, handlePrev]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dx > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50 && gestureState.vx > 0.5) {
          handlePrev();
        }
      },
    }),
  ).current;

  const searchCities = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.length < 2) {
          setFilteredCities([]);
          setShowCityList(false);
          return;
        }

        setIsSearchingCities(true);
        try {
          const primaryLang = /[A-Za-z]/.test(query) ? 'en' : 'ru';
          const response = await ApiService.searchCities(query, primaryLang);
          const cities = (response as any).data || [];

          if (cities && cities.length) {
            setFilteredCities(cities);
            setShowCityList(true);
          } else {
            setFilteredCities([]);
            setShowCityList(false);
          }
        } catch {
          setFilteredCities([]);
          setShowCityList(false);
        } finally {
          setIsSearchingCities(false);
        }
      }, 300),
    [],
  );

  const selectCity = useCallback((city: City) => {
    const formattedCity = `${city.name}${city.admin_name1 ? `, ${city.admin_name1}` : ''}, ${city.country}`;
    setCitySearch(formattedCity);
    setFormData((prev) => ({
      ...prev,
      birthPlace: formattedCity,
      latitude: String(city.latitude),
      longitude: String(city.longitude),
    }));
    setShowCityList(false);
  }, []);

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return formData.name.trim().length > 0 && legalAccepted;
      case 1:
        return formData.gender !== '';
      case 2:
        return selectedDate.day > 0 && selectedDate.month > 0 && selectedDate.year > 0;
      case 3:
        return true; // Time is always valid with default values
      case 4:
        return (
          formData.birthPlace.trim().length > 0 &&
          formData.latitude !== '' &&
          formData.longitude !== ''
        );
      default:
        return false;
    }
  }, [currentStep, formData, legalAccepted, selectedDate]);

  return {
    currentStep,
    formData,
    setFormData,
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
  };
};
