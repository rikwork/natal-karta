import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet, Platform } from 'react-native';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  isReady?: boolean;
  onComplete?: () => void;
  text?: string;
  subText?: string;
  fontsLoaded?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isReady = false,
  onComplete,
  text = 'Идёт расчёт',
  subText = 'Создаём вашу натальную карту...',
  fontsLoaded = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const starsAnim = useRef(new Animated.Value(0)).current;
  const starsTwinkle = useRef(new Animated.Value(0)).current;
  const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);

  useEffect(() => {
    // Анимация пульсации текста - рекурсивная
    const startPulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) startPulse();
      });
    };

    // Анимация звезд - рекурсивная
    const startStars = () => {
      starsAnim.setValue(0);
      Animated.timing(starsAnim, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) startStars();
      });
    };

    // Анимация мерцания звезд - рекурсивная
    const startTwinkle = () => {
      Animated.sequence([
        Animated.timing(starsTwinkle, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(starsTwinkle, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) startTwinkle();
      });
    };

    // Анимация появления текста
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Запуск анимаций
    startPulse();
    startStars();
    startTwinkle();

    // Минимальное время анимации для UX (например, 2.5 секунды)
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2500);

    return () => {
      pulseAnim.stopAnimation();
      starsTwinkle.stopAnimation();
      starsAnim.stopAnimation();
      clearTimeout(timer);
    };
  }, [pulseAnim, starsAnim, starsTwinkle, textOpacity]);

  // Завершаем экран, как только готовы данные И прошло мин. время
  useEffect(() => {
    if (isReady && minTimeElapsed && onComplete) {
      onComplete();
    }
  }, [isReady, minTimeElapsed, onComplete]);

  const renderStars = () => {
    const stars = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height * 0.6,
      size: Math.random() * 2 + 1, // Уменьшили размер
      baseOpacity: Math.random() * 0.6 + 0.3, // Уменьшили прозрачность
    }));

    return (
      <View style={styles.starsContainer}>
        {stars.map((star) => {
          const twinkleOpacity = starsTwinkle.interpolate({
            inputRange: [0, 1],
            outputRange: [star.baseOpacity, star.baseOpacity * 1.5],
          });

          return (
            <Animated.View
              key={star.id}
              style={[
                styles.star,
                {
                  left: star.x,
                  top: star.y,
                  width: star.size,
                  height: star.size,
                  opacity: twinkleOpacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const headingFont = fontsLoaded
    ? theme.fonts.heading
    : Platform.OS === 'ios'
      ? 'Georgia'
      : 'serif';
  const bodyFont = fontsLoaded ? theme.fonts.body : Platform.OS === 'ios' ? 'System' : 'sans-serif';

  return (
    <View style={styles.container}>
      {renderStars()}

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={[styles.loadingText, { fontFamily: headingFont }]}>{text}</Text>
          <Text style={[styles.subText, { fontFamily: bodyFont }]}>{subText}</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 32,
    color: '#F0E6D2',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  subText: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 30,
    fontStyle: 'italic',
  },
});

export default LoadingScreen;
