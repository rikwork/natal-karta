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
import { NatalChart, NatalChartData } from '../types';
import ApiService from '../services/api';
import { formatBirthTime } from '../utils/dateFormatter';
import AstralHeader from '../components/AstralHeader';
import AstralGlassCard from '../components/AstralGlassCard';
import { BlurView } from 'expo-blur';
import AstralSafeAreaView from '../components/AstralSafeAreaView';
import { ENV } from '../config/api';

const getWebSocketUrl = () => {
  const baseUrl = ENV.API_BASE_URL; // e.g. http://localhost:3000/api/v1
  const rootUrl = baseUrl.replace('/api/v1', '/cable');
  return rootUrl.replace(/^http/, 'ws');
};

// Removed unused width Dimensions

interface ChartDetailScreenProps {
  chart: NatalChart;
  userId: number;
  onBack: () => void;
  onWatchAd: () => void;
  hasSubscription: boolean;
}

const ChartDetailScreen: React.FC<ChartDetailScreenProps> = ({
  chart,
  userId,
  onBack,
  onWatchAd,
  hasSubscription,
}) => {
  const [chartData, setChartData] = useState<NatalChartData | null>(() => {
    if (!chart.chart_data) return null;
    if (typeof chart.chart_data === 'string') {
      try {
        return JSON.parse(chart.chart_data) as NatalChartData;
      } catch (_e) {
        return {
          short_summary: '',
          identity: chart.chart_data,
          emotions: '',
          love_preview: '',
          love_locked: null,
          career_preview: '',
          career_locked: null,
        };
      }
    }
    return chart.chart_data as NatalChartData;
  });
  const [loading, setLoading] = useState(false);

  // Locked states simulating ad watch required
  const [isLoveUnlocked, setIsLoveUnlocked] = useState(hasSubscription);
  const [isCareerUnlocked, setIsCareerUnlocked] = useState(hasSubscription);

  useEffect(() => {
    setIsLoveUnlocked(hasSubscription);
    setIsCareerUnlocked(hasSubscription);
  }, [hasSubscription]);

  useEffect(() => {
    if (chartData) return;

    let ws: WebSocket | null = null;
    let isSubscribed = true;

    const connectWebSocket = () => {
      try {
        const wsUrl = getWebSocketUrl();
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isSubscribed) return;
          const msg = {
            command: 'subscribe',
            identifier: JSON.stringify({
              channel: 'NatalChartChannel',
              user_id: userId,
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
                ws?.close();
              } else if (data.message.status === 'failed') {
                Alert.alert('Ошибка', data.message.error || 'Не удалось рассчитать карту');
                ws?.close();
              }
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        ws.onerror = (e) => {
          console.error('WebSocket error:', e);
        };
      } catch (err) {
        console.error('WebSocket connection failed:', err);
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
    };
  }, [chartData, userId, chart.id]);

  const handleUnlockLove = () => {
    onWatchAd();
  };

  const handleUnlockCareer = () => {
    onWatchAd();
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
                Астрологический расчет и генерация интерпретации занимают до 1 минуты. Пожалуйста, подождите.
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

              {/* Emotions Card (Free) */}
              {chartData.emotions && (
                <AstralGlassCard>
                  <LinearGradient
                    colors={['rgba(135,206,235,0.15)', 'rgba(255,255,255,0.0)']}
                    style={styles.cardGradient}
                  >
                    <Text style={styles.cardTitle}>🌊 Эмоции и Внутренний мир</Text>
                    <Text style={styles.cardBody}>{chartData.emotions}</Text>
                  </LinearGradient>
                </AstralGlassCard>
              )}

              {/* Love Card (Ad Locked) */}
              <AstralGlassCard>
                <LinearGradient
                  colors={['rgba(255,105,180,0.15)', 'rgba(255,255,255,0.0)']}
                  style={styles.cardGradient}
                >
                  <Text style={styles.cardTitle}>❤️ Любовь и Отношения</Text>
                  <Text style={styles.cardBody}>{chartData.love_preview}</Text>

                  {isLoveUnlocked && chartData.love_locked ? (
                    <Text style={[styles.cardBody, { marginTop: 10 }]}>
                      {chartData.love_locked}
                    </Text>
                  ) : (
                    <View style={styles.lockedContainer}>
                      <BlurView intensity={60} tint="dark" style={styles.lockOverlay}>
                        <Text style={styles.lockedText}>Полный прогноз скрыт</Text>
                        <TouchableOpacity style={styles.unlockAdButton} onPress={handleUnlockLove}>
                          <Text style={styles.unlockAdButtonText}>
                            🔓 Открыть (Смотреть рекламу)
                          </Text>
                        </TouchableOpacity>
                      </BlurView>
                    </View>
                  )}
                </LinearGradient>
              </AstralGlassCard>

              {/* Career Card (Ad Locked) */}
              <AstralGlassCard>
                <LinearGradient
                  colors={['rgba(0,255,255,0.15)', 'rgba(255,255,255,0.0)']}
                  style={styles.cardGradient}
                >
                  <Text style={styles.cardTitle}>💼 Карьера и Деньги</Text>
                  <Text style={styles.cardBody}>{chartData.career_preview}</Text>

                  {isCareerUnlocked && chartData.career_locked ? (
                    <Text style={[styles.cardBody, { marginTop: 10 }]}>
                      {chartData.career_locked}
                    </Text>
                  ) : (
                    <View style={styles.lockedContainer}>
                      <BlurView intensity={60} tint="dark" style={styles.lockOverlay}>
                        <Text style={styles.lockedText}>Полный прогноз скрыт</Text>
                        <TouchableOpacity
                          style={styles.unlockAdButton}
                          onPress={handleUnlockCareer}
                        >
                          <Text style={styles.unlockAdButtonText}>
                            🔓 Открыть (Смотреть рекламу)
                          </Text>
                        </TouchableOpacity>
                      </BlurView>
                    </View>
                  )}
                </LinearGradient>
              </AstralGlassCard>
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
