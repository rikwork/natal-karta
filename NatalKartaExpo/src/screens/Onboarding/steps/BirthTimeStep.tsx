import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BirthTimeStepProps {
  selectedTime: {
    hour: number;
    minute: number;
  };
  onTimeChange: (time: { hour: number; minute: number }) => void;
}

const BirthTimeStep: React.FC<BirthTimeStepProps> = ({ selectedTime, onTimeChange }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const itemHeight = 50;
  const containerHeight = 200;

  const hourScrollY = useRef(new Animated.Value(selectedTime.hour * itemHeight)).current;
  const minuteScrollY = useRef(new Animated.Value(selectedTime.minute * itemHeight)).current;

  const hourScrollRef = useRef<any>(null);
  const minuteScrollRef = useRef<any>(null);

  const renderTimePicker = (
    data: number[],
    scrollY: Animated.Value,
    ref: React.RefObject<any>,
    label: string,
    currentValue: number,
    onValueChange: (val: number) => void,
  ) => {
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

          <Animated.ScrollView
            ref={ref}
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
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
              useNativeDriver: false,
              listener: (event: any) => {
                const y = event.nativeEvent.contentOffset.y;
                const index = Math.round(y / itemHeight);
                const val = data[index];
                if (val !== undefined && currentValue !== val) {
                  onValueChange(val);
                }
              },
            })}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event: any) => {
              if (Platform.OS === 'web') return;
              const y = event.nativeEvent.contentOffset.y;
              const index = Math.round(y / itemHeight);
              const val = data[index];
              if (val !== undefined) {
                onValueChange(val);
              }
              ref.current?.scrollTo({ y: index * itemHeight, animated: true });
            }}
            onScrollEndDrag={(event: any) => {
              if (Platform.OS === 'web') return;
              const y = event.nativeEvent.contentOffset.y;
              const index = Math.round(y / itemHeight);
              ref.current?.scrollTo({ y: index * itemHeight, animated: true });
            }}
            contentOffset={{ x: 0, y: currentValue * itemHeight }}
          >
            {data.map((val, index) => {
              const itemPosition = index * itemHeight;
              const scale = scrollY.interpolate({
                inputRange: [itemPosition - itemHeight, itemPosition, itemPosition + itemHeight],
                outputRange: [0.7, 1.2, 0.7],
                extrapolate: 'clamp',
              });
              const opacity = scrollY.interpolate({
                inputRange: [itemPosition - itemHeight, itemPosition, itemPosition + itemHeight],
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              const color = scrollY.interpolate({
                inputRange: [itemPosition - itemHeight, itemPosition, itemPosition + itemHeight],
                outputRange: [
                  'rgba(255, 255, 255, 1)',
                  'rgba(255, 215, 0, 1)',
                  'rgba(255, 255, 255, 1)',
                ],
                extrapolate: 'clamp',
              });
              const textShadowRadius = scrollY.interpolate({
                inputRange: [itemPosition - itemHeight, itemPosition, itemPosition + itemHeight],
                outputRange: [0, 10, 0],
                extrapolate: 'clamp',
              });

              return (
                <View
                  key={val}
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
                    {val.toString().padStart(2, '0')}
                  </Animated.Text>
                </View>
              );
            })}
          </Animated.ScrollView>

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
    <View style={styles.stepContainer}>
      <View style={styles.dateSelectorsContainerWrapper}>
        <View style={styles.timeSelectorsContainer}>
          {renderTimePicker(hours, hourScrollY, hourScrollRef, 'Час', selectedTime.hour, (hour) =>
            onTimeChange({ ...selectedTime, hour }),
          )}

          <View style={styles.timeDivider}>
            <Text style={styles.timeDividerText}>:</Text>
          </View>

          {renderTimePicker(
            minutes,
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
    fontWeight: '400',
    fontFamily: 'serif',
  },
});

export default BirthTimeStep;
