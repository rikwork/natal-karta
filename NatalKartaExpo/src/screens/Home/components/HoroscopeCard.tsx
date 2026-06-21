import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { HoroscopePeriod } from '../../../hooks/useHomeScreen';
import { theme } from '../../../theme';

import { getZodiacIcon } from '../../../utils/zodiacIcons';

interface HoroscopeCardProps {
  onPress: () => void;
  content: string;
  period: HoroscopePeriod;
  onPeriodChange: (period: HoroscopePeriod) => void;
  sign?: string;
}

const HoroscopeCard: React.FC<HoroscopeCardProps> = ({ onPress, content, period, sign }) => {
  const getPeriodTitle = () => {
    switch (period) {
      case 'today':
        return 'СЕГОДНЯ';
      case 'tomorrow':
        return 'ЗАВТРА';
      case 'week':
        return 'НЕДЕЛЯ';
      case 'month':
        return 'МЕСЯЦ';
      default:
        return 'ГОРОСКОП';
    }
  };

  const zodiacIcon = getZodiacIcon(sign || 'Овен');

  return (
    <TouchableOpacity style={styles.horoscopeCardWrapper} onPress={onPress} activeOpacity={1}>
      <BlurView intensity={40} tint="dark" style={styles.glassCard}>
        <LinearGradient
          colors={['rgba(255,215,0,0.15)', 'transparent'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.cardHeader}>
          <Text style={styles.cardSmallTitle}>{getPeriodTitle()}:</Text>
          <Text style={styles.signTitle}>{sign?.toUpperCase() || 'ОВЕН'}</Text>
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.glowEffect} />
          <View style={styles.zodiacFrame}>
            <Image source={zodiacIcon} style={styles.zodiacImage} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardDescription} numberOfLines={3}>
            {content ||
              'Звезды сулят вам необычайный прилив творческой энергии. Прислушайтесь к интуиции.'}
          </Text>
          <View style={styles.actionPrompt}>
            <Text style={styles.actionText}>Подробнее →</Text>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  horoscopeCardWrapper: {
    flex: 1,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  glassCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
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
  signTitle: {
    fontSize: 20,
    color: theme.colors.secondary,
    letterSpacing: 1,
    fontFamily: theme.fonts.heading,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  glowEffect: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 215, 0, 0.06)',
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
  },
  zodiacFrame: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  zodiacImage: {
    width: 120,
    height: 120,
  },
  cardFooter: {
    marginTop: 6,
  },
  cardDescription: {
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
    color: theme.colors.secondary,
    fontFamily: theme.fonts.bodyBold,
    letterSpacing: 1,
  },
});

export default HoroscopeCard;
