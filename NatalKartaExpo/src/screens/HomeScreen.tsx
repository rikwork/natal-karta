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
import { User, NatalChart } from '../types';
import { useHomeScreen } from '../hooks/useHomeScreen';
import HoroscopeCard from './Home/components/HoroscopeCard';
import CelestialAlignments from './Home/components/CelestialAlignments';
import AstralButton from '../components/AstralButton';
import AstralGlassCard from '../components/AstralGlassCard';
import DailyCardWidget from './Home/components/DailyCardWidget';
import DailyCardScreen from './DailyCardScreen';
import { useDailyCard } from '../hooks/useDailyCard';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface HomeScreenProps {
  user: User | null;
  onNavigateToCharts: (chart?: NatalChart) => void;
  onNavigateToCreateChart: () => void;
  onNavigateToCabinet: () => void;
  onNavigateToHoroscope: () => void;
  onNavigateToCompatibility: () => void;
  onWatchAd: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  onNavigateToCharts,
  onNavigateToCabinet,
  onNavigateToHoroscope,
  onNavigateToCompatibility,
}) => {
  const { parsedContent, spin, pulseAnim, period, setPeriod, userChart } = useHomeScreen(user);

  const {
    isModalVisible,
    dailyCard,
    isLoading: isDailyCardLoading,
    openDailyCard,
    closeModal,
    revealDailyCard,
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
            colors={['#050514', 'rgba(5,5,20,0.8)', 'rgba(5,5,20,0.4)', 'rgba(5,5,20,0)'] as const}
            locations={[0, 0.3, 0.7, 1]}
            style={styles.heroGradient}
          />
        </View>

        <View style={styles.contentPadding}>
          <Text style={styles.mainTitleSection}>ВАША ПЕРСОНАЛЬНАЯ АСТРОЛОГИЯ</Text>

          <View style={styles.mainCardsRow}>
            <HoroscopeCard
              onPress={onNavigateToHoroscope}
              content={parsedContent?.recommendations?.[0] || ''}
              period={period}
              onPeriodChange={setPeriod}
              sign={user?.zodiac_sign}
            />
            <DailyCardWidget
              dailyCard={dailyCard || null}
              loading={isDailyCardLoading}
              onPress={openDailyCard}
            />
          </View>

          {/* Compatibility Card */}
          <TouchableOpacity
            onPress={onNavigateToCompatibility}
            activeOpacity={0.8}
            style={{ marginBottom: 25 }}
          >
            <AstralGlassCard style={styles.compatibilityCard}>
              <LinearGradient
                colors={['rgba(255, 107, 107, 0.12)', 'rgba(157, 101, 255, 0.12)'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.compatibilityGradient}
              >
                <View style={styles.compatibilityHeader}>
                  <View style={styles.compatibilityIconCircle}>
                    <Ionicons name="heart-outline" size={24} color="#FF6B6B" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.compatibilityTitle}>Совместимость партнеров</Text>
                    <Text style={styles.compatibilitySubtitle}>
                      Узнайте вашу совместимость в любви, дружбе и жизни
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                </View>
              </LinearGradient>
            </AstralGlassCard>
          </TouchableOpacity>

          <CelestialAlignments />

          <View style={styles.navButtonWrapper}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.orbBackgroundContainer,
                {
                  transform: [
                    { rotate: spin },
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.05],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image
                source={require('../../assets/images/cosmic_orb.png')}
                style={styles.orbBackground}
                resizeMode="contain"
              />
            </Animated.View>
            <AstralButton
              title={
                userChart
                  ? userChart.chart_data
                    ? "ОТКРЫТЬ НАТАЛЬНУЮ КАРТУ"
                    : "КАРТА РАССЧИТЫВАЕТСЯ..."
                  : "СОЗДАТЬ НАТАЛЬНУЮ КАРТУ"
              }
              loadingWithText={!!(userChart && !userChart.chart_data)}
              onPress={() => onNavigateToCharts(userChart || undefined)}
              style={styles.nextButton}
            />
          </View>
        </View>
      </Animated.ScrollView>

      {isModalVisible && dailyCard && (
        <DailyCardScreen
          cardId={dailyCard.tarot_card_id}
          initialFlipped={dailyCard.opened}
          onReveal={revealDailyCard}
          onClose={closeModal}
          isMale={user?.gender !== 'female'}
        />
      )}
    </View>
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
    fontFamily: theme.fonts.body,
  },
  userName: {
    fontSize: 28,
    color: '#F0E6D2',
    marginTop: 4,
    fontFamily: theme.fonts.heading,
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
  generatingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    width: '90%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    backgroundColor: 'rgba(15, 14, 23, 0.6)',
  },
  generatingText: {
    color: '#F0E6D2',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.fonts.body,
    textAlign: 'center',
  },
  compatibilityCard: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  compatibilityGradient: {
    padding: 16,
  },
  compatibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  compatibilityIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  compatibilityTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F0E6D2',
    marginBottom: 4,
  },
  compatibilitySubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 16,
  },
});

export default HomeScreen;
