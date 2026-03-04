import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface ResultScreenProps {
  result: {
    sun: string;
    moon: string;
    ascendant?: string;
  };
  onContinue: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ result, onContinue }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Анимация появления
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getZodiacEmoji = (sign: string) => {
    const emojiMap: { [key: string]: string } = {
      'Овен': '♈',
      'Телец': '♉',
      'Близнецы': '♊',
      'Рак': '♋',
      'Лев': '♌',
      'Дева': '♍',
      'Весы': '♎',
      'Скорпион': '♏',
      'Стрелец': '♐',
      'Козерог': '♑',
      'Водолей': '♒',
      'Рыбы': '♓',
    };
    return emojiMap[sign] || '✨';
  };

  const getZodiacColor = (sign: string) => {
    const colorMap: { [key: string]: string } = {
      'Овен': '#ff6b6b',
      'Телец': '#4ecdc4',
      'Близнецы': '#45b7d1',
      'Рак': '#96ceb4',
      'Лев': '#feca57',
      'Дева': '#ff9ff3',
      'Весы': '#54a0ff',
      'Скорпион': '#5f27cd',
      'Стрелец': '#00d2d3',
      'Козерог': '#ff9f43',
      'Водолей': '#0abde3',
      'Рыбы': '#a55eea',
    };
    return colorMap[sign] || '#ff6b6b';
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {/* Заголовок */}
        <Text style={styles.title}>Твоя натальная карта готова!</Text>
        
        {/* Результат */}
        <View style={styles.resultContainer}>
          <View style={styles.resultCard}>
            <View style={styles.planetRow}>
              <Text style={styles.planetEmoji}>☀️</Text>
              <Text style={styles.planetText}>Солнце в</Text>
              <View style={[styles.signContainer, { borderColor: getZodiacColor(result.sun) }]}>
                <Text style={styles.signEmoji}>{getZodiacEmoji(result.sun)}</Text>
                <Text style={[styles.signText, { color: getZodiacColor(result.sun) }]}>
                  {result.sun}
                </Text>
              </View>
            </View>

            <View style={styles.planetRow}>
              <Text style={styles.planetEmoji}>🌙</Text>
              <Text style={styles.planetText}>Луна в</Text>
              <View style={[styles.signContainer, { borderColor: getZodiacColor(result.moon) }]}>
                <Text style={styles.signEmoji}>{getZodiacEmoji(result.moon)}</Text>
                <Text style={[styles.signText, { color: getZodiacColor(result.moon) }]}>
                  {result.moon}
                </Text>
              </View>
            </View>

            {result.ascendant && (
              <View style={styles.planetRow}>
                <Text style={styles.planetEmoji}>⬆️</Text>
                <Text style={styles.planetText}>Асцендент в</Text>
                <View style={[styles.signContainer, { borderColor: getZodiacColor(result.ascendant) }]}>
                  <Text style={styles.signEmoji}>{getZodiacEmoji(result.ascendant)}</Text>
                  <Text style={[styles.signText, { color: getZodiacColor(result.ascendant) }]}>
                    {result.ascendant}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Описание */}
        <Text style={styles.description}>
          Это основа твоей астрологической личности. 
          Теперь ты можешь узнать больше о себе и своём будущем.
        </Text>

        {/* Кнопка продолжения */}
        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <LinearGradient
            colors={['#ff6b6b', '#ee5a52']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Продолжить</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 40,
  },
  resultContainer: {
    width: '100%',
    marginBottom: 40,
  },
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  planetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  planetEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  planetText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginRight: 12,
  },
  signContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
  },
  signEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  signText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  continueButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ResultScreen;
