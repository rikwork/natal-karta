import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { User } from '../types';
import { useHomeScreen } from '../hooks/useHomeScreen';
import HoroscopeCard from './Home/components/HoroscopeCard';
import TarotCard from './Home/components/TarotCard';
import CelestialAlignments from './Home/components/CelestialAlignments';

const DATES = [
  { day: '26 ОКТ', label: 'Сб', active: false },
  { day: '27 ОКТ', label: 'Вс', active: false },
  { day: 'СЕГОДНЯ', label: '28 Окт', active: true },
  { day: '29 ОКТ', label: 'Вт', active: false },
  { day: '30 ОКТ', label: 'Ср', active: false },
];

interface HomeScreenProps {
  user: User | null;
  onNavigateToCharts: () => void;
  onNavigateToCreateChart: () => void;
  onNavigateToCabinet: () => void;
  onWatchAd: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user, onNavigateToCharts, onNavigateToCreateChart, onNavigateToCabinet, onWatchAd }) => {
  const { parsedContent, generateNewPrediction } = useHomeScreen(user);

  const renderDateItem = (item: any, index: number) => (
    <TouchableOpacity key={index} style={[styles.dateItem, item.active && styles.activeDateItem]} activeOpacity={0.7}>
      <Text style={[styles.dateText, item.active && styles.activeDateText]}>{item.day}</Text>
      <Text style={[styles.dateSubText, item.active && styles.activeDateSubText]}>{item.label}</Text>
      {item.active && (
        <LinearGradient
          colors={['#FFD700', '#9D50BB'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.activeIndicator}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Background is handled globally by AppBackground */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require('../../assets/images/header_celestial.png')}
          style={styles.headerBackground}
          imageStyle={{ opacity: 0.6 }}
        >
          <LinearGradient
            colors={['transparent', 'rgba(5,5,20,0.8)', '#050514'] as const}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.profileHeader}>
            <View>
              <Text style={styles.greetingText}>Добрый вечер,</Text>
              <Text style={styles.userName}>{user?.name || 'Исследователь'} ✨</Text>
            </View>
            <TouchableOpacity style={styles.avatarBorder} activeOpacity={0.8} onPress={onNavigateToCabinet}>
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
        </ImageBackground>

        <View style={styles.dateStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateStripContent}>
            {DATES.map(renderDateItem)}
          </ScrollView>
        </View>

        <View style={styles.contentPadding}>
          <Text style={styles.mainTitleSection}>
            ВАША <Text style={{ color: '#FFD700' }}>АСТРОЛОГИЯ</Text>
          </Text>

          <View style={styles.mainCardsRow}>
            <HoroscopeCard onPress={generateNewPrediction} content={parsedContent?.recommendations?.[0] || ''} />
            <TarotCard />
          </View>

          <CelestialAlignments />

          <View style={styles.actionButtonsRow}>
            {[
              { label: 'Карты', icon: '📊', colors: ['#411d73', '#1a0b2e'] as const, onPress: onNavigateToCharts },
              { label: 'Новая', icon: '➕', colors: ['#411d73', '#1a0b2e'] as const, onPress: onNavigateToCreateChart }
            ].map((btn, i) => (
              <TouchableOpacity key={i} style={styles.navButton} onPress={btn.onPress} activeOpacity={0.8}>
                <BlurView intensity={20} tint="light" style={styles.navButtonBlur}>
                  <LinearGradient
                    colors={btn.colors}
                    style={styles.navButtonGradient}
                  >
                    <Text style={styles.navButtonIcon}>{btn.icon}</Text>
                    <Text style={styles.navButtonText}>{btn.label}</Text>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { flexGrow: 1 },
  headerBackground: { width: '100%', height: 320, justifyContent: 'flex-end' },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingBottom: 30,
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
  dateStrip: { marginTop: -20, marginBottom: 25 },
  dateStripContent: { paddingHorizontal: 20, gap: 12 },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 12,
    minWidth: 75,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  activeDateItem: {
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderColor: 'rgba(255,215,0,0.2)',
    borderWidth: 1,
  },
  dateText: { fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '800', letterSpacing: 1 },
  activeDateText: { color: '#FFD700' },
  dateSubText: { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', marginTop: 4 },
  activeDateSubText: { color: '#FFF' },
  activeIndicator: {
    width: 25,
    height: 3,
    marginTop: 8,
    borderRadius: 2,
  },
  contentPadding: { paddingHorizontal: 25 },
  mainTitleSection: {
    fontSize: 13,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 20,
    letterSpacing: 4,
  },
  mainCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 35,
  },
  actionButtonsRow: { flexDirection: 'row', gap: 15, marginTop: 10 },
  navButton: { flex: 1 },
  navButtonBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  navButtonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonIcon: { fontSize: 24, marginBottom: 8 },
  navButtonText: { fontSize: 14, fontWeight: '700', color: '#F0E6D2' },
});

export default HomeScreen;
