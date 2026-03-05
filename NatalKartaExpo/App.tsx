import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Alert, StyleSheet, Animated, Easing, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, NatalChart } from './src/types';
import ApiService from './src/services/api';
import ErrorBoundary from './src/components/ErrorBoundary';
import errorReporter from './src/services/errorReporter';
import AdService from './src/services/AdService';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import ResultScreen from './src/screens/ResultScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateChartScreen from './src/screens/CreateChartScreen';
import ChartsScreen from './src/screens/ChartsScreen';
import ChartDetailScreen from './src/screens/ChartDetailScreen';
import ZodiacWheel from './src/components/ZodiacWheel';
import { theme } from './src/theme';

// Простая навигация без React Navigation для начала
import { auth, signInAnonymously } from './src/config/firebase';
import { Image, ImageBackground } from 'react-native';

// Типы для ErrorUtils
declare const ErrorUtils: {
  getGlobalHandler(): ((error: Error, isFatal: boolean) => void) | undefined;
  setGlobalHandler(handler: (error: Error, isFatal: boolean) => void): void;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<string>('Onboarding');
  const [selectedChart, setSelectedChart] = useState<NatalChart | null>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [chartResult, setChartResult] = useState<any>(null);

  // Глобальное состояние для колеса зодиака
  const spinValue = useRef(new Animated.Value(0)).current;
  const wheelOpacity = useRef(new Animated.Value(0)).current;

  const startWheelAnimation = useCallback(() => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 60000,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    }).start(({ finished }) => {
      if (finished) {
        startWheelAnimation();
      }
    });
  }, [spinValue]);

  useEffect(() => {
    startWheelAnimation();
  }, [startWheelAnimation]);

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

  // Управление видимостью колеса при смене экранов
  useEffect(() => {
    if (currentScreen === 'Loading' || currentScreen === 'Result') {
      setWheelVisible(true);
    } else if (currentScreen === 'Home' || currentScreen === 'Charts' || currentScreen === 'ChartDetail' || currentScreen === 'CreateChart') {
      setWheelVisible(false);
    }
    // Для Onboarding экран сам сообщает, когда показать колесо через onStepChange
  }, [currentScreen, setWheelVisible]);

  useEffect(() => {
    // Обработчик необработанных промисов
    const handleUnhandledRejection = (event: any) => {
      const error = new Error(event.reason || 'Unhandled Promise Rejection');
      console.log('Необработанный промис пойман:', error);
      errorReporter.reportError(error, 'Unhandled Promise Rejection');
    };

    // Добавляем обработчики
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError(...args);
      if (typeof document !== 'undefined') {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText =
          'color: white; background: red; font-size: 20px; z-index: 9999; position: fixed; top: 0; left: 0; padding: 10px; width: 100%;';
        errorDiv.innerHTML =
          '<h2>Uncaught Error Caught:</h2><pre>' +
          args.map((a) => (a instanceof Error ? a.stack || a.message : String(a))).join(' ') +
          '</pre>';
        document.body.appendChild(errorDiv);
      }
      if (args[0] instanceof Error) {
        console.log('Console error пойман:', args[0]);
        errorReporter.reportError(args[0], 'Console Error');
      }
    };

    if (typeof window !== 'undefined') {
      window.onerror = function (message, source, lineno, colno, error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText =
          'color: white; background: red; font-size: 20px; z-index: 9999; position: fixed; bottom: 0; left: 0; padding: 10px; width: 100%;';
        errorDiv.innerHTML =
          '<h2>window.onerror:</h2><pre>' + message + ' ' + (error?.stack || '') + '</pre>';
        document.body.appendChild(errorDiv);
      };
    }

    // Обработчик для необработанных промисов (только для веб-платформы)
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
    }

    // Для React Native используем ErrorUtils
    if (typeof ErrorUtils !== 'undefined') {
      const originalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean | undefined) => {
        console.log('React Native глобальная ошибка:', error, 'isFatal:', isFatal);
        errorReporter.reportError(
          error,
          `React Native Global Handler (isFatal: ${isFatal || false})`,
        );
        if (originalHandler) {
          originalHandler(error, isFatal || false);
        }
      });
    }

    // Инициализация Yandex Ads (через AdService для кросс-платформенности)
    AdService.initialize().then(() => {
      console.log('Ads initialized');
    });

    initializeApp();

    // Очистка при размонтировании
    return () => {
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      }
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Проверяем, есть ли сохраненный пользователь и завершен ли онбординг
      const savedUser = await AsyncStorage.getItem('user');
      const hasCompletedOnboarding = await AsyncStorage.getItem('onboarding_completed');

      if (savedUser && hasCompletedOnboarding) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setCurrentScreen('Home');
      } else {
        // Показываем онбординг
        setCurrentScreen('Onboarding');
        setUser(null);
      }
    } catch (_error) {
      setCurrentScreen('Onboarding');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const createNewUser = useCallback(async (data: any): Promise<User> => {
    try {
      // 1. Анонимная авторизация в Firebase (JS SDK совместим с Expo Go)
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;
      console.log('Firebase Anonymous UID:', uid);

      // 2. Создание пользователя на нашем бэкенде с привязкой к UID
      // Backend returns flat JSON { id, name, ... }, not { data: { ... } }
      const userData = (await ApiService.createUser({
        name: data?.name || 'Пользователь',
        email: `${uid}@anonymous.local`,
        subscription_type: 'free',
        firebase_uid: uid,
      } as any)) as unknown as User;

      if (!userData || !(userData as any).id) {
        throw new Error('User data is null from API');
      }

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Error creating/authenticating user:', error);
      // Fallback: возвращаем временный объект, чтобы приложение не падало
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

  const handleWatchAd = useCallback(() => {
    AdService.showRewardedAd(
      () => {
        // onSuccess - Временно даем доступ к премиум функциям
        if (user) {
          const updatedUser = { ...user, subscription_type: 'premium' as const };
          setUser(updatedUser);
          AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },
      () => {
        // onFailedOrDismissed
        Alert.alert(
          'Остановка',
          'Показ прерван. Чтобы открыть прогноз полностью, посмотрите видео до конца.',
        );
      },
    );
  }, [user]);

  const handleNavigateToCharts = useCallback(() => {
    setCurrentScreen('Charts');
  }, []);

  const handleNavigateToCreateChart = useCallback(() => {
    setCurrentScreen('CreateChart');
  }, []);

  const handleNavigateToChartDetail = useCallback((chart: NatalChart) => {
    setSelectedChart(chart);
    setCurrentScreen('ChartDetail');
  }, []);

  const handleChartCreated = useCallback(() => {
    setCurrentScreen('Charts');
  }, []);

  const handleBack = useCallback(() => {
    setCurrentScreen('Home');
    setSelectedChart(null);
  }, []);

  const handleOnboardingStepChange = useCallback(
    (step: number) => {
      if (step >= 2) {
        setWheelVisible(true);
      } else {
        setWheelVisible(false);
      }
    },
    [setWheelVisible],
  );

  const handleOnboardingComplete = useCallback(
    async (data: any) => {
      setOnboardingData(data);

      // Создаем пользователя сразу после онбординга
      // Передаём data напрямую, чтобы не зависеть от асинхронного state update
      try {
        const newUser = await createNewUser(data);
        setUser(newUser);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
      } catch (error) {
        console.log('Ошибка создания пользователя:', error);
      }

      setCurrentScreen('Loading');
    },
    [createNewUser],
  );

  const handleLoadingComplete = useCallback(async () => {
    // Генерируем реальную натальную карту во время анимации
    if (user && onboardingData) {
      try {
        // Создаем натальную карту с данными из онбординга
        const chartData = {
          name: `${user.name} - Натальная карта`,
          birth_date: onboardingData.birthDate,
          birth_time: onboardingData.birthTime,
          birth_place: onboardingData.birthPlace,
          latitude: onboardingData.latitude,
          longitude: onboardingData.longitude,
        };

        const response = await ApiService.createNatalChart(user.id, chartData);

        if (response.data) {
          // Генерируем данные карты
          const generateResponse = await ApiService.generateNatalChart(user.id, response.data.id);

          const result = {
            chart: response.data,
            chart_data: generateResponse.data?.chart_data || 'Данные карты сгенерированы',
            sun: 'Скорпион', // Временные данные
            moon: 'Весы',
            ascendant: 'Близнецы',
          };

          setChartResult(result);
        } else {
          // Fallback на заглушку
          setChartResult({
            sun: 'Скорпион',
            moon: 'Весы',
            ascendant: 'Близнецы',
          });
        }
      } catch (_error) {
        // Fallback на заглушку
        setChartResult({
          sun: 'Скорпион',
          moon: 'Весы',
          ascendant: 'Близнецы',
        });
      }
    } else {
      // Fallback на заглушку
      setChartResult({
        sun: 'Скорпион',
        moon: 'Весы',
        ascendant: 'Близнецы',
      });
    }

    // Автоматически переходим на Home вместо Result
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      setCurrentScreen('Home');
    } catch (error) {
      console.log('Ошибка сохранения флага онбординга:', error);
      setCurrentScreen('Home');
    }
  }, [user, onboardingData]);

  const handleResultContinue = useCallback(async () => {
    // Этот метод теперь вызывается только если мы вручную перешли на Result (например, для отладки)
    setCurrentScreen('Home');
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Onboarding':
        return (
          <OnboardingScreen
            onComplete={handleOnboardingComplete}
            onStepChange={handleOnboardingStepChange}
          />
        );
      case 'Loading':
        return <LoadingScreen onComplete={handleLoadingComplete} />;
      case 'Result':
        return chartResult ? (
          <ResultScreen result={chartResult} onContinue={handleResultContinue} />
        ) : null;
      case 'CreateChart':
        return user ? (
          <CreateChartScreen
            userId={user.id}
            onChartCreated={handleChartCreated}
            onBack={handleBack}
          />
        ) : null;
      case 'Charts':
        return user ? (
          <ChartsScreen
            userId={user.id}
            onChartPress={handleNavigateToChartDetail}
            onBack={handleBack}
          />
        ) : null;
      case 'ChartDetail':
        return selectedChart && user ? (
          <ChartDetailScreen
            chart={selectedChart}
            userId={user.id}
            onBack={handleBack}
            onWatchAd={handleWatchAd}
            hasSubscription={user.subscription_type === 'premium'}
          />
        ) : null;
      default:
        return user ? (
          <HomeScreen
            user={user}
            onNavigateToCharts={handleNavigateToCharts}
            onNavigateToCreateChart={handleNavigateToCreateChart}
            onWatchAd={handleWatchAd}
          />
        ) : null;
    }
  };

  return (
    <ErrorBoundary>
      <View style={{ flex: 1, backgroundColor: theme.colors.background.dark, overflow: 'hidden' }}>
        {/* Глобальный фон и колесо зодиака, висящие за всеми экранами */}
        {(currentScreen === 'Onboarding' || currentScreen === 'Loading' || currentScreen === 'Result') && (
          <View style={StyleSheet.absoluteFillObject}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj_EyvNiJnWwHl1dT647d1neMGhn5cHPcdBqtFAaPHr5a3vZPbeQsnldExCo95wjhuFikQNLEPPNQ77lxA_H5DNylgzwV8zytGuSeNJcDdx_f-BuvafKAUoX30eogMG_oqc9kMsoPewi37YTSA8VvlJg5Os5pEDndnE3DI2SAbUqDACWl0EuLQzJh97D24G7oGQVTZe1dh3iNVIjvEzRIGKQAiOAYlYNataspz6w-xpQygLXXHhdMQE5r39xlZwfrnyLdEl6SwXTTs',
              }}
              style={StyleSheet.absoluteFillObject}
            />
            <View
              style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(5, 5, 20, 0.6)' }]}
            />

            <View
              style={[
                StyleSheet.absoluteFillObject,
                { alignItems: 'center', justifyContent: 'center' },
              ]}
              pointerEvents="none"
            >
              {/* Мы используем Animated.View для управления общей прозрачностью колеса */}
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: wheelOpacity,
                    // Смещаем вниз, чтобы колесо было центрировано под заголовком
                    transform: [{ translateY: 50 }],
                  },
                ]}
              >
                <ZodiacWheel spin={spin} opacity={1} />
              </Animated.View>
            </View>
          </View>
        )}

        {renderScreen()}
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: theme.colors.background.dark, // Удалено для прозрачности
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.medium,
  },
});

export default App;
