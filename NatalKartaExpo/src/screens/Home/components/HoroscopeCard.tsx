import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { HoroscopePeriod } from '../../../hooks/useHomeScreen';

const SCORPIO_ICON = require('../../../../assets/images/scorpio_icon.png');
const { width } = Dimensions.get('window');

interface HoroscopeCardProps {
  onPress: () => void;
  content: string;
  period: HoroscopePeriod;
  onPeriodChange: (period: HoroscopePeriod) => void;
}

const HoroscopeCard: React.FC<HoroscopeCardProps> = ({ onPress, content, period }) => {
  const getPeriodTitle = () => {
    switch (period) {
      case 'today': return 'СЕГОДНЯ';
      case 'tomorrow': return 'ЗАВТРА';
      case 'week': return 'НЕДЕЛЯ';
      case 'month': return 'МЕСЯЦ';
      default: return 'ГОРОСКОП';
    }
  };

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
          <Text style={styles.signTitle}>СКОРПИОН</Text>
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.glowEffect} />
          <Image source={SCORPIO_ICON} style={styles.scorpioImage} resizeMode="contain" />
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardDescription} numberOfLines={3}>
            {content || 'Звезды сулят вам необычайный прилив творческой энергии. Прислушайтесь к интуиции.'}
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
    shadowColor: '#FFD700',
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
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  signTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'serif',
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  glowEffect: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  scorpioImage: {
    width: 110,
    height: 110,
  },
  cardFooter: {
    marginTop: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
    fontWeight: '400',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  actionPrompt: {
    marginTop: 2,
  },
  actionText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default HoroscopeCard;

