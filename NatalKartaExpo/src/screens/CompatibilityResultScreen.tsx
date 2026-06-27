import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PartnerCompatibility, PartnerCompatibilityData } from '../types';
import ApiService from '../services/api';
import AdService from '../services/AdService';
import AstralHeader from '../components/AstralHeader';
import AstralGlassCard from '../components/AstralGlassCard';
import AstralSafeAreaView from '../components/AstralSafeAreaView';
import { useSubscriptionWithPolling } from '../hooks/useSubscriptionWithPolling';
import { Ionicons } from '@expo/vector-icons';
import { AstralAdLockedSection } from '../components/AstralAdLockedSection';

interface CompatibilityResultScreenProps {
  compatibility: PartnerCompatibility;
  userId: number;
  firebaseUid?: string;
  onBack: () => void;
}

export const CompatibilityResultScreen: React.FC<CompatibilityResultScreenProps> = ({
  compatibility,
  userId,
  firebaseUid,
  onBack,
}) => {
  const initialCompatibilityData = React.useMemo<PartnerCompatibilityData | null>(() => {
    if (!compatibility.compatibility_data) return null;
    if (typeof compatibility.compatibility_data === 'string') {
      try {
        return JSON.parse(compatibility.compatibility_data) as PartnerCompatibilityData;
      } catch {
        return null;
      }
    }
    return compatibility.compatibility_data as PartnerCompatibilityData;
  }, [compatibility.compatibility_data]);

  const { data: compatibilityData, loading } = useSubscriptionWithPolling<
    PartnerCompatibilityData,
    any
  >({
    userId,
    firebaseUid,
    itemId: compatibility.id,
    channel: 'PartnerCompatibilityChannel',
    messageIdKey: 'compatibility_id',
    messageDataKey: 'compatibility_data',
    fetchData: React.useCallback(
      () => ApiService.getPartnerCompatibility(userId, compatibility.id),
      [userId, compatibility.id],
    ),
    initialData: initialCompatibilityData,
  });

  const [unlockedSections, setUnlockedSections] = useState<{
    love: boolean;
    friendship: boolean;
    communication: boolean;
    challenges: boolean;
  }>({
    love: false,
    friendship: false,
    communication: false,
    challenges: false,
  });

  useEffect(() => {
    const loadUnlockedStates = async () => {
      try {
        const key = `@unlocked_compat_sections:${compatibility.id}`;
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          setUnlockedSections(JSON.parse(stored));
        } else {
          setUnlockedSections({
            love: false,
            friendship: false,
            communication: false,
            challenges: false,
          });
        }
      } catch (e) {
        console.error('Failed to load unlocked compatibility sections', e);
      }
    };
    loadUnlockedStates();
  }, [compatibility.id]);

  const handleUnlockSection = (section: 'love' | 'friendship' | 'communication' | 'challenges') => {
    AdService.showRewardedAd(
      async () => {
        try {
          const key = `@unlocked_compat_sections:${compatibility.id}`;
          const updated = {
            ...unlockedSections,
            [section]: true,
          };
          setUnlockedSections(updated);
          await AsyncStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save unlocked compatibility section status', e);
        }
      },
      () => {
        Alert.alert(
          'Остановка',
          'Показ прерван. Чтобы открыть прогноз полностью, посмотрите видео до конца.',
        );
      },
    );
  };

  const renderMeter = (
    title: string,
    value: number,
    colors: readonly [string, string],
    icon: React.ComponentProps<typeof Ionicons>['name'],
  ) => {
    return (
      <View style={styles.meterContainer}>
        <View style={styles.meterRow}>
          <Ionicons name={icon} size={16} color={colors[1]} style={{ marginRight: 6 }} />
          <Text style={styles.meterTitle}>{title}</Text>
          <Text style={[styles.meterValue, { color: colors[1] }]}>{value}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${value}%` }]}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <AstralSafeAreaView style={styles.loadingContainer}>
        <AstralHeader title="Совместимость" onBack={onBack} />
        <View style={styles.loadingInner}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Звезды сходятся...</Text>
          <Text style={styles.loadingSubtext}>
            Рассчитываем совместимость с {compatibility.partner_name}. Это может занять около
            минуты.
          </Text>
        </View>
      </AstralSafeAreaView>
    );
  }

  if (!compatibilityData) {
    return (
      <AstralSafeAreaView style={styles.loadingContainer}>
        <AstralHeader title="Совместимость" onBack={onBack} />
        <View style={styles.loadingInner}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>Не удалось загрузить данные совместимости</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onBack}>
            <Text style={styles.retryText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </AstralSafeAreaView>
    );
  }

  return (
    <AstralSafeAreaView style={styles.container}>
      <AstralHeader title={`Союз с ${compatibility.partner_name}`} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top summary card */}
        <AstralGlassCard style={styles.summaryCard}>
          <LinearGradient
            colors={['rgba(255, 107, 107, 0.1)', 'rgba(255, 153, 102, 0.1)'] as const}
            style={styles.cardGradient}
          >
            <View style={styles.heartWrapper}>
              <Ionicons name="heart" size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.summaryTitle}>Астрологический вердикт</Text>
            <Text style={styles.summaryText}>{compatibilityData.summary}</Text>
          </LinearGradient>
        </AstralGlassCard>

        {/* Compatibility Meters */}
        <AstralGlassCard style={styles.metersCard}>
          <Text style={styles.sectionTitle}>Показатели совместимости</Text>

          {renderMeter(
            'Общая совместимость',
            compatibilityData.overall_score,
            ['#8E2DE2', '#4A00E0'] as const,
            'star',
          )}
          {renderMeter(
            'Любовь и Брак',
            compatibilityData.love_score,
            ['#FF5E62', '#FF9966'] as const,
            'heart',
          )}
          {renderMeter(
            'Дружба и Жизнь',
            compatibilityData.friendship_score,
            ['#11998e', '#38ef7d'] as const,
            'people',
          )}
          {renderMeter(
            'Общение и Ментальный контакт',
            compatibilityData.communication_score,
            ['#00c6ff', '#0072ff'] as const,
            'chatbubbles',
          )}
        </AstralGlassCard>

        {/* Partner astrological placements */}
        {(compatibilityData.partner_sun ||
          compatibilityData.partner_moon ||
          compatibilityData.partner_ascendant) && (
          <AstralGlassCard style={styles.placementsCard}>
            <Text style={styles.sectionTitle}>Космос партнера</Text>
            <View style={styles.placementsRow}>
              {compatibilityData.partner_sun && (
                <View style={styles.placementItem}>
                  <Text style={styles.placementLabel}>Солнце</Text>
                  <Text style={styles.placementValue}>{compatibilityData.partner_sun}</Text>
                </View>
              )}
              {compatibilityData.partner_moon && (
                <View style={styles.placementItem}>
                  <Text style={styles.placementLabel}>Луна</Text>
                  <Text style={styles.placementValue}>{compatibilityData.partner_moon}</Text>
                </View>
              )}
              {compatibilityData.partner_ascendant && (
                <View style={styles.placementItem}>
                  <Text style={styles.placementLabel}>Асцендент</Text>
                  <Text style={styles.placementValue}>{compatibilityData.partner_ascendant}</Text>
                </View>
              )}
            </View>
          </AstralGlassCard>
        )}

        {/* Detailed compatibility reports */}
        <AstralAdLockedSection
          title="❤️ Любовные отношения"
          text={compatibilityData.love_details}
          isUnlocked={unlockedSections.love}
          onUnlock={() => handleUnlockSection('love')}
          previewLines={3}
          icon="heart"
          gradientColors={['rgba(255,105,180,0.15)', 'rgba(255,255,255,0.0)'] as const}
          style={{ marginBottom: 16 }}
        />

        <AstralAdLockedSection
          title="🤝 Дружеский союз"
          text={compatibilityData.friendship_details}
          isUnlocked={unlockedSections.friendship}
          onUnlock={() => handleUnlockSection('friendship')}
          previewLines={0}
          icon="people"
          gradientColors={['rgba(17,153,142,0.15)', 'rgba(255,255,255,0.0)'] as const}
          style={{ marginBottom: 16 }}
        />

        <AstralAdLockedSection
          title="💬 Общение и интеллект"
          text={compatibilityData.communication_details}
          isUnlocked={unlockedSections.communication}
          onUnlock={() => handleUnlockSection('communication')}
          previewLines={0}
          icon="chatbubbles"
          gradientColors={['rgba(0,198,255,0.15)', 'rgba(255,255,255,0.0)'] as const}
          style={{ marginBottom: 16 }}
        />

        <AstralAdLockedSection
          title="⚠️ Вызовы и конфликты"
          text={compatibilityData.challenges}
          isUnlocked={unlockedSections.challenges}
          onUnlock={() => handleUnlockSection('challenges')}
          previewLines={0}
          icon="alert-circle"
          gradientColors={['rgba(255,94,98,0.15)', 'rgba(255,255,255,0.0)'] as const}
          style={{ marginBottom: 16 }}
        />
      </ScrollView>
    </AstralSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F0E6D2',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    lineHeight: 18,
  },
  summaryCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  heartWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9966',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#F0E6D2',
    textAlign: 'center',
    lineHeight: 20,
  },
  metersCard: {
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 20,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  meterContainer: {
    marginBottom: 16,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  meterTitle: {
    flex: 1,
    fontSize: 13,
    color: '#F0E6D2',
    fontWeight: '500',
  },
  meterValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  placementsCard: {
    padding: 20,
    marginBottom: 20,
  },
  placementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  placementItem: {
    flex: 1,
    alignItems: 'center',
  },
  placementLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  placementValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },

  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  retryText: {
    color: '#F0E6D2',
    fontWeight: 'bold',
  },
});

export default CompatibilityResultScreen;
