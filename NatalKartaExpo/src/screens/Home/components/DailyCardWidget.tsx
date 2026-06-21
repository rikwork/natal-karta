import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import tarotData from '../../../constants/tarotDescriptions.json';
import { tarotImages } from '../../../constants/tarotImages';
import { theme } from '../../../theme';

interface DailyCardWidgetProps {
  dailyCard: { tarot_card_id: number; drawn_on: string; opened: boolean } | null;
  loading: boolean;
  onPress: () => void;
}

const DailyCardWidget: React.FC<DailyCardWidgetProps> = ({ dailyCard, loading, onPress }) => {
  if (loading) {
    return (
      <View style={[styles.tarotCardWrapper, styles.loadingCenter]}>
        <ActivityIndicator color="#9D65FF" />
      </View>
    );
  }

  const isOpened = dailyCard?.opened || false;
  const cardInfo =
    isOpened && dailyCard
      ? (tarotData as any[]).find((c: any) => c.id === dailyCard.tarot_card_id)
      : null;

  return (
    <TouchableOpacity style={styles.tarotCardWrapper} activeOpacity={0.9} onPress={onPress}>
      <BlurView intensity={40} tint="dark" style={styles.glassCard}>
        <LinearGradient
          colors={['rgba(157,101,255,0.15)', 'transparent'] as const}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.cardHeader}>
          <Text style={styles.cardSmallTitle}>КАРТА ДНЯ:</Text>
          <Text style={[styles.tarotTitle, !cardInfo && styles.unopenedTitle]}>
            {cardInfo ? cardInfo.name.toUpperCase() : 'УЗНАЙ СВОЮ КАРТУ'}
          </Text>
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.glowEffect} />
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
        </View>

        <View style={styles.tarotFooter}>
          {cardInfo && (
            <Text style={styles.tarotDesc} numberOfLines={3}>
              {`${cardInfo.description_male.substring(0, 60)}...`}
            </Text>
          )}
          <View style={styles.actionPrompt}>
            <Text style={styles.actionText}>{cardInfo ? 'Подробнее →' : 'Открыть карту →'}</Text>
          </View>
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
    fontFamily: theme.fonts.bodyBold,
    letterSpacing: 1.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  tarotTitle: {
    fontSize: 20,
    color: '#FFF',
    letterSpacing: 1,
    fontFamily: theme.fonts.heading,
  },
  unopenedTitle: {
    fontSize: 15,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  glowEffect: {
    position: 'absolute',
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: 'rgba(157, 101, 255, 0.08)',
    shadowColor: '#9D65FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  tarotImageContainer: {
    width: 80,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(157, 101, 255, 0.3)',
    shadowColor: '#9D65FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  tarotImage: {
    width: '100%',
    height: '100%',
  },
  tarotFooter: {
    marginTop: 6,
  },
  tarotDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
    fontFamily: theme.fonts.body,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  actionPrompt: {
    marginTop: 2,
  },
  actionText: {
    fontSize: 12,
    color: '#9D65FF',
    fontFamily: theme.fonts.bodyBold,
    letterSpacing: 1,
  },
});

export default DailyCardWidget;
