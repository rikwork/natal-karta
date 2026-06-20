import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from '../types';
import { useHomeScreen } from '../hooks/useHomeScreen';
import HoroscopeCard from './Home/components/HoroscopeCard';
import CelestialAlignments from './Home/components/CelestialAlignments';
import AstralButton from '../components/AstralButton';
import DailyCardWidget from './Home/components/DailyCardWidget';
import DailyCardScreen from './DailyCardScreen';
import { useDailyCard } from '../hooks/useDailyCard';

interface HomeScreenProps {
  user: User | null;
  onNavigateToCharts: () => void;
  onNavigateToCreateChart: () => void;
  onNavigateToCabinet: () => void;
  onNavigateToHoroscope: () => void;
  onWatchAd: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  onNavigateToCharts,
  onNavigateToCabinet,
  onNavigateToHoroscope,
}) => {
  const {
    parsedContent,
    spin,
    pulseAnim,
    period,
    setPeriod
  } = useHomeScreen(user);

  const {
    isModalVisible,
    selectedCardId,
    openDailyCard,
    closeModal,
  } = useDailyCard(user?.id);

  const fadeInAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeInAnim]);

  return (
    <View style={styles.mainContainer}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeInAnim }}
      >
        {/* Celestial Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.profileHeader}>
            <View>
              <Text style={styles.greetingText}>Ваш космос сегодня,</Text>
              <Text style={styles.userName}>{user?.name || 'Исследователь'} ✨</Text>
            </View>
            <TouchableOpacity
              style={styles.avatarBorder}
              activeOpacity={0.8}
              onPress={onNavigateToCabinet}
            >
              <LinearGradient
                colors={['#FFD700', '#9D50BB'] as const}
                style={styles.avatarPlaceholder}
              >
                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }}>
                  {(user?.name || 'E').charAt(0)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.wheelWrapper}>
            {/* 
              Колесо теперь отрисовывается в AppBackground 
              и плавно переезжает из центра при переходе с экрана Loading 
            */}
          </View>

          <LinearGradient
            colors={[
              '#050514',
              'rgba(5,5,20,0.8)',
              'rgba(5,5,20,0.4)',
              'rgba(5,5,20,0)'
            ] as const}
            locations={[0, 0.3, 0.7, 1]}
            style={styles.heroGradient}
          />
        </View>

        <View style={styles.contentPadding}>

          <Text style={styles.mainTitleSection}>
            ВАША ПЕРСОНАЛЬНАЯ АСТРОЛОГИЯ
          </Text>

          <View style={styles.mainCardsRow}>
            <HoroscopeCard
              onPress={onNavigateToHoroscope}
              content={parsedContent?.recommendations?.[0] || ''}
              period={period}
              onPeriodChange={setPeriod}
              sign={user?.zodiac_sign}
            />
            <DailyCardWidget userId={user?.id} onPress={openDailyCard} />
          </View>

          <CelestialAlignments />

          <View style={styles.navButtonWrapper}>
            <Animated.View style={[
              styles.orbBackgroundContainer,
              {
                transform: [
                  { rotate: spin },
                  {
                    scale: pulseAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.05]
                    })
                  }
                ]
              }
            ]}>
              <Image
                source={require('../../assets/images/cosmic_orb.png')}
                style={styles.orbBackground}
                resizeMode="contain"
              />
            </Animated.View>
            <AstralButton
              title="ОТКРЫТЬ НАТАЛЬНУЮ КАРТУ"
              onPress={onNavigateToCharts}
              style={styles.nextButton}
            />
          </View>
        </View>
      </Animated.ScrollView >

      {isModalVisible && selectedCardId && (
        <DailyCardScreen 
          cardId={selectedCardId} 
          onClose={closeModal} 
          isMale={user?.gender === 'male' || true}
        />
      )}
    </View >

  );
};


const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { flexGrow: 1 },
  heroSection: {
    width: '100%',
    height: 260,
    overflow: 'hidden',
  },
  wheelWrapper: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  profileHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'ios' ? 45 : (StatusBar.currentHeight || 24) + 10,
    zIndex: 10,
  },
  greetingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'serif',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F0E6D2',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'serif',
  },
  avatarBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.4)',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentPadding: { paddingHorizontal: 25, marginTop: -140 },
  mainTitleSection: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 20,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  mainCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 35,
  },
  navButtonWrapper: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    width: '100%',
  },
  orbBackgroundContainer: {
    position: 'absolute',
    width: 320,
    height: 320,
    zIndex: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbBackground: {
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
  nextButton: {
    width: '90%',
    alignSelf: 'center',
  },
});


export default HomeScreen;
