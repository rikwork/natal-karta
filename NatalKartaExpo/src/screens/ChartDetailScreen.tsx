import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NatalChart, NatalChartData } from '../types';
import ApiService from '../services/api';
import AdService from '../services/AdService';
import { formatBirthTime } from '../utils/dateFormatter';
import AstralHeader from '../components/AstralHeader';
import AstralGlassCard from '../components/AstralGlassCard';
import { BlurView } from 'expo-blur';
import AstralSafeAreaView from '../components/AstralSafeAreaView';
import { getWebSocketUrl } from '../utils/websocket';

interface LockedSectionProps {
  title: string;
  previewText: string;
  lockedText: string | null;
  isUnlocked: boolean;
  onUnlock: () => void;
  gradientColors: readonly [string, string];
}

const LockedSection: React.FC<LockedSectionProps> = ({
  title,
  previewText,
  lockedText,
  isUnlocked,
  onUnlock,
  gradientColors,
}) => {
  if (!previewText) return null;

  return (
    <AstralGlassCard>
      <LinearGradient colors={gradientColors} style={styles.cardGradient}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardBody}>{previewText}</Text>

        {isUnlocked && lockedText ? (
          <Text style={[styles.cardBody, { marginTop: 10 }]}>{lockedText}</Text>
        ) : !isUnlocked && lockedText ? (
          <View style={styles.lockedContainer}>
            <BlurView intensity={60} tint="dark" style={styles.lockOverlay}>
              <Text style={styles.lockedText}>Полный прогноз скрыт</Text>
              <TouchableOpacity style={styles.unlockAdButton} onPress={onUnlock}>
                <Text style={styles.unlockAdButtonText}>🔓 Открыть (Смотреть рекламу)</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        ) : null}
      </LinearGradient>
    </AstralGlassCard>
  );
};

interface ChartDetailScreenProps {
  chart: NatalChart;
  userId: number;
  firebaseUid?: string;
  onBack: () => void;
  onWatchAd: () => void;
}

const ChartDetailScreen: React.FC<ChartDetailScreenProps> = ({
  chart,
  userId,
  firebaseUid,
  onBack,
  onWatchAd,
}) => {
  const [chartData, setChartData] = useState<NatalChartData | null>(() => {
    if (!chart.chart_data) return null;
    if (typeof chart.chart_data === 'string') {
      try {
        return JSON.parse(chart.chart_data) as NatalChartData;
      } catch {
        return {
          short_summary: '',
          identity: chart.chart_data,
          emotions: '',
          emotions_preview: '',
          emotions_locked: null,
          love_preview: '',
          love_locked: null,
          career_preview: '',
          career_locked: null,
        };
      }
    }
    return chart.chart_data as NatalChartData;
  });

  // Track unlocked sections locally per chart
  const [unlockedSections, setUnlockedSections] = useState<{
    emotions: boolean;
    love: boolean;
    career: boolean;
  }>({
    emotions: false,
    love: false,
    career: false,
  });

  useEffect(() => {
    const loadUnlockedStates = async () => {
      try {
        const key = `@unlocked_sections:${chart.id}`;
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          setUnlockedSections(JSON.parse(stored));
        } else {
          setUnlockedSections({
            emotions: false,
            love: false,
            career: false,
          });
        }
      } catch (e) {
        console.error('Failed to load unlocked sections', e);
      }
    };
    loadUnlockedStates();
  }, [chart.id]);

  useEffect(() => {
    if (chartData) return;

    let ws: WebSocket | null = null;
    let isSubscribed = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const startPolling = () => {
      if (pollInterval) return;
      console.log('Falling back to polling chart status...');
      pollInterval = setInterval(async () => {
        try {
          const response = await ApiService.getNatalChart(userId, chart.id);
          if (response.data && response.data.chart_data && isSubscribed) {
            const rawData = response.data.chart_data;
            const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
            setChartData(parsedData);
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
          }
        } catch (err) {
          console.error('Error polling chart status:', err);
        }
      }, 5000);
    };

    const connectWebSocket = () => {
      try {
        const wsUrl = getWebSocketUrl(userId);
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isSubscribed) return;
          const msg = {
            command: 'subscribe',
            identifier: JSON.stringify({
              channel: 'NatalChartChannel',
              user_id: userId,
              firebase_uid: firebaseUid,
            }),
          };
          ws?.send(JSON.stringify(msg));
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'ping') return;

            if (data.message && data.message.chart_id === chart.id) {
              if (data.message.status === 'completed') {
                const rawData = data.message.chart_data;
                const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                setChartData(parsedData);
                if (pollInterval) {
                  clearInterval(pollInterval);
                  pollInterval = null;
                }
                ws?.close();
              } else if (data.message.status === 'failed') {
                Alert.alert('Ошибка', data.message.error || 'Не удалось рассчитать карту');
                if (pollInterval) {
                  clearInterval(pollInterval);
                  pollInterval = null;
                }
                ws?.close();
              }
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        ws.onerror = (e) => {
          console.error('WebSocket error, falling back to polling:', e);
          startPolling();
        };

        ws.onclose = () => {
          console.log('WebSocket closed, starting polling fallback if loading');
          if (isSubscribed) {
            startPolling();
          }
        };
      } catch (err) {
        console.error('WebSocket connection failed, falling back to polling:', err);
        startPolling();
      }
    };

    connectWebSocket();

    // Check status via API to prevent race conditions
    const checkChartStatus = async () => {
      try {
        const response = await ApiService.getNatalChart(userId, chart.id);
        if (response.data && response.data.chart_data && isSubscribed) {
          const rawData = response.data.chart_data;
          const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
          setChartData(parsedData);
          ws?.close();
        }
      } catch (e) {
        console.error('Error checking chart status:', e);
      }
    };

    checkChartStatus();

    return () => {
      isSubscribed = false;
      if (ws) {
        ws.close();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [chartData, userId, chart.id, firebaseUid]);

  const handleUnlockSection = (section: 'emotions' | 'love' | 'career') => {
    AdService.showRewardedAd(
      async () => {
        try {
          const key = `@unlocked_sections:${chart.id}`;
          const updated = {
            ...unlockedSections,
            [section]: true,
          };
          setUnlockedSections(updated);
          await AsyncStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save unlocked section status', e);
        }
      },
      () => {
        Alert.alert(
          'Остановка',
          'Показ прерван. Чтобы открыть прогноз полностью, посмотрите видео до конца.',
        );
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <AstralSafeAreaView style={styles.safeArea}>
        <AstralHeader title="Ваша Карта" onBack={onBack} />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Info Header Card */}
          <AstralGlassCard style={styles.infoCard}>
            <Text style={styles.chartName}>{chart.name}</Text>
            <Text style={styles.detailText}>
              {formatDate(chart.birth_date)} в {formatBirthTime(chart.birth_time)}
            </Text>
            <Text style={styles.detailText}>{chart.birth_place}</Text>
          </AstralGlassCard>

          {!chartData ? (
            <View style={styles.noDataContainer}>
              <ActivityIndicator size="large" color="#FFD700" style={{ marginBottom: 20 }} />
              <Text style={styles.noDataTitle}>Звезды строят вашу карту...</Text>
              <Text style={styles.noDataSubtitle}>
                Анализируем положение звезд и готовим вашу расшифровку. Это займет до 1 минуты.
              </Text>
            </View>
          ) : (
            <View style={styles.cardsContainer}>
              {/* Short Summary Card (Free) */}
              {chartData.short_summary && (
                <AstralGlassCard>
                  <LinearGradient
                    colors={['rgba(255,215,0,0.15)', 'rgba(255,255,255,0.0)']}
                    style={styles.cardGradient}
                  >
                    <Text style={styles.cardTitle}>🌟 Суть твоей карты</Text>
                    <Text style={[styles.cardBody, { fontStyle: 'italic', fontWeight: '500' }]}>
                      {chartData.short_summary}
                    </Text>
                  </LinearGradient>
                </AstralGlassCard>
              )}

              {/* Identity Card (Free) */}
              <AstralGlassCard>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.0)']}
                  style={styles.cardGradient}
                >
                  <Text style={styles.cardTitle}>✨ Личность и Карма</Text>
                  <Text style={styles.cardBody}>{chartData.identity}</Text>
                </LinearGradient>
              </AstralGlassCard>

              {/* Emotions Card (Ad Locked) */}
              {(() => {
                const emotionsData = chartData.emotions_preview
                  ? { preview: chartData.emotions_preview, locked: chartData.emotions_locked || null }
                  : chartData.emotions
                  ? (() => {
                      const paragraphs = chartData.emotions.split('\n\n');
                      return { preview: paragraphs[0], locked: paragraphs.slice(1).join('\n\n') || null };
                    })()
                  : { preview: '', locked: null };

                return (
                  <LockedSection
                    title="🌊 Эмоции и Внутренний мир"
                    previewText={emotionsData.preview}
                    lockedText={emotionsData.locked}
                    isUnlocked={unlockedSections.emotions}
                    onUnlock={() => handleUnlockSection('emotions')}
                    gradientColors={['rgba(135,206,235,0.15)', 'rgba(255,255,255,0.0)'] as const}
                  />
                );
              })()}

              {/* Love Card (Ad Locked) */}
              <LockedSection
                title="❤️ Любовь и Отношения"
                previewText={chartData.love_preview}
                lockedText={chartData.love_locked}
                isUnlocked={unlockedSections.love}
                onUnlock={() => handleUnlockSection('love')}
                gradientColors={['rgba(255,105,180,0.15)', 'rgba(255,255,255,0.0)'] as const}
              />

              {/* Career Card (Ad Locked) */}
              <LockedSection
                title="💼 Карьера и Деньги"
                previewText={chartData.career_preview}
                lockedText={chartData.career_locked}
                isUnlocked={unlockedSections.career}
                onUnlock={() => handleUnlockSection('career')}
                gradientColors={['rgba(0,255,255,0.15)', 'rgba(255,255,255,0.0)'] as const}
              />
            </View>
          )}
        </ScrollView>
      </AstralSafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoCard: {
    padding: 20,
    marginBottom: 24,
  },
  chartName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#E9D5FF',
    marginBottom: 4,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  noDataTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(255, 215, 0, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  noDataSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    gap: 20,
  },
  cardGradient: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  cardBody: {
    fontSize: 16,
    color: '#E2E8F0',
    lineHeight: 26,
  },
  lockedContainer: {
    marginTop: -20,
    paddingTop: 40, // overlap and fade transition
    overflow: 'hidden',
  },
  lockOverlay: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  lockedText: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 16,
  },
  unlockAdButton: {
    backgroundColor: 'rgba(236, 72, 153, 0.8)', // Pinkish glowing button for ads
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  unlockAdButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default ChartDetailScreen;
