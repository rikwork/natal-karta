import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface AstralTimePickerProps {
  selectedTime: {
    hour: number;
    minute: number;
  };
  onTimeChange: (time: { hour: number; minute: number }) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TimePickerItemProps {
  val: number;
  index: number;
  itemHeight: number;
  scrollY: Animated.Value;
}

// Мемоизированный элемент выбора времени, предотвращающий пересоздание интерполяций
const TimePickerItemComponent: React.FC<TimePickerItemProps> = ({ val, index, itemHeight, scrollY }) => {
  const itemPosition = index * itemHeight;
  const scale = scrollY.interpolate({
    inputRange: [itemPosition - itemHeight, itemPosition, itemPosition + itemHeight],
    outputRange: [0.7, 1.2, 0.7],
    extrapolate: 'clamp',
  });
  const whiteOpacity = scrollY.interpolate({
    inputRange: [
      itemPosition - itemHeight,
      itemPosition - itemHeight * 0.5,
      itemPosition,
      itemPosition + itemHeight * 0.5,
      itemPosition + itemHeight,
    ],
    outputRange: [0.4, 0.4, 0, 0.4, 0.4],
    extrapolate: 'clamp',
  });
  const goldOpacity = scrollY.interpolate({
    inputRange: [
      itemPosition - itemHeight,
      itemPosition - itemHeight * 0.5,
      itemPosition,
      itemPosition + itemHeight * 0.5,
      itemPosition + itemHeight,
    ],
    outputRange: [0, 0, 1, 0, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      style={[
        styles.timeOption,
        { height: itemHeight },
        Platform.OS === 'web' ? ({ scrollSnapAlign: 'center' } as any) : {},
      ]}
    >
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        {/* White inactive layer */}
        <Animated.Text
          style={[
            styles.timeOptionText,
            {
              opacity: whiteOpacity,
              transform: [{ scale }],
              color: '#FFFFFF',
              fontWeight: 'bold',
            },
          ]}
        >
          {val.toString().padStart(2, '0')}
        </Animated.Text>

        {/* Gold active layer */}
        <Animated.Text
          style={[
            styles.timeOptionText,
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
          {val.toString().padStart(2, '0')}
        </Animated.Text>
      </View>
    </View>
  );
};

const TimePickerItem = React.memo(
  TimePickerItemComponent,
  (prevProps, nextProps) =>
    prevProps.val === nextProps.val &&
    prevProps.index === nextProps.index &&
    prevProps.itemHeight === nextProps.itemHeight &&
    prevProps.scrollY === nextProps.scrollY
);

export const AstralTimePicker: React.FC<AstralTimePickerProps> = ({
  selectedTime,
  onTimeChange,
}) => {
  const itemHeight = 50;
  const containerHeight = 200;

  const hourScrollY = useRef(new Animated.Value(selectedTime.hour * itemHeight)).current;
  const minuteScrollY = useRef(new Animated.Value(selectedTime.minute * itemHeight)).current;

  const hourScrollRef = useRef<FlatList>(null);
  const minuteScrollRef = useRef<FlatList>(null);

  const lastScrolledHour = useRef<number | null>(null);
  const lastScrolledMinute = useRef<number | null>(null);

  const hourScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minuteScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isHourScrolling = useRef(false);
  const isMinuteScrolling = useRef(false);

  const ignoreHourPropUpdates = useRef(false);
  const ignoreMinutePropUpdates = useRef(false);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (hourScrollTimeoutRef.current) clearTimeout(hourScrollTimeoutRef.current);
      if (minuteScrollTimeoutRef.current) clearTimeout(minuteScrollTimeoutRef.current);
    };
  }, []);

  // Synchronize scroll position when time changes from parent
  useEffect(() => {
    if (selectedTime.hour === lastScrolledHour.current) {
      ignoreHourPropUpdates.current = false;
    }
    if (selectedTime.minute === lastScrolledMinute.current) {
      ignoreMinutePropUpdates.current = false;
    }

    const scrollToTime = () => {
      if (
        hourScrollRef.current &&
        selectedTime.hour !== lastScrolledHour.current &&
        !isHourScrolling.current &&
        !ignoreHourPropUpdates.current
      ) {
        hourScrollRef.current.scrollToOffset({
          offset: selectedTime.hour * itemHeight,
          animated: false,
        });
        lastScrolledHour.current = selectedTime.hour;
      }
      if (
        minuteScrollRef.current &&
        selectedTime.minute !== lastScrolledMinute.current &&
        !isMinuteScrolling.current &&
        !ignoreMinutePropUpdates.current
      ) {
        minuteScrollRef.current.scrollToOffset({
          offset: selectedTime.minute * itemHeight,
          animated: false,
        });
        lastScrolledMinute.current = selectedTime.minute;
      }
    };

    const timer = setTimeout(scrollToTime, 50);
    return () => clearTimeout(timer);
  }, [selectedTime.hour, selectedTime.minute]);

  const renderTimePicker = (
    data: number[],
    scrollY: Animated.Value,
    ref: React.RefObject<any>,
    label: string,
    currentValue: number,
    onValueChange: (val: number) => void,
  ) => {
    const isScrollingRef = label === 'Час' ? isHourScrolling : isMinuteScrolling;
    const ignorePropUpdatesRef = label === 'Час' ? ignoreHourPropUpdates : ignoreMinutePropUpdates;

    return (
      <View style={styles.timeSelector}>
        <Text style={styles.timeSelectorLabel}>{label}</Text>
        <View style={[styles.timeScrollContainer, { height: containerHeight }]}>
          <LinearGradient
            colors={['rgba(5,5,10,0.8)', 'rgba(5,5,10,0)']}
            style={styles.gradientTop}
            pointerEvents="none"
          />

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

          <Animated.FlatList
            ref={ref}
            data={data}
            keyExtractor={(item) => String(item)}
            renderItem={({ item, index }) => (
              <TimePickerItem val={item} index={index} itemHeight={itemHeight} scrollY={scrollY} />
            )}
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
            onScrollBeginDrag={() => {
              isScrollingRef.current = true;
              ignorePropUpdatesRef.current = true;
            }}
            onMomentumScrollBegin={() => {
              isScrollingRef.current = true;
              ignorePropUpdatesRef.current = true;
            }}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
              useNativeDriver: true,
              listener: (event: any) => {
                const y = event.nativeEvent.contentOffset.y;
                const index = Math.round(y / itemHeight);
                const val = data[index];
                if (val !== undefined) {
                  if (Platform.OS === 'web') {
                    isScrollingRef.current = true;
                    ignorePropUpdatesRef.current = true;
                    const timeoutRef = label === 'Час' ? hourScrollTimeoutRef : minuteScrollTimeoutRef;
                    if (timeoutRef.current) {
                      clearTimeout(timeoutRef.current);
                    }
                    timeoutRef.current = setTimeout(() => {
                      if (label === 'Час') {
                        lastScrolledHour.current = val;
                      } else {
                        lastScrolledMinute.current = val;
                      }
                      isScrollingRef.current = false;
                      onValueChange(val);
                    }, 150);
                  }
                }
              },
            })}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event: any) => {
              isScrollingRef.current = false;
              if (Platform.OS === 'web') return;
              const y = event.nativeEvent.contentOffset.y;
              const index = Math.round(y / itemHeight);
              const val = data[index];
              if (val !== undefined) {
                if (label === 'Час') {
                  lastScrolledHour.current = val;
                } else {
                  lastScrolledMinute.current = val;
                }
                ignorePropUpdatesRef.current = true;
                onValueChange(val);
              }
              const difference = Math.abs(y - index * itemHeight);
              if (difference > 1) {
                ref.current?.scrollToOffset({ offset: index * itemHeight, animated: true });
              }
            }}
            onScrollEndDrag={(event: any) => {
              if (Platform.OS === 'web') return;
              const velocityY = event.nativeEvent.velocity?.y;
              // If there is velocity, momentum scroll will handle the end of scrolling.
              if (velocityY && Math.abs(velocityY) > 0.01) {
                return;
              }
              isScrollingRef.current = false;
              const y = event.nativeEvent.contentOffset.y;
              const index = Math.round(y / itemHeight);
              const val = data[index];
              if (val !== undefined) {
                if (label === 'Час') {
                  lastScrolledHour.current = val;
                } else {
                  lastScrolledMinute.current = val;
                }
                ignorePropUpdatesRef.current = true;
                onValueChange(val);
              }
              const difference = Math.abs(y - index * itemHeight);
              if (difference > 1) {
                ref.current?.scrollToOffset({ offset: index * itemHeight, animated: true });
              }
            }}
            getItemLayout={(_, index) => ({
              length: itemHeight,
              offset: itemHeight * index,
              index,
            })}
            windowSize={5}
            initialNumToRender={8}
            maxToRenderPerBatch={5}
            removeClippedSubviews={Platform.OS !== 'web'}
          />

          <LinearGradient
            colors={['rgba(5,5,10,0)', 'rgba(5,5,10,0.8)']}
            style={styles.gradientBottom}
            pointerEvents="none"
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.stepContainer, { width: SCREEN_WIDTH * 0.9, alignSelf: 'center' }]}>
      <View style={styles.dateSelectorsContainerWrapper}>
        <View style={styles.timeSelectorsContainer}>
          {renderTimePicker(HOURS, hourScrollY, hourScrollRef, 'Час', selectedTime.hour, (hour) =>
            onTimeChange({ ...selectedTime, hour }),
          )}

          <View style={styles.timeDivider}>
            <Text style={styles.timeDividerText}>:</Text>
          </View>

          {renderTimePicker(
            MINUTES,
            minuteScrollY,
            minuteScrollRef,
            'Минуты',
            selectedTime.minute,
            (minute) => onTimeChange({ ...selectedTime, minute }),
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dateSelectorsContainerWrapper: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    padding: 16,
  },
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
  scrollContent: {
    paddingHorizontal: 8,
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
  timeDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
  },
  timeDividerText: {
    color: '#FFD700',
    fontSize: 32,
    fontFamily: theme.fonts.heading,
  },
});
