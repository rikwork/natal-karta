import React from 'react';
import { StyleSheet, Animated, useWindowDimensions, Platform } from 'react-native';

const ZODIAC_RING = require('../../assets/images/zodiac_transparent.png');

interface ZodiacWheelProps {
  spin: Animated.AnimatedInterpolation<string | number>;
  opacity?: number;
}

const ZodiacWheel: React.FC<ZodiacWheelProps> = ({ spin, opacity = 0.6 }) => {
  const { width } = useWindowDimensions();
  const wheelSize = width * 1.2;

  return (
    <Animated.Image
      source={ZODIAC_RING}
      style={[
        styles.wheelImage,
        {
          width: wheelSize,
          height: wheelSize,
          opacity: opacity,
          transform: [{ rotate: spin }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  wheelImage: {
    position: 'absolute',
    opacity: 0.6,
    zIndex: -1,
    backgroundColor: 'transparent',
  },
});

export default ZodiacWheel;
