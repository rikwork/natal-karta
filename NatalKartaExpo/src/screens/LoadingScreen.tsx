import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const wheelRotation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const starsAnim = useRef(new Animated.Value(0)).current;
  const starsTwinkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Анимация вращения колеса - медленнее и плавнее
    const wheelAnimation = Animated.loop(
      Animated.timing(wheelRotation, {
        toValue: 1,
        duration: 8000, // Увеличили с 3000 до 8000
        useNativeDriver: true,
      })
    );

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
      ])
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
      })
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
      ])
    );

    // Запуск анимаций
    wheelAnimation.start();
    pulseAnimation.start();
    textAnimation.start();
    starsAnimation.start();
    starsTwinkleAnimation.start();

    // Завершение через 5 секунд
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      wheelAnimation.stop();
      pulseAnimation.stop();
      starsTwinkleAnimation.stop();
      clearTimeout(timer);
    };
  }, [onComplete]);

  const wheelRotationInterpolate = wheelRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const starsRotationInterpolate = starsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderWheel = () => {
    const houses = [
      { number: 1, name: 'I', angle: 0 },
      { number: 2, name: 'II', angle: 30 },
      { number: 3, name: 'III', angle: 60 },
      { number: 4, name: 'IV', angle: 90 },
      { number: 5, name: 'V', angle: 120 },
      { number: 6, name: 'VI', angle: 150 },
      { number: 7, name: 'VII', angle: 180 },
      { number: 8, name: 'VIII', angle: 210 },
      { number: 9, name: 'IX', angle: 240 },
      { number: 10, name: 'X', angle: 270 },
      { number: 11, name: 'XI', angle: 300 },
      { number: 12, name: 'XII', angle: 330 },
    ];

    return (
      <View style={styles.wheelContainer}>
        <Animated.View
          style={[
            styles.wheel,
            { transform: [{ rotate: wheelRotationInterpolate }] }
          ]}
        >
          {houses.map((house, index) => (
            <View
              key={house.number}
              style={[
                styles.house,
                {
                  transform: [
                    { rotate: `${house.angle}deg` },
                    { translateY: -70 }
                  ]
                }
              ]}
            >
              <Text style={styles.houseNumber}>{house.number}</Text>
              <Text style={styles.houseName}>{house.name}</Text>
            </View>
          ))}
        </Animated.View>
        
        {/* Центральная точка */}
        <View style={styles.centerPoint} />
      </View>
    );
  };

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
                }
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      {renderStars()}
      
      <View style={styles.content}>
        {renderWheel()}
        
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <Text style={styles.loadingText}>Идёт расчёт</Text>
          <Text style={styles.subText}>Создаём вашу натальную карту...</Text>
        </Animated.View>
      </View>
    </LinearGradient>
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
  wheelContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  wheel: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  house: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  houseNumber: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: 'bold',
  },
  houseName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  centerPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff6b6b',
    top: '50%',
    left: '50%',
    marginTop: -4,
    marginLeft: -4,
  },
  textContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textShadowColor: 'rgba(255,107,107,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default LoadingScreen;
