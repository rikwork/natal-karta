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
} from 'react-native';
import { NatalChart } from '../types';
import ApiService from '../services/api';

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
      await ApiService.generateNatalChart(userId, chart.id);
      Alert.alert('Успех', 'Натальная карта сгенерирована!');
      loadCharts(); // Обновляем список
    } catch (_error) {
      Alert.alert('Ошибка', 'Не удалось сгенерировать натальную карту');
    }
  };

  const renderChartItem = ({ item }: { item: NatalChart }) => (
    <TouchableOpacity style={styles.chartCard} onPress={() => onChartPress(item)}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartName}>{item.name}</Text>
        <Text style={styles.chartDate}>
          {new Date(item.birth_date).toLocaleDateString('ru-RU')}
        </Text>
      </View>

      <View style={styles.chartDetails}>
        <Text style={styles.chartDetail}>Время: {item.birth_time}</Text>
        <Text style={styles.chartDetail}>Место: {item.birth_place}</Text>
      </View>

      <View style={styles.chartActions}>
        {item.chart_data ? (
          <View style={styles.generatedBadge}>
            <Text style={styles.generatedText}>Сгенерирована</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.generateButton} onPress={() => handleGenerateChart(item)}>
            <Text style={styles.generateButtonText}>Сгенерировать</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Мои натальные карты</Text>
      </View>

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
    paddingTop: 60,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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

export default ChartsScreen;
