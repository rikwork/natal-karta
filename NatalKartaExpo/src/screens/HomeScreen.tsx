import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { User, DailyPrediction, DailyPredictionContent } from '../types';
import ApiService from '../services/api';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

// Mock data for Dates
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

const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  onNavigateToCharts,
  onNavigateToCreateChart,
  onWatchAd,
}) => {
  const [dailyPrediction, setDailyPrediction] = useState<DailyPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  const parsedContent = useMemo(() => {
    if (!dailyPrediction || !dailyPrediction.content) return null;
    if (typeof dailyPrediction.content === 'object')
      return dailyPrediction.content as DailyPredictionContent;
    try {
      return JSON.parse(dailyPrediction.content) as DailyPredictionContent;
    } catch (e) {
      return null;
    }
  }, [dailyPrediction]);

  const loadDailyPrediction = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await ApiService.getDailyPrediction(user.id);
      if (response.data) {
        setDailyPrediction(response.data);
      }
    } catch (error) {
      // Silent error
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDailyPrediction();
    }
  }, [user, loadDailyPrediction]);

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
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сгенерировать предсказание');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const renderDateItem = (item: any, index: number) => (
    <TouchableOpacity key={index} style={[styles.dateItem, item.active && styles.activeDateItem]}>
      <Text style={[styles.dateText, item.active && styles.activeDateText]}>{item.day}</Text>
      <Text style={[styles.dateSubText, item.active && styles.activeDateSubText]}>
        {item.label}
      </Text>
      {item.active && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <LinearGradient colors={theme.colors.gradient.main} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with Celestial Image */}
        <ImageBackground
          source={require('../../assets/images/header_celestial.png')}
          style={styles.headerBackground}
          imageStyle={styles.headerImage}
        >
          <LinearGradient
            colors={['transparent', 'rgba(15,9,26,0.8)', theme.colors.background.deep]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.profileHeader}>
            <View>
              <Text style={styles.greetingText}>
                Good Evening, <Text style={styles.userName}>{user?.name || 'Explorer'}</Text>
              </Text>
            </View>
            <View style={styles.avatarBorder}>
              <View style={styles.avatarPlaceholder} />
            </View>
          </View>
        </ImageBackground>

        {/* Date Strip */}
        <View style={styles.dateStrip}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateStripContent}
          >
            {DATES.map(renderDateItem)}
          </ScrollView>
        </View>

        <View style={styles.contentPadding}>
          <Text style={styles.mainTitleSection}>
            YOUR DAILY <Text style={{ color: theme.colors.secondary }}>ASTROLOGY</Text> ✨
          </Text>

          {/* Main Cards Row */}
          <View style={styles.mainCardsRow}>
            {/* Horoscope Card */}
            <TouchableOpacity style={styles.horoscopeCardWrapper} onPress={generateNewPrediction}>
              <BlurView intensity={30} tint="dark" style={styles.glassCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardSmallTitle}>TODAY&apos;S HOROSCOPE: OCT 28</Text>
                  <Text style={styles.signTitle}>SCORPIO</Text>
                </View>

                <Text style={styles.signEmoji}>♏</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardDescription} numberOfLines={3}>
                    {parsedContent?.recommendations?.[0] ||
                      'Navigate changes with confidence. A creative breakthrough awaits today!'}
                  </Text>
                  <View style={styles.cardSmallIcons}>
                    <Text>✨ 🌙</Text>
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>

            {/* Tarot Card */}
            <TouchableOpacity style={styles.tarotCardWrapper}>
              <BlurView
                intensity={30}
                tint="dark"
                style={[styles.glassCard, styles.tarotCardBorder]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardSmallTitle}>DAILY TAROT:</Text>
                  <Text style={styles.tarotTitle}>THE STAR</Text>
                </View>

                <View style={styles.tarotImageContainer}>
                  <Image
                    source={require('../../assets/images/tarot_placeholder.png')}
                    style={styles.tarotImage}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.tarotFooter}>
                  <Text style={styles.tarotStatus}>The Star (Upright)</Text>
                  <Text style={styles.tarotDesc} numberOfLines={2}>
                    Hope, Inspiration, Renewal. A day of healing and clarity.
                  </Text>
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Celestial Alignments */}
          <View style={styles.alignmentsSection}>
            <Text style={styles.sectionTitle}>CELESTIAL ALIGNMENTS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.alignmentsScroll}
            >
              <BlurView intensity={20} tint="dark" style={styles.alignmentMiniCard}>
                <Text style={styles.alignmentIcon}>☿</Text>
                <View>
                  <Text style={styles.alignmentTitle}>Mercury in Retrograde</Text>
                  <Text style={styles.alignmentSub}>4d left</Text>
                </View>
              </BlurView>
              <BlurView intensity={20} tint="dark" style={styles.alignmentMiniCard}>
                <Text style={styles.alignmentIcon}>🌕</Text>
                <View>
                  <Text style={styles.alignmentTitle}>Full Moon in Taurus</Text>
                  <Text style={styles.alignmentSub}>Nov 15</Text>
                </View>
              </BlurView>
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.navButton} onPress={onNavigateToCharts}>
              <BlurView intensity={15} tint="light" style={styles.navButtonBlur}>
                <Text style={styles.navButtonIcon}>📊</Text>
                <Text style={styles.navButtonText}>Charts</Text>
              </BlurView>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={onNavigateToCreateChart}>
              <BlurView intensity={15} tint="light" style={styles.navButtonBlur}>
                <Text style={styles.navButtonIcon}>➕</Text>
                <Text style={styles.navButtonText}>New</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.deep,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerBackground: {
    width: '100%',
    height: 300,
    justifyContent: 'flex-end',
  },
  headerImage: {
    opacity: 0.8,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greetingText: {
    fontSize: 22,
    color: theme.colors.text.primary,
    fontWeight: '400',
  },
  userName: {
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  avatarBorder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
  },
  dateStrip: {
    marginTop: -10,
    marginBottom: 20,
  },
  dateStripContent: {
    paddingHorizontal: 15,
    gap: 15,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    minWidth: 60,
  },
  activeDateItem: {
    // Styling for active state
  },
  dateText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    marginBottom: 4,
  },
  activeDateText: {
    color: theme.colors.secondary,
  },
  dateSubText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
  },
  activeDateSubText: {
    color: '#FFF',
  },
  activeIndicator: {
    width: 20,
    height: 2,
    backgroundColor: theme.colors.secondary,
    marginTop: 6,
    borderRadius: 1,
  },
  contentPadding: {
    paddingHorizontal: 20,
  },
  mainTitleSection: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 25,
    letterSpacing: 1,
  },
  mainCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 30,
  },
  horoscopeCardWrapper: {
    flex: 1.1,
  },
  tarotCardWrapper: {
    flex: 1,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 16,
    height: 280,
  },
  tarotCardBorder: {
    borderColor: 'rgba(157,101,255,0.3)',
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardSmallTitle: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  signTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.secondary,
    letterSpacing: 0.5,
  },
  tarotTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  signEmoji: {
    fontSize: 50,
    alignSelf: 'center',
    marginVertical: 10,
    color: theme.colors.secondary,
  },
  cardFooter: {
    marginTop: 'auto',
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
    marginBottom: 8,
  },
  cardSmallIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  tarotImageContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  tarotImage: {
    width: '100%',
    height: '100%',
  },
  tarotFooter: {
    marginTop: 4,
  },
  tarotStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  tarotDesc: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
  },
  alignmentsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 15,
    letterSpacing: 2,
  },
  alignmentsScroll: {
    gap: 12,
  },
  alignmentMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minWidth: 180,
    gap: 12,
  },
  alignmentIcon: {
    fontSize: 24,
  },
  alignmentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  alignmentSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  navButton: {
    flex: 1,
  },
  navButtonBlur: {
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  navButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default HomeScreen;
