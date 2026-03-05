import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { User } from '../types';
import { theme } from '../theme';
import { useHomeScreen } from '../hooks/useHomeScreen';
import HoroscopeCard from './Home/components/HoroscopeCard';
import TarotCard from './Home/components/TarotCard';
import CelestialAlignments from './Home/components/CelestialAlignments';

const DATES = [
  { day: 'OCT 26', label: 'OCT 26' },
  { day: 'OCT 27', label: 'OCT 27' },
  { day: 'TODAY', label: 'OCT 28', active: true },
  { day: 'OCT 29', label: 'OCT 29' },
  { day: 'OCT 30', label: 'OCT 30' },
];

interface HomeScreenProps {
  user: User | null;
  onNavigateToCharts: () => void;
  onNavigateToCreateChart: () => void;
  onWatchAd: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user, onNavigateToCharts, onNavigateToCreateChart, onWatchAd }) => {
  const { parsedContent, generateNewPrediction } = useHomeScreen(user);

  const renderDateItem = (item: any, index: number) => (
    <TouchableOpacity key={index} style={styles.dateItem}>
      <Text style={[styles.dateText, item.active && styles.activeDateText]}>{item.day}</Text>
      <Text style={[styles.dateSubText, item.active && styles.activeDateSubText]}>{item.label}</Text>
      {item.active && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={theme.colors.gradient.main} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ImageBackground source={require('../../assets/images/header_celestial.png')} style={styles.headerBackground} imageStyle={{ opacity: 0.8 }}>
          <LinearGradient colors={['transparent', 'rgba(15,9,26,0.8)', theme.colors.background.deep]} style={StyleSheet.absoluteFill} />
          <View style={styles.profileHeader}>
            <Text style={styles.greetingText}>Good Evening, <Text style={styles.userName}>{user?.name || 'Explorer'}</Text></Text>
            <View style={styles.avatarBorder}><View style={styles.avatarPlaceholder} /></View>
          </View>
        </ImageBackground>

        <View style={styles.dateStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateStripContent}>
            {DATES.map(renderDateItem)}
          </ScrollView>
        </View>

        <View style={styles.contentPadding}>
          <Text style={styles.mainTitleSection}>YOUR DAILY <Text style={{ color: theme.colors.secondary }}>ASTROLOGY</Text> ✨</Text>
          <View style={styles.mainCardsRow}>
            <HoroscopeCard onPress={generateNewPrediction} content={parsedContent?.recommendations?.[0] || ''} />
            <TarotCard />
          </View>
          <CelestialAlignments />
          <View style={styles.actionButtonsRow}>
            {[
              { label: 'Charts', icon: '📊', onPress: onNavigateToCharts },
              { label: 'New', icon: '➕', onPress: onNavigateToCreateChart }
            ].map((btn, i) => (
              <TouchableOpacity key={i} style={styles.navButton} onPress={btn.onPress}>
                <BlurView intensity={15} tint="light" style={styles.navButtonBlur}>
                  <Text style={styles.navButtonIcon}>{btn.icon}</Text>
                  <Text style={styles.navButtonText}>{btn.label}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: theme.colors.background.deep },
  scrollContent: { flexGrow: 1 },
  headerBackground: { width: '100%', height: 300, justifyContent: 'flex-end' },
  profileHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
  greetingText: { fontSize: 22, color: theme.colors.text.primary },
  userName: { fontWeight: '700', color: theme.colors.secondary },
  avatarBorder: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: 22, backgroundColor: theme.colors.primary },
  dateStrip: { marginTop: -10, marginBottom: 20 },
  dateStripContent: { paddingHorizontal: 15, gap: 15 },
  dateItem: { alignItems: 'center', paddingVertical: 10, minWidth: 60 },
  dateText: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  activeDateText: { color: theme.colors.secondary },
  dateSubText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  activeDateSubText: { color: '#FFF' },
  activeIndicator: { width: 20, height: 2, backgroundColor: theme.colors.secondary, marginTop: 6, borderRadius: 1 },
  contentPadding: { paddingHorizontal: 20 },
  mainTitleSection: { fontSize: 26, fontWeight: '800', color: '#FFF', marginBottom: 25 },
  mainCardsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 30 },
  actionButtonsRow: { flexDirection: 'row', gap: 15 },
  navButton: { flex: 1 },
  navButtonBlur: { padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  navButtonIcon: { fontSize: 20, marginBottom: 4 },
  navButtonText: { fontSize: 13, fontWeight: '600', color: '#FFF' },
});

export default HomeScreen;
