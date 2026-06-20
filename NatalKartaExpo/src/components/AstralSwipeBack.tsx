import React, { useRef } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';

interface AstralSwipeBackProps {
  children: React.ReactNode;
  onSwipeBack?: () => void;
  enabled?: boolean;
}

const AstralSwipeBack: React.FC<AstralSwipeBackProps> = ({
  children,
  onSwipeBack,
  enabled = true,
}) => {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!enabled || !onSwipeBack) return false;

        const { dx, dy } = gestureState;

        // Ensure the gesture is horizontal (width is at least 1.5x height of swipe)
        // and exceeds a threshold (20px) to prevent accidental triggers on slight micro-drags
        const isHorizontalSwipe = Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy) * 1.5;

        return isHorizontalSwipe;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!onSwipeBack) return;

        const { dx, vx } = gestureState;

        // Determine if velocity and distance are sufficient to trigger back navigation
        // Threshold: 50px distance, 0.3 velocity
        // We support both swipe left (dx < 0) and swipe right (dx > 0)
        // to handle the user's specific request (swipe left) and the platform convention (swipe right).
        if (Math.abs(dx) > 50 && Math.abs(vx) > 0.3) {
          onSwipeBack();
        }
      },
      onPanResponderTerminate: () => {},
      onShouldBlockNativeResponder: () => true,
    }),
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AstralSwipeBack;
