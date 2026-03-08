import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const TarotCard: React.FC = () => {
  return (
    <TouchableOpacity style={styles.tarotCardWrapper} activeOpacity={1}>
      <BlurView intensity={40} tint="dark" style={styles.glassCard}>
        <LinearGradient
          colors={['rgba(157,101,255,0.15)', 'transparent'] as const}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.cardHeader}>
          <Text style={styles.cardSmallTitle}>КАРТА ДНЯ:</Text>
          <Text style={styles.tarotTitle}>ЗВЕЗДА</Text>
        </View>

        <View style={styles.tarotImageContainer}>
          <Image
            source={require('../../../../assets/images/tarot_placeholder.png')}
            style={styles.tarotImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)'] as const}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.tarotFooter}>
          <Text style={styles.tarotStatus}>Звезда (Прямое)</Text>
          <Text style={styles.tarotDesc} numberOfLines={2}>
            Надежда, вдохновение, обновление. День исцеления и ясности.
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
    fontSize: 20,
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

export default TarotCard;
