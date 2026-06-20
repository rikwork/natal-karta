import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface FadeScreenProps {
  children: React.ReactNode;
  active: boolean;
}

const FadeScreen: React.FC<FadeScreenProps> = ({ children, active }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [active, fadeAnim]);

  if (!active) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>{children}</Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default FadeScreen;
