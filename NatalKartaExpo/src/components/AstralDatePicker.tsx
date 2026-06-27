import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, FlatList, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

export interface PickerItem {
  label: string;
  value: number;
}

const CURRENT_YEAR = new Date().getFullYear();

const ASTRAL_DAYS = Array.from({ length: 31 }, (_, i) => ({
  label: String(i + 1).padStart(2, '0'),
  value: i + 1,
}));

const ASTRAL_MONTHS = [
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

const ASTRAL_YEARS = Array.from({ length: 125 }, (_, i) => ({
  label: String(CURRENT_YEAR - i),
  value: CURRENT_YEAR - i,
}));

export const getAstralDatePickerData = () => {
  return { days: ASTRAL_DAYS, months: ASTRAL_MONTHS, years: ASTRAL_YEARS };
};

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DatePickerItemProps {
  item: PickerItem;
  index: number;
  scrollY: Animated.Value;
}

// Мемоизированная строка списка выбора даты, предотвращающая перевычисление интерполяций
const DatePickerItemComponent: React.FC<DatePickerItemProps> = ({ item, index, scrollY }) => {
  if (item.value === -1) {
    return <View style={styles.itemContainer} />;
  }

  const itemPosition = (index - 2) * ITEM_HEIGHT;

  const scale = scrollY.interpolate({
    inputRange: [itemPosition - ITEM_HEIGHT, itemPosition, itemPosition + ITEM_HEIGHT],
    outputRange: [0.7, 1.2, 0.7],
    extrapolate: 'clamp',
  });

  const whiteOpacity = scrollY.interpolate({
    inputRange: [
      itemPosition - ITEM_HEIGHT,
      itemPosition - ITEM_HEIGHT * 0.5,
      itemPosition,
      itemPosition + ITEM_HEIGHT * 0.5,
      itemPosition + ITEM_HEIGHT,
    ],
    outputRange: [0.3, 0.3, 0, 0.3, 0.3],
    extrapolate: 'clamp',
  });

  const goldOpacity = scrollY.interpolate({
    inputRange: [
      itemPosition - ITEM_HEIGHT,
      itemPosition - ITEM_HEIGHT * 0.5,
      itemPosition,
      itemPosition + ITEM_HEIGHT * 0.5,
      itemPosition + ITEM_HEIGHT,
    ],
    outputRange: [0, 0, 1, 0, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        styles.itemContainer,
        Platform.OS === 'web' ? ({ scrollSnapAlign: 'center' } as any) : {},
      ]}
    >
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        {/* White inactive layer */}
        <Animated.Text
          style={[
            styles.itemText,
            {
              opacity: whiteOpacity,
              transform: [{ scale }],
              color: '#FFFFFF',
              fontWeight: 'bold',
            },
          ]}
        >
          {item.label}
        </Animated.Text>

        {/* Gold active layer */}
        <Animated.Text
          style={[
            styles.itemText,
            {
              position: 'absolute',
              opacity: goldOpacity,
              transform: [{ scale }],
              color: '#FFD700',
              textShadowColor: 'rgba(255, 215, 0, 0.8)',
              textShadowRadius: 10,
              fontWeight: 'bold',
            },
          ]}
        >
          {item.label}
        </Animated.Text>
      </View>
    </View>
  );
};

const DatePickerItem = React.memo(
  DatePickerItemComponent,
  (prevProps, nextProps) =>
    prevProps.item.value === nextProps.item.value &&
    prevProps.index === nextProps.index &&
    prevProps.scrollY === nextProps.scrollY,
);

const PickerList: React.FC<{
  data: PickerItem[];
  selectedValue: number;
  type: 'day' | 'month' | 'year';
  onDateChange: (type: 'day' | 'month' | 'year', value: number) => void;
}> = ({ data, selectedValue, type, onDateChange }) => {
  const initialIndex = data.findIndex((item) => item.value === selectedValue);

  const paddedData = [
    { label: '', value: -1 },
    { label: '', value: -1 },
    ...data,
    { label: '', value: -1 },
    { label: '', value: -1 },
  ];

  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(initialIndex * ITEM_HEIGHT)).current;
  const lastScrolledValue = useRef<number | null>(null);
  const webScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrolling = useRef(false);
  const currentActiveIndex = useRef(initialIndex >= 0 ? initialIndex : 0);
  const ignorePropUpdates = useRef(false);

  // Clear timeout on unmount
  React.useEffect(() => {
    return () => {
      if (webScrollTimeoutRef.current) {
        clearTimeout(webScrollTimeoutRef.current);
      }
    };
  }, []);

  // Synchronize scroll position when date changes from parent (e.g. initial render in modal)
  React.useEffect(() => {
    if (selectedValue === lastScrolledValue.current) {
      ignorePropUpdates.current = false;
      return;
    }

    if (ignorePropUpdates.current) {
      return;
    }

    const scrollToValue = () => {
      if (isScrolling.current) return; // Skip synchronizing if actively scrolling this wheel
      const index = data.findIndex((item) => item.value === selectedValue);
      if (index >= 0) {
        flatListRef.current?.scrollToOffset({
          offset: index * ITEM_HEIGHT,
          animated: false,
        });
        lastScrolledValue.current = selectedValue;
        currentActiveIndex.current = index;
      }
    };

    const timer = setTimeout(scrollToValue, 50); // small delay is enough when animated is false
    return () => clearTimeout(timer);
  }, [selectedValue, data]);

  const snapToNearest = (event: any) => {
    if (Platform.OS === 'web') return;
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);

    if (index >= 0 && index < data.length) {
      lastScrolledValue.current = data[index].value;
      currentActiveIndex.current = index;
      ignorePropUpdates.current = true;
      onDateChange(type, data[index].value);
    }

    const difference = Math.abs(y - index * ITEM_HEIGHT);
    if (difference > 1) {
      flatListRef.current?.scrollToOffset({ offset: index * ITEM_HEIGHT, animated: true });
    }
  };

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
    listener: (event: any) => {
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);

      if (index >= 0 && index < data.length) {
        if (Platform.OS === 'web') {
          isScrolling.current = true;
          ignorePropUpdates.current = true;
          currentActiveIndex.current = index;
          if (webScrollTimeoutRef.current) {
            clearTimeout(webScrollTimeoutRef.current);
          }
          webScrollTimeoutRef.current = setTimeout(() => {
            const val = data[index].value;
            lastScrolledValue.current = val;
            isScrolling.current = false;
            onDateChange(type, val);
          }, 150);
        }
      }
    },
  });

  const renderItem = useCallback(
    ({ item, index }: { item: PickerItem; index: number }) => (
      <DatePickerItem item={item} index={index} scrollY={scrollY} />
    ),
    [scrollY],
  );

  return (
    <View style={styles.listWrapper}>
      <Animated.FlatList
        ref={flatListRef}
        showsVerticalScrollIndicator={false}
        style={
          Platform.OS === 'web'
            ? ({ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' } as any)
            : {}
        }
        data={paddedData}
        keyExtractor={(_, index) => `${type}-${index}`}
        renderItem={renderItem}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onScrollBeginDrag={() => {
          isScrolling.current = true;
          ignorePropUpdates.current = true;
        }}
        onMomentumScrollBegin={() => {
          isScrolling.current = true;
          ignorePropUpdates.current = true;
        }}
        onMomentumScrollEnd={(event) => {
          isScrolling.current = false;
          snapToNearest(event);
        }}
        onScrollEndDrag={(event) => {
          if (Platform.OS === 'web') return;
          const velocityY = event.nativeEvent.velocity?.y;
          // If there is velocity, momentum scroll will start next, so we let onMomentumScrollEnd handle the snap.
          if (velocityY && Math.abs(velocityY) > 0.01) {
            return;
          }
          isScrolling.current = false;
          snapToNearest(event);
        }}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        windowSize={5}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        removeClippedSubviews={Platform.OS !== 'web'}
      />
    </View>
  );
};

interface AstralDatePickerProps {
  days: PickerItem[];
  months: PickerItem[];
  years: PickerItem[];
  selectedDay: number;
  selectedMonth: number;
  selectedYear: number;
  onDateChange: (type: 'day' | 'month' | 'year', value: number) => void;
}

const AstralDatePicker: React.FC<AstralDatePickerProps> = ({
  days,
  months,
  years,
  selectedDay,
  selectedMonth,
  selectedYear,
  onDateChange,
}) => {
  return (
    <View style={[styles.container, { width: SCREEN_WIDTH * 0.95 }]}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>День</Text>
        <Text style={styles.headerText}>Месяц</Text>
        <Text style={styles.headerText}>Год</Text>
      </View>

      <View style={styles.pickerContainer}>
        {/* Gold Highlight Bar */}
        <View style={styles.selectionLinesContainer} pointerEvents="none">
          <View style={styles.selectionLineTop} />
          <View style={styles.selectionLineBottom} />
        </View>

        <LinearGradient
          colors={['rgba(5, 5, 20, 0.3)', 'rgba(5, 5, 20, 0)']}
          style={styles.gradientTop}
          pointerEvents="none"
        />

        <View style={styles.listsContainer}>
          <PickerList
            data={days}
            selectedValue={selectedDay}
            type="day"
            onDateChange={onDateChange}
          />
          <PickerList
            data={months}
            selectedValue={selectedMonth}
            type="month"
            onDateChange={onDateChange}
          />
          <PickerList
            data={years}
            selectedValue={selectedYear}
            type="year"
            onDateChange={onDateChange}
          />
        </View>

        <LinearGradient
          colors={['rgba(5, 5, 20, 0)', 'rgba(5, 5, 20, 0.3)']}
          style={styles.gradientBottom}
          pointerEvents="none"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 240,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  headerContainer: {
    position: 'absolute',
    top: 10,
    flexDirection: 'row',
    width: '90%',
    zIndex: 30,
  },
  headerText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    textAlign: 'center',
    flex: 1,
    letterSpacing: 2,
    opacity: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    height: CONTAINER_HEIGHT,
    width: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  listsContainer: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
  },
  listWrapper: {
    flex: 1,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: theme.fonts.body,
    opacity: 0.3,
  },
  selectedItemText: {
    color: '#FFD700',
    fontSize: 28,
    fontFamily: theme.fonts.heading,
    opacity: 1,
    textShadowColor: 'rgba(255, 215, 0, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 1.8,
    zIndex: 10,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 1.8,
    zIndex: 10,
  },
  selectionLinesContainer: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    width: '100%',
    height: ITEM_HEIGHT,
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
});

export default AstralDatePicker;
