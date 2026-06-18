import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Vibration, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { DailyCardService } from '../../../services/DailyCardService';
import tarotData from '../../../constants/tarotDescriptions.json';
import { tarotImages } from '../../../constants/tarotImages';

interface DailyCardWidgetProps {
  userId?: number;
  onPress: () => void;
}

const DailyCardWidget: React.FC<DailyCardWidgetProps> = ({ userId, onPress }) => {
  const [loading, setLoading] = useState(true);
  const [drawnCardId, setDrawnCardId] = useState<number | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const res = await DailyCardService.getDailyCard(userId);
        if (res.success && res.data) {
          setDrawnCardId(res.data.tarot_card_id);
        }
      } catch (err) {
        console.error('Widget preview fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [userId]);

  if (loading) {
    return (
      <View style={[styles.tarotCardWrapper, styles.loadingCenter]}>
        <ActivityIndicator color="#9D65FF" />
      </View>
    );
  }

  const cardInfo = drawnCardId ? (tarotData as any[]).find((c: any) => c.id === drawnCardId) : null;

  return (
    <TouchableOpacity
      style={styles.tarotCardWrapper}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <BlurView intensity={40} tint="dark" style={styles.glassCard}>
        <LinearGradient
          colors={['rgba(157,101,255,0.15)', 'transparent'] as const}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.cardHeader}>
          <Text style={styles.cardSmallTitle}>КАРТА ДНЯ:</Text>
          <Text style={styles.tarotTitle}>{cardInfo ? cardInfo.name.toUpperCase() : 'УЗНАЙ СВОЮ КАРТУ'}</Text>
        </View>

        <View style={styles.tarotImageContainer}>
          <Image
            source={
              cardInfo && tarotImages[cardInfo.id]
                ? tarotImages[cardInfo.id]
                : tarotImages.default
            }
            style={styles.tarotImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)'] as const}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.tarotFooter}>
          <Text style={styles.tarotStatus}>
            {cardInfo ? 'Карта открыта' : 'Нажмите, чтобы открыть'}
          </Text>
          <Text style={styles.tarotDesc} numberOfLines={2}>
            {cardInfo 
              ? `${cardInfo.description_male.substring(0, 60)}...`
              : 'Узнайте предсказание звезд на сегодня через магию Таро.'}
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tarotCardWrapper: {
    flex: 1,
    shadowColor: '#9D65FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  loadingCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  glassCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(157,101,255,0.3)',
    padding: 20,
    height: 300,
    backgroundColor: 'rgba(26,26,46,0.80)',
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardSmallTitle: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  tarotTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  tarotImageContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(157,101,255,0.2)',
  },
  tarotImage: {
    width: '100%',
    height: '100%',
  },
  tarotFooter: {
    marginTop: 6,
  },
  tarotStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9D65FF',
    marginBottom: 4,
  },
  tarotDesc: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 14,
  },
});

export default DailyCardWidget;
