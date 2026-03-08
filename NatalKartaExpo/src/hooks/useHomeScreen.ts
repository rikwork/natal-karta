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

  useEffect(() => {
    // Вращение колеса (и орбиты) - цикл 30с
    const spinLoop = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 60000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinLoop.start();

    // Фоновая пульсация (медленная)
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => {
      spinLoop.stop();
      pulseLoop.stop();
    };
  }, [spinValue, pulseAnim]);

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

  const loadPrediction = useCallback(async (selectedPeriod: HoroscopePeriod) => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await ApiService.getDailyPrediction(user.id);
      if (response.data) setDailyPrediction(response.data);
    } catch {
      // Silent error
    } finally {
      setLoading(false);
    }
  }, [user]);

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
    setPeriod
  };
};
