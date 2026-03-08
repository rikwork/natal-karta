import { useState, useEffect, useCallback, useRef } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, signInAnonymously } from '../config/firebase';
import ApiService from '../services/api';
import AdService from '../services/AdService';
import { User, NatalChart } from '../types';

export const useAppInitialization = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<string>('Onboarding');
  const [selectedChart, setSelectedChart] = useState<NatalChart | null>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [chartResult, setChartResult] = useState<any>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);

  const spinValue = useRef(new Animated.Value(0)).current;
  const wheelOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const pulseAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startWheelAnimation = useCallback(() => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 60000,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    }).start(({ finished }) => {
      if (finished) startWheelAnimation();
    });
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const setWheelVisible = useCallback(
    (visible: boolean, duration: number = 800) => {
      Animated.timing(wheelOpacity, {
        toValue: visible ? 0.6 : 0,
        duration,
        useNativeDriver: true,
      }).start();
    },
    [wheelOpacity],
  );

  const startPulseAnimation = useCallback(() => {
    pulseAnim.setValue(0);
    const animation = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 1500,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) startPulseAnimation();
    });
    pulseAnimationRef.current = animation;
  }, [pulseAnim]);

  const stopPulseAnimation = useCallback(() => {
    if (pulseAnimationRef.current) {
      pulseAnimationRef.current.stop();
      pulseAnimationRef.current = null;
    }
    Animated.timing(pulseAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [pulseAnim]);

  const createNewUser = useCallback(async (data: any): Promise<User> => {
    try {
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      const response = await ApiService.createUser({
        name: data?.name || 'Пользователь',
        email: `${uid}@anonymous.local`,
        subscription_type: 'free',
        firebase_uid: uid,
      } as any);

      if (!response.data || !response.data.id) {
        throw new Error('User data is null from API');
      }

      const userData = response.data;
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        id: Date.now(),
        name: data?.name || 'Пользователь',
        email: 'error@example.com',
        subscription_type: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  }, []);

  const toggleVideoBackground = useCallback(async (enabled: boolean) => {
    setIsVideoEnabled(enabled);
    await AsyncStorage.setItem('isVideoEnabled', JSON.stringify(enabled));
  }, []);

  const initializeApp = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      const hasCompletedOnboarding = await AsyncStorage.getItem('onboarding_completed');
      const savedVideoSetting = await AsyncStorage.getItem('isVideoEnabled');

      if (savedVideoSetting !== null) {
        setIsVideoEnabled(JSON.parse(savedVideoSetting));
      }

      if (savedUser && hasCompletedOnboarding) {
        setUser(JSON.parse(savedUser));
        setCurrentScreen('Home');
      } else {
        setCurrentScreen('Onboarding');
      }
    } catch {
      setCurrentScreen('Onboarding');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startWheelAnimation();
    AdService.initialize();
    initializeApp();
  }, [startWheelAnimation]);

  const wheelTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentScreen === 'Loading' || currentScreen === 'Result') {
      setWheelVisible(true);
      Animated.timing(wheelTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } else if (currentScreen === 'Home') {
      setWheelVisible(true);
      Animated.timing(wheelTranslateY, {
        toValue: -130, // Смещение в шапку
        duration: 1200,
        useNativeDriver: true,
      }).start();
    } else {
      setWheelVisible(false);
    }

    if (currentScreen === 'Loading') {
      startPulseAnimation();
    } else {
      stopPulseAnimation();
    }
  }, [currentScreen, setWheelVisible, startPulseAnimation, stopPulseAnimation, wheelTranslateY]);

  return {
    user,
    setUser,
    loading,
    currentScreen,
    setCurrentScreen,
    selectedChart,
    setSelectedChart,
    onboardingData,
    setOnboardingData,
    chartResult,
    setChartResult,
    wheelOpacity,
    wheelTranslateY,
    spin,
    pulseAnim,
    setWheelVisible,
    createNewUser,
    isVideoEnabled,
    toggleVideoBackground,
  };

};
