import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, Animated, Easing } from 'react-native';
import ApiService from '../services/api';
import { User, DailyPrediction, DailyPredictionContent } from '../types';

export type HoroscopePeriod = 'today' | 'tomorrow' | 'week' | 'month' | 'year';

export const useHomeScreen = (user: User | null) => {
  const [dailyPrediction, setDailyPrediction] = useState<DailyPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<HoroscopePeriod>('today');

  // Анимации для ZodiacWheel
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const startSpinAnimation = useCallback(() => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 60000,
      easing: Easing.linear,
      useNativeDriver: true,
      isInteraction: false,
    }).start(({ finished }) => {
      if (finished) startSpinAnimation();
    });
  }, [spinValue]);

  const startPulseAnimation = useCallback(() => {
    pulseAnim.setValue(0);
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
        isInteraction: false,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
        isInteraction: false,
      }),
    ]).start(({ finished }) => {
      if (finished) startPulseAnimation();
    });
  }, [pulseAnim]);

  useEffect(() => {
    startSpinAnimation();
    startPulseAnimation();

    return () => {
      spinValue.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, [startSpinAnimation, startPulseAnimation, spinValue, pulseAnim]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const parsedContent = useMemo(() => {
    if (!dailyPrediction || !dailyPrediction.content) return null;
    if (typeof dailyPrediction.content === 'object')
      return dailyPrediction.content as DailyPredictionContent;
    try {
      return JSON.parse(dailyPrediction.content) as DailyPredictionContent;
    } catch {
      return null;
    }
  }, [dailyPrediction]);

  const loadPrediction = useCallback(
    async (selectedPeriod: HoroscopePeriod) => {
      if (!user) return;
      setLoading(true);
      try {
        if (user.zodiac_sign) {
          const response = await ApiService.getZodiacPredictions(user.zodiac_sign);
          if (response.data) {
            // В новом формате бэкенд возвращает объект с ключами периодов
            // Превращаем его в формат DailyPrediction для совместимости
            const periodKey =
              selectedPeriod === 'today' || selectedPeriod === 'tomorrow'
                ? selectedPeriod
                : selectedPeriod === 'week'
                  ? 'week'
                  : 'month';

            if (response.data[periodKey]) {
              setDailyPrediction({
                id: 0,
                user_id: user.id,
                prediction_date: new Date().toISOString(),
                content: response.data[periodKey],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
        } else {
          const response = await ApiService.getDailyPrediction(user.id);
          if (response.data) setDailyPrediction(response.data);
        }
      } catch {
        // Silent error
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (user) loadPrediction(period);
  }, [user, period, loadPrediction]);

  const generateNewPrediction = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await ApiService.generateDailyPrediction(user.id);
      if (response.data) {
        setDailyPrediction(response.data);
      } else {
        Alert.alert('Ошибка', 'Не удалось сгенерировать предсказание');
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось сгенерировать предсказание');
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    dailyPrediction,
    parsedContent,
    loading,
    loadPrediction,
    generateNewPrediction,
    spin,
    pulseAnim,
    period,
    setPeriod,
  };
};
