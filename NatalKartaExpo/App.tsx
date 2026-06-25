import React, { useCallback } from 'react';
import { View, Alert, StyleSheet, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppInitialization } from './src/hooks/useAppInitialization';
import { setupErrorHandlers } from './src/utils/errorHandlers';
import ErrorBoundary from './src/components/ErrorBoundary';
import ApiService from './src/services/api';
import AdService from './src/services/AdService';
import { theme } from './src/theme';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';

import OnboardingScreen from './src/screens/OnboardingScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import ResultScreen from './src/screens/ResultScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateChartScreen from './src/screens/CreateChartScreen';
import ChartDetailScreen from './src/screens/ChartDetailScreen';
import CabinetScreen from './src/screens/CabinetScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import HoroscopeDetailScreen from './src/screens/HoroscopeDetailScreen';
import AppBackground from './src/components/App/AppBackground';
import FadeScreen from './src/components/App/FadeScreen';
import { getZodiacIcon } from './src/utils/zodiacIcons';
import AstralSwipeBack from './src/components/AstralSwipeBack';

// Setup global error handling
setupErrorHandlers();

const App: React.FC = () => {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_700Bold,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  const {
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
    spin,
    pulseAnim,
    wheelTranslateY,
    setWheelVisible,
    createNewUser,
    isVideoEnabled,
    toggleVideoBackground,
    resetToOnboarding,
  } = useAppInitialization();

  React.useEffect(() => {
    ApiService.setOnUserNotFound(resetToOnboarding);
  }, [resetToOnboarding]);

  const [screenHistory, setScreenHistory] = React.useState<string[]>(['Onboarding']);
  const canGoBack = screenHistory.length > 1;

  const navigateTo = useCallback(
    (screen: string) => {
      setScreenHistory((prev) => {
        if (screen === 'Onboarding' || screen === 'Loading' || screen === 'Home') {
          return [screen];
        }
        if (prev[prev.length - 1] === screen) return prev;
        return [...prev, screen];
      });
      setCurrentScreen(screen);
    },
    [setCurrentScreen],
  );

  const navigateBack = useCallback(() => {
    setScreenHistory((prev) => {
      if (prev.length <= 1) return prev;
      const nextHistory = prev.slice(0, -1);
      const targetScreen = nextHistory[nextHistory.length - 1];
      setCurrentScreen(targetScreen);
      return nextHistory;
    });
  }, [setCurrentScreen]);

  React.useEffect(() => {
    setScreenHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last !== currentScreen) {
        if (
          currentScreen === 'Onboarding' ||
          currentScreen === 'Loading' ||
          currentScreen === 'Home'
        ) {
          return [currentScreen];
        }
        return [...prev, currentScreen];
      }
      return prev;
    });
  }, [currentScreen]);

  React.useEffect(() => {
    const backAction = () => {
      if (screenHistory.length > 1) {
        navigateBack();
        return true; // Intercept gesture / button press
      }
      return false; // Exit app if on root screen (Home/Onboarding)
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [screenHistory, navigateBack]);

  const handleWatchAd = useCallback(() => {
    AdService.showRewardedAd(
      () => {
        if (user) {
          const updatedUser = { ...user, subscription_type: 'premium' as const };
          setUser(updatedUser);
          AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },
      () => {
        Alert.alert(
          'Остановка',
          'Показ прерван. Чтобы открыть прогноз полностью, посмотрите видео до конца.',
        );
      },
    );
  }, [user, setUser]);

  const handleOnboardingStepChange = useCallback(
    (step: number) => {
      setWheelVisible(step >= 2);
    },
    [setWheelVisible],
  );

  const handleUpdateUser = useCallback(
    async (updatedUser: any) => {
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    },
    [setUser],
  );

  const handleDeleteProfile = useCallback(async () => {
    await resetToOnboarding();
  }, [resetToOnboarding]);

  const handleOnboardingComplete = useCallback(
    async (data: any) => {
      setOnboardingData(data);
      let newUserObj = user;
      try {
        newUserObj = await createNewUser(data);
        setUser(newUserObj);
        await AsyncStorage.setItem('user', JSON.stringify(newUserObj));
      } catch (_e) {
        console.error('Onboarding user creation failed:', _e);
      }

      setCurrentScreen('Loading');

      // Start generation immediately in parallel (asynchronous non-blocking)
      if (newUserObj) {
        try {
          // First check if the user already has a natal chart (from a previous session)
          const chartsResponse = await ApiService.getNatalCharts(newUserObj.id);

          if (chartsResponse.data && chartsResponse.data.length > 0) {
            console.log('User already has a chart, skipping creation to avoid 429');
            const existingChart = chartsResponse.data[0];

            // If it doesn't have chart_data, trigger generation asynchronously in the background
            if (!existingChart.chart_data) {
              ApiService.generateNatalChart(newUserObj.id, existingChart.id).catch((err) => {
                console.error('Async generation failed:', err);
              });
              setChartResult({
                chart: existingChart,
                sun: 'Расчет...',
                moon: 'Расчет...',
                ascendant: 'Расчет...',
              });
            } else {
              setChartResult({
                chart: existingChart,
                sun: 'Готово',
                moon: 'Готово',
                ascendant: 'Готово',
              });
            }
          } else {
            // Create a new chart for a truly new user
            const chartData = {
              name: `${newUserObj.name} - Натальная карта`,
              birth_date: data.birthDate,
              birth_time: data.birthTime,
              birth_place: data.birthPlace,
              latitude: data.latitude,
              longitude: data.longitude,
            };

            const response = await ApiService.createNatalChart(newUserObj.id, chartData);
            if (response.data) {
              // Trigger generation asynchronously in the background
              ApiService.generateNatalChart(newUserObj.id, response.data.id).catch((err) => {
                console.error('Async generation failed:', err);
              });
              setChartResult({
                chart: response.data,
                sun: 'Расчет...',
                moon: 'Расчет...',
                ascendant: 'Расчет...',
              });
            }
          }
        } catch (_e) {
          console.error('Parallel generation failed:', _e);
          // Unblock the loading screen so the user can at least proceed to Home
          setChartResult({ sun: 'Скорпион', moon: 'Весы', ascendant: 'Близнецы' });
        }
      }
    },
    [user, createNewUser, setUser, setOnboardingData, setCurrentScreen, setChartResult],
  );

  const handleLoadingComplete = useCallback(async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    setCurrentScreen('Home');
  }, [setCurrentScreen]);

  const renderScreen = () => {
    return (
      <>
        <FadeScreen active={loading || !fontsLoaded}>
          <LoadingScreen
            text="Загрузка"
            subText="Инициализация приложения..."
            fontsLoaded={fontsLoaded}
          />
        </FadeScreen>

        <FadeScreen active={!loading && fontsLoaded && currentScreen === 'Onboarding'}>
          <OnboardingScreen
            onComplete={handleOnboardingComplete}
            onStepChange={handleOnboardingStepChange}
          />
        </FadeScreen>

        <FadeScreen active={!loading && fontsLoaded && currentScreen === 'Loading'}>
          <LoadingScreen
            isReady={!!chartResult}
            onComplete={handleLoadingComplete}
            fontsLoaded={fontsLoaded}
          />
        </FadeScreen>

        <FadeScreen active={!loading && fontsLoaded && currentScreen === 'Result'}>
          {chartResult && (
            <ResultScreen result={chartResult} onContinue={() => navigateTo('Home')} />
          )}
        </FadeScreen>

        <FadeScreen active={!loading && fontsLoaded && currentScreen === 'CreateChart'}>
          {user && (
            <AstralSwipeBack onSwipeBack={navigateBack} enabled={canGoBack}>
              <CreateChartScreen
                userId={user.id}
                onChartCreated={(newChart) => {
                  setSelectedChart(newChart);
                  setScreenHistory(['Home', 'ChartDetail']);
                  setCurrentScreen('ChartDetail');
                }}
                onBack={navigateBack}
              />
            </AstralSwipeBack>
          )}
        </FadeScreen>



        <FadeScreen active={!loading && fontsLoaded && currentScreen === 'ChartDetail'}>
          {selectedChart && user && (
            <AstralSwipeBack onSwipeBack={navigateBack} enabled={canGoBack}>
              <ChartDetailScreen
                chart={selectedChart}
                userId={user.id}
                onBack={navigateBack}
                onWatchAd={handleWatchAd}
              />
            </AstralSwipeBack>
          )}
        </FadeScreen>

        <FadeScreen active={!loading && fontsLoaded && currentScreen === 'Cabinet'}>
          {user && (
            <AstralSwipeBack onSwipeBack={navigateBack} enabled={canGoBack}>
              <CabinetScreen
                user={user}
                isVideoEnabled={isVideoEnabled}
                onToggleVideo={toggleVideoBackground}
                onBack={navigateBack}
                onUpdateUser={handleUpdateUser}
                onNavigateToEditProfile={() => navigateTo('EditProfile')}
              />
            </AstralSwipeBack>
          )}
        </FadeScreen>

        <FadeScreen active={!loading && fontsLoaded && currentScreen === 'EditProfile'}>
          {user && (
            <AstralSwipeBack onSwipeBack={navigateBack} enabled={canGoBack}>
              <EditProfileScreen
                user={user}
                onUpdateUser={handleUpdateUser}
                onBack={navigateBack}
                onDeleteProfile={handleDeleteProfile}
              />
            </AstralSwipeBack>
          )}
        </FadeScreen>

        <FadeScreen active={!loading && fontsLoaded && currentScreen === 'HoroscopeDetail'}>
          {user && (
            <AstralSwipeBack onSwipeBack={navigateBack} enabled={canGoBack}>
              <HoroscopeDetailScreen
                sign={user.zodiac_sign || 'Овен'}
                signImage={getZodiacIcon(user.zodiac_sign || 'Овен')}
                onBack={navigateBack}
              />
            </AstralSwipeBack>
          )}
        </FadeScreen>

        <FadeScreen active={!loading && fontsLoaded && currentScreen === 'Home'}>
          {user && (
            <HomeScreen
              user={user}
              onNavigateToCharts={(chart) => {
                if (chart) {
                  setSelectedChart(chart);
                  navigateTo('ChartDetail');
                } else {
                  navigateTo('CreateChart');
                }
              }}
              onNavigateToCreateChart={() => navigateTo('CreateChart')}
              onNavigateToCabinet={() => navigateTo('Cabinet')}
              onNavigateToHoroscope={() => navigateTo('HoroscopeDetail')}
              onWatchAd={handleWatchAd}
            />
          )}
        </FadeScreen>
      </>
    );
  };

  return (
    <ErrorBoundary>
      <View style={styles.appContainer}>
        <AppBackground
          currentScreen={currentScreen}
          wheelOpacity={wheelOpacity}
          wheelTranslateY={wheelTranslateY}
          spin={spin}
          pulseAnim={pulseAnim}
          isVideoEnabled={isVideoEnabled}
        />

        {renderScreen()}
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.dark,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.dark,
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.medium,
  },
});

export default App;
