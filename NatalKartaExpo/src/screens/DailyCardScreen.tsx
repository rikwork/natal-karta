import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
  Vibration,
  BackHandler,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tarotImages } from '../constants/tarotImages';
import tarotData from '../constants/tarotDescriptions.json';
import AstralButton from '../components/AstralButton';
import AstralSwipeBack from '../components/AstralSwipeBack';

const { width, height } = Dimensions.get('window');

interface DailyCardScreenProps {
  cardId: number;
  onClose: () => void;
  isMale: boolean;
}

const DailyCardScreen: React.FC<DailyCardScreenProps> = ({ cardId, onClose, isMale }) => {
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;

  const cardInfo = tarotData.find((c) => c.id === cardId);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const checkOpenedToday = async () => {
      try {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const savedDate = await AsyncStorage.getItem('daily_card_opened_date');
        if (savedDate === todayStr) {
          setFlipped(true);
          flipAnim.setValue(1);
          contentFadeAnim.setValue(1);
        }
      } catch (err) {
        console.error('Error reading daily card open state:', err);
      }
    };
    checkOpenedToday();
  }, [fadeAnim, contentFadeAnim, flipAnim]);

  useEffect(() => {
    const backAction = () => {
      onClose();
      return true; // Intercept gesture / button press
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onClose]);

  const handleFlip = () => {
    if (flipped) return;

    Vibration.vibrate([0, 10, 50, 10]);

    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start(async () => {
      setFlipped(true);
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      try {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        await AsyncStorage.setItem('daily_card_opened_date', todayStr);
      } catch (err) {
        console.error('Error saving daily card open state:', err);
      }
    });
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5001, 1],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5001, 1],
    outputRange: [0, 0, 1, 1],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
    opacity: frontOpacity,
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
    opacity: backOpacity,
  };

  const cardTranslateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.15, 0],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill}>
        <AstralSwipeBack onSwipeBack={onClose}>
          <LinearGradient
            colors={['rgba(10, 10, 35, 0.4)', 'rgba(25, 10, 50, 0.5)'] as const}
            style={StyleSheet.absoluteFill}
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Animated.View
            style={[styles.cardWrapper, { transform: [{ translateY: cardTranslateY }] }]}
          >
            <TouchableOpacity activeOpacity={1} onPress={handleFlip}>
              <View style={styles.flipCard}>
                {/* Back side (visible initially) */}
                <Animated.View style={[styles.cardSide, styles.cardBack, frontAnimatedStyle]}>
                  <Image source={tarotImages.default} style={styles.fullImage} resizeMode="cover" />
                  <LinearGradient
                    colors={['rgba(157,101,255,0.2)', 'transparent'] as const}
                    style={StyleSheet.absoluteFill}
                  />
                  {!flipped && (
                    <View style={styles.revealHint}>
                      <Text style={styles.revealHintText}>Нажми, чтобы открыть</Text>
                    </View>
                  )}
                </Animated.View>

                {/* Front side (revealed) */}
                <Animated.View style={[styles.cardSide, styles.cardFront, backAnimatedStyle]}>
                  <Image
                    source={cardId ? tarotImages[cardId] : tarotImages.default}
                    style={styles.fullImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)'] as const}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.cardLabelContainer}>
                    <Text style={styles.cardNameLabel}>{cardInfo?.name.toUpperCase()}</Text>
                  </View>
                </Animated.View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {flipped && (
            <Animated.ScrollView
              style={[styles.contentScroll, { opacity: contentFadeAnim }]}
              contentContainerStyle={styles.scrollContent}
            >
              <Text style={styles.cardName}>{cardInfo?.name}</Text>

              <View style={styles.descriptionBox}>
                <Text style={styles.sectionTitle}>ПРЕДСКАЗАНИЕ:</Text>
                <Text style={styles.descriptionText}>
                  {isMale ? cardInfo?.description_male : cardInfo?.description_female}
                </Text>
              </View>

              <AstralButton title="ПРИНЯТЬ" onPress={onClose} style={styles.fineButton} />
              <View style={{ height: 40 }} />
            </Animated.ScrollView>
          )}
        </AstralSwipeBack>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1010,
  },
  closeText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '300',
  },
  cardWrapper: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipCard: {
    width: width * 0.7,
    height: width * 0.7 * 1.6,
    borderRadius: 24,
  },
  cardSide: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(157,101,255,0.4)',
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    backgroundColor: '#1A1A2E',
  },
  cardBack: {
    zIndex: 2,
  },
  cardFront: {
    zIndex: 1,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  revealHint: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  revealHintText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(157,101,255,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardLabelContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cardNameLabel: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  contentScroll: {
    flex: 1,
    marginTop: 20,
  },
  scrollContent: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  cardName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F0E6D2',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardKeywords: {
    fontSize: 14,
    color: '#9D65FF',
    fontStyle: 'italic',
    marginBottom: 25,
    textAlign: 'center',
    letterSpacing: 1,
  },
  descriptionBox: {
    width: '100%',
    backgroundColor: 'rgba(20, 15, 38, 0.75)',
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(157, 101, 255, 0.25)',
    shadowColor: '#9D65FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  adviceBox: {
    width: '100%',
    backgroundColor: 'rgba(255,215,0,0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 10,
    letterSpacing: 2,
  },
  descriptionText: {
    fontSize: 16,
    color: '#F0E6D2',
    lineHeight: 24,
  },
  adviceText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    lineHeight: 24,
  },
  fineButton: {
    width: '100%',
    marginTop: 15,
    marginBottom: 10,
  },
});

export default DailyCardScreen;
