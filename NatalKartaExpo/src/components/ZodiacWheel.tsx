import React from 'react';
import { StyleSheet, Animated, Dimensions, View } from 'react-native';

const ZODIAC_RING = require('../../assets/images/zodiac_transparent.png');

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 1.2;

interface ZodiacWheelProps {
  spin: Animated.AnimatedInterpolation<string | number>;
  opacity?: number;
  pulseAnim?: Animated.Value;
}

const ZodiacWheel: React.FC<ZodiacWheelProps> = ({ spin, opacity = 0.6, pulseAnim }) => {
  // Анимации для "Звездного импульса"
  const pulseScale = pulseAnim
    ? pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.15],
      })
    : 1;

  const pulseOpacity = pulseAnim
    ? pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.2, 0.7],
      })
    : 0;

  return (
    <View style={styles.container}>
      {/* Слой свечения (Stellar Impulse) */}
      {pulseAnim && (
        <Animated.Image
          source={ZODIAC_RING}
          style={[
            styles.wheelImage,
            {
              width: WHEEL_SIZE,
              height: WHEEL_SIZE,
              opacity: pulseOpacity,
              transform: [{ rotate: spin }, { scale: pulseScale }],
              tintColor: '#FFD700', // Золотистое свечение
            },
          ]}
        />
      )}

      {/* Основное колесо */}
      <Animated.Image
        source={ZODIAC_RING}
        style={[
          styles.wheelImage,
          {
            width: WHEEL_SIZE,
            height: WHEEL_SIZE,
            opacity: opacity,
            transform: [{ rotate: spin }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelImage: {
    position: 'absolute',
    zIndex: -1,
    backgroundColor: 'transparent',
  },
});

export default React.memo(ZodiacWheel);
