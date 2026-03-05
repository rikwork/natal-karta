import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Linking,
  Image,
  ImageBackground,
  Platform,
  BackHandler,
  PanResponder,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import ApiService from '../services/api';
import { City } from '../types';
import AstralDatePicker from '../components/AstralDatePicker';
import ZodiacWheel from '../components/ZodiacWheel';

const { width } = Dimensions.get('window');

// Debounce функция для оптимизации поиска
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Функция для определения знака зодиака
const getZodiacSign = (month: number, day: number) => {
  const signs = [
    { name: 'Козерог', emoji: '♑', start: [12, 22], end: [1, 19] },
    { name: 'Водолей', emoji: '♒', start: [1, 20], end: [2, 18] },
    { name: 'Рыбы', emoji: '♓', start: [2, 19], end: [3, 20] },
    { name: 'Овен', emoji: '♈', start: [3, 21], end: [4, 19] },
    { name: 'Телец', emoji: '♉', start: [4, 20], end: [5, 20] },
    { name: 'Близнецы', emoji: '♊', start: [5, 21], end: [6, 20] },
    { name: 'Рак', emoji: '♋', start: [6, 21], end: [7, 22] },
    { name: 'Лев', emoji: '♌', start: [7, 23], end: [8, 22] },
    { name: 'Дева', emoji: '♍', start: [8, 23], end: [9, 22] },
    { name: 'Весы', emoji: '♎', start: [9, 23], end: [10, 22] },
    { name: 'Скорпион', emoji: '♏', start: [10, 23], end: [11, 21] },
    { name: 'Стрелец', emoji: '♐', start: [11, 22], end: [12, 21] },
  ];

  for (const sign of signs) {
    const [startMonth, startDay] = sign.start;
    const [endMonth, endDay] = sign.end;

    if (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay) ||
      (startMonth > endMonth && (month > startMonth || month < endMonth))
    ) {
      return sign;
    }
  }
  return signs[0]; // Fallback
};

// Транслитерацию убрали по требованию — поиск только по GeoNames

interface OnboardingScreenProps {
  onComplete: (data: {
    name: string;
    gender: 'male' | 'female' | 'other';
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    latitude: string;
    longitude: string;
  }) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    latitude: '',
    longitude: '',
  });

  const [fadeAnim] = useState(new Animated.Value(1));
  const [selectedDate, setSelectedDate] = useState({
    day: 1,
    month: 1,
    year: 1991,
  });
  const [selectedTime, setSelectedTime] = useState({
    hour: 12,
    minute: 0,
  });
  const [citySearch, setCitySearch] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [showCityList, setShowCityList] = useState(false);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);

  const spinValue = useRef(new Animated.Value(0)).current;

  const startAnimation = useCallback(() => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 60000,
      easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web',
    }).start(({ finished }) => {
      if (finished) {
        startAnimation();
      }
    });
  }, [spinValue]);

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Refs для ScrollView
  const dayScrollRef = useRef<ScrollView>(null);
  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);
  const hourScrollRef = useRef<any>(null); // Any for Animated.ScrollView
  const minuteScrollRef = useRef<any>(null);
  const hourScrollY = useRef(new Animated.Value(0)).current;
  const minuteScrollY = useRef(new Animated.Value(0)).current;

  // Ref для доступа к актуальному обработчику смахивания назад
  const handlePrevRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    handlePrevRef.current = () => {
      if (currentStep > 0) {
        animateFade();
        setCurrentStep(currentStep - 1);
      }
    };
  }, [currentStep]);

  useEffect(() => {
    const backAction = () => {
      if (currentStep > 0) {
        if (handlePrevRef.current) handlePrevRef.current();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [currentStep]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return gestureState.dx > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50 && gestureState.vx > 0.5) {
          if (handlePrevRef.current) handlePrevRef.current();
        }
      },
    }),
  ).current;

  // Debounced поиск городов через OpenStreetMap API
  const searchCities = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.length < 2) {
          setFilteredCities([]);
          setShowCityList(false);
          return;
        }

        setIsSearchingCities(true);
        try {
          // Язык по раскладке: латиница -> en, кириллица -> ru. Без транслита
          const primaryLang = /[A-Za-z]/.test(query) ? 'en' : 'ru';
          const response = await ApiService.searchCities(query, primaryLang);

          // В ApiService response.data содержит массив городов напрямую (или null при ошибке)
          // Но бэкенд возвращает { data: [...], message: "..." }
          // Глядя на ApiService.request: он возвращает data (который и есть { data: ..., message: ... })
          const cities = (response as any).data || [];

          if (cities && cities.length) {
            setFilteredCities(cities);
            setShowCityList(true);
          } else {
            setFilteredCities([]);
            setShowCityList(false);
          }
        } catch (_error) {
          // Ошибка уже обработана в ApiService
          setFilteredCities([]);
          setShowCityList(false);
        } finally {
          setIsSearchingCities(false);
        }
      }, 300), // 300ms задержка
    [],
  );

  // Выбор города — без мерцания: сначала fade, потом коллапс списка
  const selectCity = (city: City) => {
    setCitySearch(`${city.name}, ${city.country}`);
    setFormData((prev) => ({
      ...prev,
      birthPlace: `${city.name}, ${city.country}`,
      latitude: city.latitude.toString(),
      longitude: city.longitude.toString(),
    }));

    // Сначала запускаем fade-out, только ПОСЛЕ его завершения скрываем список.
    // Это предотвращает двойной layout-shift (коллапс FlatList + fade одновременно).
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowCityList(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const steps = [
    {
      id: 'name',
      title: 'Как тебя зовут?',
      subtitle: 'Это поможет персонализировать твою натальную карту',
    },
    { id: 'gender', title: 'Твой пол', subtitle: 'Важно для точного расчета' },
    {
      id: 'birthDate',
      title: 'Когда вы родились?',
      subtitle:
        'Введите вашу точную дату рождения для раскрытия\nвашего уникального космического чертежа.',
    },
    {
      id: 'birthTime',
      title: 'Время рождения',
      subtitle: 'Точное время очень важно для астрологии',
    },
    { id: 'birthPlace', title: 'Место рождения', subtitle: 'Город, где ты родился' },
  ];

  const animateFade = (callback?: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (callback) callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Сохраняем дату в formData при переходе с экрана даты
      if (currentStep === 2) {
        const dateString = `${selectedDate.day.toString().padStart(2, '0')}.${selectedDate.month.toString().padStart(2, '0')}.${selectedDate.year}`;
        setFormData({ ...formData, birthDate: dateString });
      }
      // Сохраняем время в formData при переходе с экрана времени
      if (currentStep === 3) {
        const timeString = `${selectedTime.hour.toString().padStart(2, '0')}:${selectedTime.minute.toString().padStart(2, '0')}`;
        setFormData({ ...formData, birthTime: timeString });
      }
      animateFade(() => setCurrentStep(currentStep + 1));
    } else {
      // Все данные заполнены, завершаем онбординг
      onComplete(formData as any);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      animateFade(() => setCurrentStep(currentStep - 1));
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim().length > 0 && legalAccepted;
      case 1:
        return formData.gender !== '';
      case 2:
        return selectedDate.day > 0 && selectedDate.month > 0 && selectedDate.year > 0;
      case 3:
        return (
          selectedTime.hour >= 0 &&
          selectedTime.hour <= 23 &&
          selectedTime.minute >= 0 &&
          selectedTime.minute <= 59
        );
      case 4:
        return (
          formData.birthPlace.trim().length > 0 &&
          formData.latitude !== '' &&
          formData.longitude !== ''
        );
      default:
        return false;
    }
  };

  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <TextInput
        style={styles.textInput}
        placeholder="Введи своё имя"
        placeholderTextColor="rgba(255,255,255,0.6)"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        autoFocus
      />
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setLegalAccepted(!legalAccepted)}
      >
        <View style={[styles.checkbox, legalAccepted && styles.checkboxSelected]}>
          {legalAccepted && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>
          Я принимаю{' '}
          <Text
            style={[styles.checkboxLabel, styles.linkText]}
            onPress={() => Linking.openURL('https://example.com/terms')}
          >
            Пользовательское соглашение
          </Text>{' '}
          и{' '}
          <Text
            style={[styles.checkboxLabel, styles.linkText]}
            onPress={() => Linking.openURL('https://example.com/privacy')}
          >
            Политику конфиденциальности
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderGenderStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.genderContainer}>
        {[
          { key: 'male', label: 'Мужской', emoji: '♂' },
          { key: 'female', label: 'Женский', emoji: '♀' },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.genderOption,
              formData.gender === option.key && styles.genderOptionSelected,
            ]}
            onPress={() => setFormData({ ...formData, gender: option.key as any })}
          >
            <Text style={styles.genderEmoji}>{option.emoji}</Text>
            <Text style={styles.genderLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBirthDateStep = () => {
    // Generate data matching the AstralDatePicker expectations
    const days = Array.from({ length: 31 }, (_, i) => ({
      label: String(i + 1).padStart(2, '0'),
      value: i + 1,
    }));

    const months = [
      { value: 1, label: 'Январь' },
      { value: 2, label: 'Февраль' },
      { value: 3, label: 'Март' },
      { value: 4, label: 'Апрель' },
      { value: 5, label: 'Май' },
      { value: 6, label: 'Июнь' },
      { value: 7, label: 'Июль' },
      { value: 8, label: 'Август' },
      { value: 9, label: 'Сентябрь' },
      { value: 10, label: 'Октябрь' },
      { value: 11, label: 'Ноябрь' },
      { value: 12, label: 'Декабрь' },
    ];

    const years = Array.from({ length: 125 }, (_, i) => ({
      label: String(2024 - i),
      value: 2024 - i,
    }));

    return (
      <View style={[styles.stepContainer, { alignItems: 'center' }]}>
        <AstralDatePicker
          days={days}
          months={months}
          years={years}
          selectedDay={selectedDate.day}
          selectedMonth={selectedDate.month}
          selectedYear={selectedDate.year}
          onDateChange={(type, value) => {
            setSelectedDate((prev) => ({ ...prev, [type]: value }));
          }}
        />
      </View>
    );
  };

  const renderBirthTimeStep = () => {
    // Генерируем данные для селекторов времени
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const itemHeight = 50;
    const containerHeight = 200;

    return (
      <View style={styles.stepContainer}>
        {/* Селекторы времени */}
        <BlurView intensity={20} tint="dark" style={styles.dateSelectorsContainerWrapper}>
          <View style={styles.timeSelectorsContainer}>
            <View style={styles.timeSelector}>
              <Text style={styles.timeSelectorLabel}>Час</Text>
              <BlurView
                intensity={30}
                tint="dark"
                style={[styles.timeScrollContainer, { height: containerHeight }]}
              >
                {/* Верхний градиент */}
                <LinearGradient
                  colors={['rgba(5,5,10,0.8)', 'rgba(5,5,10,0)']}
                  style={styles.gradientTop}
                  pointerEvents="none"
                />

                {/* Полосы выбора - верхняя и нижняя */}
                <View
                  style={[
                    styles.selectionLinesContainer,
                    { top: (containerHeight - itemHeight) / 2, height: itemHeight },
                  ]}
                  pointerEvents="none"
                >
                  <View style={styles.selectionLineTop} />
                  <View style={styles.selectionLineBottom} />
                </View>

                <Animated.ScrollView
                  ref={hourScrollRef}
                  style={[
                    styles.timeScrollView,
                    Platform.OS === 'web'
                      ? ({ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' } as any)
                      : {},
                  ]}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={[
                    styles.scrollContent,
                    { paddingVertical: (containerHeight - itemHeight) / 2 },
                  ]}
                  decelerationRate="fast"
                  snapToInterval={itemHeight}
                  snapToAlignment="start"
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: hourScrollY } } }],
                    {
                      useNativeDriver: false,
                      listener: (event: any) => {
                        const y = event.nativeEvent.contentOffset.y;
                        const index = Math.round(y / itemHeight);
                        const hour = hours[index];
                        if (hour !== undefined && selectedTime.hour !== hour) {
                          setSelectedTime((prev) => ({ ...prev, hour }));
                        }
                      },
                    },
                  )}
                  scrollEventThrottle={16}
                  onMomentumScrollEnd={(event: any) => {
                    if (Platform.OS === 'web') return;
                    const y = event.nativeEvent.contentOffset.y;
                    const index = Math.round(y / itemHeight);
                    const hour = hours[index];
                    if (hour !== undefined) {
                      setSelectedTime((prev) => ({ ...prev, hour }));
                    }
                    hourScrollRef.current?.scrollTo({ y: index * itemHeight, animated: true });
                  }}
                  onScrollEndDrag={(event: any) => {
                    if (Platform.OS === 'web') return;
                    const y = event.nativeEvent.contentOffset.y;
                    const index = Math.round(y / itemHeight);
                    hourScrollRef.current?.scrollTo({ y: index * itemHeight, animated: true });
                  }}
                >
                  {hours.map((hour, index) => {
                    const itemPosition = index * itemHeight;
                    const scale = hourScrollY.interpolate({
                      inputRange: [
                        itemPosition - itemHeight,
                        itemPosition,
                        itemPosition + itemHeight,
                      ],
                      outputRange: [0.7, 1.2, 0.7],
                      extrapolate: 'clamp',
                    });
                    const opacity = hourScrollY.interpolate({
                      inputRange: [
                        itemPosition - itemHeight,
                        itemPosition,
                        itemPosition + itemHeight,
                      ],
                      outputRange: [0.3, 1, 0.3],
                      extrapolate: 'clamp',
                    });
                    const color = hourScrollY.interpolate({
                      inputRange: [
                        itemPosition - itemHeight,
                        itemPosition,
                        itemPosition + itemHeight,
                      ],
                      outputRange: [
                        'rgba(255, 255, 255, 1)',
                        'rgba(255, 215, 0, 1)',
                        'rgba(255, 255, 255, 1)',
                      ],
                      extrapolate: 'clamp',
                    });
                    const textShadowRadius = hourScrollY.interpolate({
                      inputRange: [
                        itemPosition - itemHeight,
                        itemPosition,
                        itemPosition + itemHeight,
                      ],
                      outputRange: [0, 10, 0],
                      extrapolate: 'clamp',
                    });

                    return (
                      <View
                        key={hour}
                        style={[
                          styles.timeOption,
                          { height: itemHeight },
                          Platform.OS === 'web' ? ({ scrollSnapAlign: 'center' } as any) : {},
                        ]}
                      >
                        <Animated.Text
                          style={[
                            styles.timeOptionText,
                            {
                              opacity,
                              transform: [{ scale }],
                              color,
                              textShadowColor: 'rgba(255, 215, 0, 1)',
                              textShadowRadius,
                              fontWeight: 'bold',
                            },
                          ]}
                        >
                          {hour.toString().padStart(2, '0')}
                        </Animated.Text>
                      </View>
                    );
                  })}
                </Animated.ScrollView>

                {/* Нижний градиент */}
                <LinearGradient
                  colors={['rgba(5,5,10,0)', 'rgba(5,5,10,0.8)']}
                  style={styles.gradientBottom}
                  pointerEvents="none"
                />
              </BlurView>
            </View>

            <View style={styles.timeDivider}>
              <Text style={styles.timeDividerText}>:</Text>
            </View>

            <View style={styles.timeSelector}>
              <Text style={styles.timeSelectorLabel}>Минуты</Text>
              <BlurView
                intensity={30}
                tint="dark"
                style={[styles.timeScrollContainer, { height: containerHeight }]}
              >
                {/* Верхний градиент */}
                <LinearGradient
                  colors={['rgba(5,5,10,0.8)', 'rgba(5,5,10,0)']}
                  style={styles.gradientTop}
                  pointerEvents="none"
                />

                {/* Полосы выбора - верхняя и нижняя */}
                <View
                  style={[
                    styles.selectionLinesContainer,
                    { top: (containerHeight - itemHeight) / 2, height: itemHeight },
                  ]}
                  pointerEvents="none"
                >
                  <View style={styles.selectionLineTop} />
                  <View style={styles.selectionLineBottom} />
                </View>

                <Animated.ScrollView
                  ref={minuteScrollRef}
                  style={[
                    styles.timeScrollView,
                    Platform.OS === 'web'
                      ? ({ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' } as any)
                      : {},
                  ]}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={[
                    styles.scrollContent,
                    { paddingVertical: (containerHeight - itemHeight) / 2 },
                  ]}
                  decelerationRate="fast"
                  snapToInterval={itemHeight}
                  snapToAlignment="start"
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: minuteScrollY } } }],
                    {
                      useNativeDriver: false,
                      listener: (event: any) => {
                        const y = event.nativeEvent.contentOffset.y;
                        const index = Math.round(y / itemHeight);
                        const minute = minutes[index];
                        if (minute !== undefined && selectedTime.minute !== minute) {
                          setSelectedTime((prev) => ({ ...prev, minute }));
                        }
                      },
                    },
                  )}
                  scrollEventThrottle={16}
                  onMomentumScrollEnd={(event: any) => {
                    if (Platform.OS === 'web') return;
                    const y = event.nativeEvent.contentOffset.y;
                    const index = Math.round(y / itemHeight);
                    const minute = minutes[index];
                    if (minute !== undefined) {
                      setSelectedTime((prev) => ({ ...prev, minute }));
                    }
                    minuteScrollRef.current?.scrollTo({ y: index * itemHeight, animated: true });
                  }}
                  onScrollEndDrag={(event: any) => {
                    if (Platform.OS === 'web') return;
                    const y = event.nativeEvent.contentOffset.y;
                    const index = Math.round(y / itemHeight);
                    minuteScrollRef.current?.scrollTo({ y: index * itemHeight, animated: true });
                  }}
                >
                  {minutes.map((minute, index) => {
                    const itemPosition = index * itemHeight;
                    const scale = minuteScrollY.interpolate({
                      inputRange: [
                        itemPosition - itemHeight,
                        itemPosition,
                        itemPosition + itemHeight,
                      ],
                      outputRange: [0.7, 1.2, 0.7],
                      extrapolate: 'clamp',
                    });
                    const opacity = minuteScrollY.interpolate({
                      inputRange: [
                        itemPosition - itemHeight,
                        itemPosition,
                        itemPosition + itemHeight,
                      ],
                      outputRange: [0.3, 1, 0.3],
                      extrapolate: 'clamp',
                    });
                    const color = minuteScrollY.interpolate({
                      inputRange: [
                        itemPosition - itemHeight,
                        itemPosition,
                        itemPosition + itemHeight,
                      ],
                      outputRange: [
                        'rgba(255, 255, 255, 1)',
                        'rgba(255, 215, 0, 1)',
                        'rgba(255, 255, 255, 1)',
                      ],
                      extrapolate: 'clamp',
                    });
                    const textShadowRadius = minuteScrollY.interpolate({
                      inputRange: [
                        itemPosition - itemHeight,
                        itemPosition,
                        itemPosition + itemHeight,
                      ],
                      outputRange: [0, 10, 0],
                      extrapolate: 'clamp',
                    });

                    return (
                      <View
                        key={minute}
                        style={[
                          styles.timeOption,
                          { height: itemHeight },
                          Platform.OS === 'web' ? ({ scrollSnapAlign: 'center' } as any) : {},
                        ]}
                      >
                        <Animated.Text
                          style={[
                            styles.timeOptionText,
                            {
                              opacity,
                              transform: [{ scale }],
                              color,
                              textShadowColor: 'rgba(255, 215, 0, 1)',
                              textShadowRadius,
                              fontWeight: 'bold',
                            },
                          ]}
                        >
                          {minute.toString().padStart(2, '0')}
                        </Animated.Text>
                      </View>
                    );
                  })}
                </Animated.ScrollView>

                {/* Нижний градиент */}
                <LinearGradient
                  colors={['rgba(5,5,10,0)', 'rgba(5,5,10,0.8)']}
                  style={styles.gradientBottom}
                  pointerEvents="none"
                />
              </BlurView>
            </View>
          </View>
        </BlurView>
      </View>
    );
  };

  const renderBirthPlaceStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.citySearchContainer}>
        <TextInput
          style={styles.citySearchInput}
          placeholder="Начните вводить название города"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={citySearch}
          onChangeText={(text) => {
            setCitySearch(text);
            searchCities(text);
          }}
          onFocus={() => {
            if (citySearch.length >= 2) {
              setShowCityList(true);
            }
          }}
        />

        {isSearchingCities && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFD700" />
            <Text style={styles.loadingText}>Поиск городов...</Text>
          </View>
        )}

        {showCityList && filteredCities.length > 0 && (
          <View style={styles.cityListContainer}>
            <FlatList
              data={filteredCities}
              keyExtractor={(item, index) => `${item.name}-${item.country}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.cityItem} onPress={() => selectCity(item)}>
                  <Text style={styles.cityName}>{item.name}</Text>
                  <Text style={styles.cityCountry}>{item.country}</Text>
                  {item.admin_name1 && <Text style={styles.cityRegion}>{item.admin_name1}</Text>}
                </TouchableOpacity>
              )}
              style={styles.cityList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </View>

      <Text style={styles.hintText}>Выберите город из списка</Text>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderNameStep();
      case 1:
        return renderGenderStep();
      case 2:
        return renderBirthDateStep();
      case 3:
        return renderBirthTimeStep();
      case 4:
        return renderBirthPlaceStep();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Image
        source={{
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj_EyvNiJnWwHl1dT647d1neMGhn5cHPcdBqtFAaPHr5a3vZPbeQsnldExCo95wjhuFikQNLEPPNQ77lxA_H5DNylgzwV8zytGuSeNJcDdx_f-BuvafKAUoX30eogMG_oqc9kMsoPewi37YTSA8VvlJg5Os5pEDndnE3DI2SAbUqDACWl0EuLQzJh97D24G7oGQVTZe1dh3iNVIjvEzRIGKQAiOAYlYNataspz6w-xpQygLXXHhdMQE5r39xlZwfrnyLdEl6SwXTTs',
        }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(5, 5, 20, 0.6)' }]} />

      {/* Кнопка "Назад" в левом верхнем углу */}
      {currentStep > 0 && (
        <TouchableOpacity style={styles.topBackButton} onPress={handlePrev} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        <View style={styles.dotsProgressContainer}>
          <View style={styles.progressLine} />
          <View style={styles.dotsRow}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentStep === index ? styles.activeDot : styles.inactiveDot,
                  currentStep === index && styles.activeDotGlow,
                ]}
              />
            ))}
          </View>
        </View>
        <Text style={styles.stepCounterText}>
          {currentStep + 1} из {steps.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Контент экрана */}
        <Animated.View style={[styles.stepWrapper, { opacity: fadeAnim }]}>
          <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
          <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>

          <View style={{ flex: 1, width: '100%', position: 'relative' }}>
            {currentStep >= 2 && (
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  { alignItems: 'center', justifyContent: 'center', zIndex: -1 },
                ]}
                pointerEvents="none"
              >
                <ZodiacWheel spin={spin} />
              </View>
            )}
            {renderStepContent()}
          </View>
        </Animated.View>

        {/* Навигация */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.nextButtonWrapper, !isStepValid() && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!isStepValid()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#9D50BB', '#FFD700']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextButtonOuter}
            >
              <LinearGradient
                colors={['#1a0b2e', '#411d73']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.nextButtonInner}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === steps.length - 1 ? 'Завершить' : 'Continue'}
                </Text>
              </LinearGradient>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    alignItems: 'center',
    marginBottom: 20,
  },
  topBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 45,
    left: 15,
    zIndex: 100,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsProgressContainer: {
    width: 140,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inactiveDot: {
    backgroundColor: '#666',
  },
  activeDot: {
    backgroundColor: '#FFD700',
    width: 12,
    height: 12,
    marginTop: -2,
    borderRadius: 6,
  },
  activeDotGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  stepCounterText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    letterSpacing: 3,
    marginTop: 8,
    fontWeight: '300',
  },
  stepWrapper: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '500',
    fontFamily: 'serif',
    color: '#F0E6D2', // Muted cream
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    zIndex: 100,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 30,
    zIndex: 100,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    color: '#ffffff',
    borderWidth: 1,
    borderBottomWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    marginBottom: 10,
    textAlign: 'center',
  },
  hintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  genderOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 15, 40, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.15)',
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  genderOptionSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  genderEmoji: {
    fontSize: 50,
    marginBottom: 12,
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  genderLabel: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'serif',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  navigationContainer: {
    marginTop: 40,
    gap: 15,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  backButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButtonWrapper: {
    height: 56,
    borderRadius: 28,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  nextButtonOuter: {
    flex: 1,
    borderRadius: 28,
    padding: 1.5,
  },
  nextButtonInner: {
    flex: 1,
    borderRadius: 26.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
  },
  nextButtonText: {
    color: '#F0E6D2',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'serif',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  // Стили для знака зодиака
  zodiacContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  zodiacEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  zodiacName: {
    fontSize: 24,
    fontWeight: '400',
    fontFamily: 'serif',
    color: '#FFD700',
  },
  // Стили для селекторов даты
  dateSelectorsContainerWrapper: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
    padding: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  dateSelectorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateSelector: {
    flex: 1,
    alignItems: 'center',
  },
  dateSelectorLabel: {
    color: 'rgba(255, 215, 0, 0.7)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  dateScrollContainer: {
    position: 'relative',
    width: '100%',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
    overflow: 'hidden',
  },
  dateScrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  dateOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateOptionText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
  },
  // Градиенты
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 10,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    zIndex: 10,
  },
  // Полосы выбора
  selectionLinesContainer: {
    position: 'absolute',
    left: 10,
    right: 10,
    zIndex: 5,
  },
  selectionLineTop: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 2,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  selectionLineBottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 2,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  // Стили для селектора времени
  timeSelectorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  timeSelector: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 120,
  },
  timeSelectorLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  timeScrollContainer: {
    position: 'relative',
    width: '100%',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  timeScrollView: {
    flex: 1,
    width: '100%',
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeOptionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '400',
  },
  timeDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    paddingTop: 30,
  },
  timeDividerText: {
    color: '#FFD700',
    fontSize: 32,
    fontWeight: '400',
    fontFamily: 'serif',
  },
  // Стили для автодополнения городов
  citySearchContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  citySearchInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginLeft: 8,
  },
  cityListContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26,26,46,0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    maxHeight: 200,
    zIndex: 1001,
  },
  cityList: {
    maxHeight: 200,
  },
  cityItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  cityName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  cityCountry: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  cityRegion: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  checkboxSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  checkmark: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  linkText: {
    color: '#FFD700',
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;
