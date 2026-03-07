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
import { BlurView } from 'expo-blur';
import { NatalChart, NatalChartData } from '../types';
import ApiService from '../services/api';
import { formatBirthTime } from '../utils/dateFormatter';

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

  const handleGenerateChart = async () => {
    setLoading(true);
    try {
      const response = await ApiService.generateNatalChart(userId, chart.id);
      if (response.data && response.data.chart_data) {
        let parsedData: NatalChartData;
        if (typeof response.data.chart_data === 'string') {
          parsedData = JSON.parse(response.data.chart_data);
        } else {
          parsedData = response.data.chart_data;
        }
        setChartData(parsedData);
      } else {
        Alert.alert('Ошибка', 'Не удалось получить данные натальной карты');
      }
    } catch (_error) {
      Alert.alert('Ошибка', 'Не удалось сгенерировать натальную карту');
    } finally {
      setLoading(false);
    }
  };

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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ваша Карта</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Info Header Card */}
        <BlurView intensity={20} tint="light" style={styles.infoCard}>
          <Text style={styles.chartName}>{chart.name}</Text>
          <Text style={styles.detailText}>
            {formatDate(chart.birth_date)} в {formatBirthTime(chart.birth_time)}
          </Text>
          <Text style={styles.detailText}>{chart.birth_place}</Text>
        </BlurView>

        {!chartData ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataTitle}>Карта не рассчитана</Text>
            <TouchableOpacity
              style={[styles.generateButton, loading && styles.generateButtonDisabled]}
              onPress={handleGenerateChart}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.generateButtonText}>Магический расчет</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {/* Short Summary Card (Free) */}
            {chartData.short_summary && (
              <BlurView intensity={40} tint="dark" style={styles.glimmerCard}>
                <LinearGradient
                  colors={['rgba(255,215,0,0.15)', 'rgba(255,255,255,0.0)']}
                  style={styles.cardGradient}
                >
                  <Text style={styles.cardTitle}>🌟 Суть твоей карты</Text>
                  <Text style={[styles.cardBody, { fontStyle: 'italic', fontWeight: '500' }]}>
                    {chartData.short_summary}
                  </Text>
                </LinearGradient>
              </BlurView>
            )}

            {/* Identity Card (Free) */}
            <BlurView intensity={40} tint="dark" style={styles.glimmerCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.0)']}
                style={styles.cardGradient}
              >
                <Text style={styles.cardTitle}>✨ Личность и Карма</Text>
                <Text style={styles.cardBody}>{chartData.identity}</Text>
              </LinearGradient>
            </BlurView>

            {/* Emotions Card (Free) */}
            {chartData.emotions && (
              <BlurView intensity={40} tint="dark" style={styles.glimmerCard}>
                <LinearGradient
                  colors={['rgba(135,206,235,0.15)', 'rgba(255,255,255,0.0)']}
                  style={styles.cardGradient}
                >
                  <Text style={styles.cardTitle}>🌊 Эмоции и Внутренний мир</Text>
                  <Text style={styles.cardBody}>{chartData.emotions}</Text>
                </LinearGradient>
              </BlurView>
            )}

            {/* Love Card (Ad Locked) */}
            <BlurView intensity={40} tint="dark" style={styles.glimmerCard}>
              <LinearGradient
                colors={['rgba(255,105,180,0.15)', 'rgba(255,255,255,0.0)']}
                style={styles.cardGradient}
              >
                <Text style={styles.cardTitle}>❤️ Любовь и Отношения</Text>
                <Text style={styles.cardBody}>{chartData.love_preview}</Text>

                {isLoveUnlocked && chartData.love_locked ? (
                  <Text style={[styles.cardBody, { marginTop: 10 }]}>{chartData.love_locked}</Text>
                ) : (
                  <View style={styles.lockedContainer}>
                    <BlurView intensity={60} tint="dark" style={styles.lockOverlay}>
                      <Text style={styles.lockedText}>Полный прогноз скрыт</Text>
                      <TouchableOpacity style={styles.unlockAdButton} onPress={handleUnlockLove}>
                        <Text style={styles.unlockAdButtonText}>🔓 Открыть (Смотреть рекламу)</Text>
                      </TouchableOpacity>
                    </BlurView>
                  </View>
                )}
              </LinearGradient>
            </BlurView>

            {/* Career Card (Ad Locked) */}
            <BlurView intensity={40} tint="dark" style={styles.glimmerCard}>
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
                      <TouchableOpacity style={styles.unlockAdButton} onPress={handleUnlockCareer}>
                        <Text style={styles.unlockAdButtonText}>🔓 Открыть (Смотреть рекламу)</Text>
                      </TouchableOpacity>
                    </BlurView>
                  </View>
                )}
              </LinearGradient>
            </BlurView>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60, // approximate notch height
    backgroundColor: 'rgba(107, 70, 193, 0.4)',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#D8B4FE',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255, 255, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
    paddingTop: 40,
  },
  noDataTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#D8B4FE',
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardsContainer: {
    gap: 20,
  },
  glimmerCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
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
