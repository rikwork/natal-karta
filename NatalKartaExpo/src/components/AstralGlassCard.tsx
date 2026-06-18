import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface AstralGlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const AstralGlassCard: React.FC<AstralGlassCardProps> = ({ children, style }) => {
  return (
    <BlurView intensity={40} tint="dark" style={[styles.card, style]}>
      <LinearGradient
        colors={['rgba(157, 101, 255, 0.08)', 'transparent'] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(157, 101, 255, 0.25)',
    backgroundColor: 'rgba(15, 14, 23, 0.4)',
  },
});

export default AstralGlassCard;
