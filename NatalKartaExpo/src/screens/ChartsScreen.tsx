import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Vibration,
} from 'react-native';
import { NatalChart } from '../types';
import ApiService from '../services/api';
import AstralHeader from '../components/AstralHeader';
import AstralGlassCard from '../components/AstralGlassCard';
import AstralSafeAreaView from '../components/AstralSafeAreaView';

interface ChartsScreenProps {
  userId: number;
  onChartPress: (chart: NatalChart) => void;
  onBack: () => void;
}

const ChartsScreen: React.FC<ChartsScreenProps> = ({ userId, onChartPress, onBack }) => {
  const [charts, setCharts] = useState<NatalChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCharts = useCallback(async () => {
    try {
      const response = await ApiService.getNatalCharts(userId);
      if (response.data) {
        setCharts(response.data);
      } else {
        setCharts([]);
      }
    } catch (_error) {
      Alert.alert('Ошибка', 'Не удалось загрузить натальные карты');
      setCharts([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCharts();
  }, [loadCharts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCharts();
    setRefreshing(false);
  };

  const handleGenerateChart = async (chart: NatalChart) => {
    try {
      Vibration.vibrate(10);
      await ApiService.generateNatalChart(userId, chart.id);
      Vibration.vibrate(50);
      Alert.alert('Успех', 'Натальная карта сгенерирована!');
      loadCharts(); // Обновляем список
    } catch (_error) {
      Alert.alert('Ошибка', 'Не удалось сгенерировать натальную карту');
    }
  };

  const renderChartItem = useCallback(
    ({ item }: { item: NatalChart }) => (
      <ChartItem
        item={item}
        onPress={() => {
          Vibration.vibrate(10);
          onChartPress(item);
        }}
        onGenerate={() => handleGenerateChart(item)}
      />
    ),
    [onChartPress, handleGenerateChart],
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
        <Text style={styles.loadingText}>Загрузка натальных карт...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AstralSafeAreaView style={styles.safeArea}>
        <AstralHeader title="Мои натальные карты" onBack={onBack} />

        {charts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Нет натальных карт</Text>
            <Text style={styles.emptyText}>
              Создайте свою первую натальную карту, чтобы начать изучение астрологии
            </Text>
          </View>
        ) : (
          <FlatList
            data={charts}
            renderItem={renderChartItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#6B46C1']}
              />
            }
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F0E6D2',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    padding: 16,
  },
  chartCard: {
    padding: 16,
  },
  chartHeader: {
    marginBottom: 12,
  },
  chartName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F0E6D2',
    marginBottom: 4,
  },
  chartDate: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '600',
  },
  chartDetails: {
    marginBottom: 12,
  },
  chartDetail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  chartActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  generatedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  generatedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

// Memoized list item for better performance
const ChartItem = React.memo(
  ({
    item,
    onPress,
    onGenerate,
  }: {
    item: NatalChart;
    onPress: () => void;
    onGenerate: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ marginBottom: 16 }}>
      <AstralGlassCard style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartName} allowFontScaling={true}>
            {item.name}
          </Text>
          <Text style={styles.chartDate} allowFontScaling={true}>
            {new Date(item.birth_date).toLocaleDateString('ru-RU')}
          </Text>
        </View>

        <View style={styles.chartDetails}>
          <Text style={styles.chartDetail} allowFontScaling={true}>
            Время: {item.birth_time}
          </Text>
          <Text style={styles.chartDetail} allowFontScaling={true}>
            Место: {item.birth_place}
          </Text>
        </View>

        <View style={styles.chartActions}>
          {item.chart_data ? (
            <View style={styles.generatedBadge}>
              <Text style={styles.generatedText} allowFontScaling={true}>
                Сгенерирована
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.generateButton}
              onPress={onGenerate}
              activeOpacity={0.8}
            >
              <Text style={styles.generateButtonText} allowFontScaling={true}>
                Сгенерировать
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </AstralGlassCard>
    </TouchableOpacity>
  ),
);

ChartItem.displayName = 'ChartItem';

export default ChartsScreen;
