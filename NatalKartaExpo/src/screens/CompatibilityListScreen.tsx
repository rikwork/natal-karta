import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { PartnerCompatibility } from '../types';
import ApiService from '../services/api';
import AstralHeader from '../components/AstralHeader';
import AstralSafeAreaView from '../components/AstralSafeAreaView';
import AstralGlassCard from '../components/AstralGlassCard';
import AstralButton from '../components/AstralButton';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface CompatibilityListScreenProps {
  userId: number;
  onSelectCompatibility: (comp: PartnerCompatibility) => void;
  onNavigateToForm: () => void;
  onBack: () => void;
}

export const CompatibilityListScreen: React.FC<CompatibilityListScreenProps> = ({
  userId,
  onSelectCompatibility,
  onNavigateToForm,
  onBack,
}) => {
  const [compatibilities, setCompatibilities] = useState<PartnerCompatibility[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompatibilities = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await ApiService.getPartnerCompatibilities(userId);
      if (response.data) {
        setCompatibilities(response.data);
      }
    } catch (_e) {
      console.error('Failed to fetch compatibilities', _e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCompatibilities();
  }, [fetchCompatibilities]);

  const handleDelete = (id: number, partnerName: string) => {
    Alert.alert(
      'Удаление расчета',
      `Вы действительно хотите удалить расчет совместимости с ${partnerName}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await ApiService.deletePartnerCompatibility(userId, id);
              if (res.status === 204 || !res.error) {
                setCompatibilities((prev) => prev.filter((item) => item.id !== id));
              } else {
                Alert.alert('Ошибка', res.error || 'Не удалось удалить расчет');
              }
            } catch {
              Alert.alert('Ошибка', 'Не удалось удалить расчет');
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: PartnerCompatibility }) => {
    const rawData = item.compatibility_data;
    let parsedData: { overall_score?: number } | null = null;
    if (rawData) {
      if (typeof rawData === 'string') {
        try {
          parsedData = JSON.parse(rawData) as { overall_score?: number };
        } catch {
          parsedData = null;
        }
      } else {
        parsedData = rawData as { overall_score?: number };
      }
    }
    const score = parsedData?.overall_score;

    return (
      <AstralGlassCard style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.cardPressable}
          onPress={() => onSelectCompatibility(item)}
          activeOpacity={0.7}
        >
          <View style={styles.partnerInfo}>
            <View style={styles.heartCircle}>
              <Ionicons name="heart" size={20} color="#FF6B6B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.partnerName}>{item.partner_name}</Text>
              <Text style={styles.birthPlaceText}>{item.partner_birth_place}</Text>
            </View>
          </View>

          <View style={styles.scoreContainer}>
            {score !== undefined ? (
              <LinearGradient colors={['#FF5E62', '#FF9966'] as const} style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{score}%</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.statusText}>Расчет...</Text>
            )}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id, item.partner_name)}
            >
              <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </AstralGlassCard>
    );
  };

  return (
    <AstralSafeAreaView style={styles.container}>
      <AstralHeader title="Совместимость" onBack={onBack} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : compatibilities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={64} color="rgba(255,255,255,0.15)" />
          <Text style={styles.emptyTitle}>Пока нет расчетов</Text>
          <Text style={styles.emptyText}>
            Узнайте совместимость со своей второй половинкой в любви, дружбе и жизни.
          </Text>
          <AstralButton
            title="Рассчитать совместимость"
            onPress={onNavigateToForm}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={compatibilities}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.footer}>
            <AstralButton
              title="Рассчитать совместимость"
              onPress={onNavigateToForm}
              style={styles.footerButton}
            />
          </View>
        </View>
      )}
    </AstralSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  cardPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  heartCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  partnerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F0E6D2',
    marginBottom: 4,
  },
  birthPlaceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  scoreText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F0E6D2',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    width: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  footerButton: {
    width: '100%',
  },
});

export default CompatibilityListScreen;
