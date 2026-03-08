import React, { useCallback } from 'react';
import { View, Text, Alert, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppInitialization } from './src/hooks/useAppInitialization';
import { setupErrorHandlers } from './src/utils/errorHandlers';
import ErrorBoundary from './src/components/ErrorBoundary';
import ApiService from './src/services/api';
import AdService from './src/services/AdService';
import { theme } from './src/theme';

import OnboardingScreen from './src/screens/OnboardingScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import ResultScreen from './src/screens/ResultScreen';
import HomeScreen from './src/screens/HomeScreen';
import CreateChartScreen from './src/screens/CreateChartScreen';
import ChartsScreen from './src/screens/ChartsScreen';
import ChartDetailScreen from './src/screens/ChartDetailScreen';
import CabinetScreen from './src/screens/CabinetScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import HoroscopeDetailScreen from './src/screens/HoroscopeDetailScreen';
import AppBackground from './src/components/App/AppBackground';
import FadeScreen from './src/components/App/FadeScreen';

// Setup global error handling
setupErrorHandlers();

const App: React.FC = () => {
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
  } = useAppInitialization();

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

      // Start generation immediately in parallel
      if (newUserObj) {
        try {
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
            const genResponse = await ApiService.generateNatalChart(newUserObj.id, response.data.id);
            if (genResponse.data) {
              setChartResult({
                chart: genResponse.data,
                sun: 'Расчет...', // Эти данные должны приходить из genResponse или парситься из chart_data
                moon: 'Расчет...',
                ascendant: 'Расчет...',
              });
            }
          }
        } catch (_e) {
          console.error('Parallel generation failed:', _e);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  const renderScreen = () => {
    return (
      <>
        <FadeScreen active={currentScreen === 'Onboarding'}>
          <OnboardingScreen
            onComplete={handleOnboardingComplete}
            onStepChange={handleOnboardingStepChange}
          />
        </FadeScreen>

        <FadeScreen active={currentScreen === 'Loading'}>
          <LoadingScreen
            isReady={!!chartResult}
            onComplete={handleLoadingComplete}
          />
        </FadeScreen>

        <FadeScreen active={currentScreen === 'Result'}>
          {chartResult && (
            <ResultScreen result={chartResult} onContinue={() => setCurrentScreen('Home')} />
          )}
        </FadeScreen>

        <FadeScreen active={currentScreen === 'CreateChart'}>
          {user && (
            <CreateChartScreen
              userId={user.id}
              onChartCreated={() => setCurrentScreen('Charts')}
              onBack={() => setCurrentScreen('Home')}
            />
          )}
        </FadeScreen>

        <FadeScreen active={currentScreen === 'Charts'}>
          {user && (
            <ChartsScreen
              userId={user.id}
              onChartPress={(chart) => {
                setSelectedChart(chart);
                setCurrentScreen('ChartDetail');
              }}
              onBack={() => setCurrentScreen('Home')}
            />
          )}
        </FadeScreen>

        <FadeScreen active={currentScreen === 'ChartDetail'}>
          {selectedChart && user && (
            <ChartDetailScreen
              chart={selectedChart}
              userId={user.id}
              onBack={() => setCurrentScreen('Home')}
              onWatchAd={handleWatchAd}
              hasSubscription={user.subscription_type === 'premium'}
            />
          )}
        </FadeScreen>

        <FadeScreen active={currentScreen === 'Cabinet'}>
          {user && (
            <CabinetScreen
              user={user}
              isVideoEnabled={isVideoEnabled}
              onToggleVideo={toggleVideoBackground}
              onBack={() => setCurrentScreen('Home')}
              onUpdateUser={handleUpdateUser}
              onNavigateToEditProfile={() => setCurrentScreen('EditProfile')}
            />
          )}
        </FadeScreen>

        <FadeScreen active={currentScreen === 'EditProfile'}>
          {user && (
            <EditProfileScreen
              user={user}
              onUpdateUser={handleUpdateUser}
              onBack={() => setCurrentScreen('Cabinet')}
            />
          )}
        </FadeScreen>

        <FadeScreen active={currentScreen === 'HoroscopeDetail'}>
          {user && (
            <HoroscopeDetailScreen
              sign="Скорпион"
              signImage={require('./assets/images/scorpio_icon.png')}
              onBack={() => setCurrentScreen('Home')}
            />
          )}
        </FadeScreen>

        <FadeScreen active={currentScreen === 'Home'}>
          {user && (
            <HomeScreen
              user={user}
              onNavigateToCharts={() => setCurrentScreen('Charts')}
              onNavigateToCreateChart={() => setCurrentScreen('CreateChart')}
              onNavigateToCabinet={() => setCurrentScreen('Cabinet')}
              onNavigateToHoroscope={() => setCurrentScreen('HoroscopeDetail')}
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
