import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const starsAnim = useRef(new Animated.Value(0)).current;
  const starsTwinkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Анимация пульсации текста - более мягкая
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05, // Уменьшили с 1.1 до 1.05
          duration: 2000, // Увеличили с 1000 до 2000
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000, // Увеличили с 1000 до 2000
          useNativeDriver: true,
        }),
      ]),
    );

    // Анимация появления текста - более плавная
    const textAnimation = Animated.timing(textOpacity, {
      toValue: 1,
      duration: 1500, // Увеличили с 1000 до 1500
      useNativeDriver: true,
    });

    // Анимация звезд - медленнее
    const starsAnimation = Animated.loop(
      Animated.timing(starsAnim, {
        toValue: 1,
        duration: 12000, // Увеличили с 4000 до 12000
        useNativeDriver: true,
      }),
    );

    // Анимация мерцания звезд
    const starsTwinkleAnimation = Animated.loop(
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
      ]),
    );

    // Запуск анимаций
    pulseAnimation.start();
    textAnimation.start();
    starsAnimation.start();
    starsTwinkleAnimation.start();

    // Завершение через 5 секунд
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      pulseAnimation.stop();
      starsTwinkleAnimation.stop();
      clearTimeout(timer);
    };
  }, [onComplete, pulseAnim, starsAnim, starsTwinkle, textOpacity]);

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
          <Text style={styles.loadingText}>Идёт расчёт</Text>
          <Text style={styles.subText}>Создаём вашу натальную карту...</Text>
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
    fontWeight: '500',
    fontFamily: 'serif',
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
