import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  FlatList,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PickerItem {
  label: string;
  value: number;
}

interface AstralDatePickerProps {
  days: PickerItem[];
  months: PickerItem[];
  years: PickerItem[];
  selectedDay: number;
  selectedMonth: number;
  selectedYear: number;
  onDateChange: (type: 'day' | 'month' | 'year', value: number) => void;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const PickerList: React.FC<{
  data: PickerItem[];
  selectedValue: number;
  type: 'day' | 'month' | 'year';
  onDateChange: (type: 'day' | 'month' | 'year', value: number) => void;
}> = ({ data, selectedValue, type, onDateChange }) => {
  const initialIndex = data.findIndex((item) => item.value === selectedValue);
  const [activeIndex, setActiveIndex] = React.useState(initialIndex >= 0 ? initialIndex : 0);

  const paddedData = [
    { label: '', value: -1 },
    { label: '', value: -1 },
    ...data,
    { label: '', value: -1 },
    { label: '', value: -1 },
  ];

  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(initialIndex * ITEM_HEIGHT)).current;

  const snapToNearest = (event: any) => {
    if (Platform.OS === 'web') return;
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);

    if (index >= 0 && index < data.length) {
      setActiveIndex(index);
      onDateChange(type, data[index].value);
    }

    flatListRef.current?.scrollToOffset({ offset: index * ITEM_HEIGHT, animated: true });
  };

  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
    listener: (event: any) => {
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);

      if (index !== activeIndex && index >= 0 && index < data.length) {
        setActiveIndex(index);
        onDateChange(type, data[index].value);
      }
    },
  });

  const renderItem = ({ item, index }: { item: PickerItem; index: number }) => {
    const itemPosition = (index - 2) * ITEM_HEIGHT;

    const scale = scrollY.interpolate({
      inputRange: [itemPosition - ITEM_HEIGHT, itemPosition, itemPosition + ITEM_HEIGHT],
      outputRange: [0.7, 1.2, 0.7],
      extrapolate: 'clamp',
    });

    const opacity = scrollY.interpolate({
      inputRange: [itemPosition - ITEM_HEIGHT, itemPosition, itemPosition + ITEM_HEIGHT],
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    const color = scrollY.interpolate({
      inputRange: [itemPosition - ITEM_HEIGHT, itemPosition, itemPosition + ITEM_HEIGHT],
      outputRange: ['rgba(255, 255, 255, 1)', 'rgba(255, 215, 0, 1)', 'rgba(255, 255, 255, 1)'],
      extrapolate: 'clamp',
    });

    const textShadowRadius = scrollY.interpolate({
      inputRange: [itemPosition - ITEM_HEIGHT, itemPosition, itemPosition + ITEM_HEIGHT],
      outputRange: [0, 10, 0],
      extrapolate: 'clamp',
    });

    return (
      <View
        style={[
          styles.itemContainer,
          Platform.OS === 'web' ? ({ scrollSnapAlign: 'center' } as any) : {},
        ]}
      >
        <Animated.Text
          style={[
            styles.itemText,
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
          {item.label}
        </Animated.Text>
      </View>
    );
  };

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
        onMomentumScrollEnd={snapToNearest}
        onScrollEndDrag={snapToNearest}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
      />
    </View>
  );
};

const AstralDatePicker: React.FC<AstralDatePickerProps> = ({
  days,
  months,
  years,
  selectedDay,
  selectedMonth,
  selectedYear,
  onDateChange,
}) => {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width: width * 0.95 }]}>
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
    fontFamily: 'serif',
    textAlign: 'center',
    flex: 1,
    letterSpacing: 2,
    opacity: 1,
    fontWeight: '600',
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
    fontFamily: 'sans-serif',
    opacity: 0.3,
  },
  selectedItemText: {
    color: '#FFD700',
    fontSize: 28,
    fontFamily: 'serif',
    fontWeight: 'bold',
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
