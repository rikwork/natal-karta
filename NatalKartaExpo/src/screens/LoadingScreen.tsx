import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  Image,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
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
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj_EyvNiJnWwHl1dT647d1neMGhn5cHPcdBqtFAaPHr5a3vZPbeQsnldExCo95wjhuFikQNLEPPNQ77lxA_H5DNylgzwV8zytGuSeNJcDdx_f-BuvafKAUoX30eogMG_oqc9kMsoPewi37YTSA8VvlJg5Os5pEDndnE3DI2SAbUqDACWl0EuLQzJh97D24G7oGQVTZe1dh3iNVIjvEzRIGKQAiOAYlYNataspz6w-xpQygLXXHhdMQE5r39xlZwfrnyLdEl6SwXTTs' }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(5, 5, 20, 0.6)' }]} />

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
  wheelContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  wheel: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  house: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  houseNumber: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  houseName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  centerPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
    top: '50%',
    left: '50%',
    marginTop: -5,
    marginLeft: -5,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
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
