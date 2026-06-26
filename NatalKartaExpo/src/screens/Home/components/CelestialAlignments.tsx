import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, NativeSyntheticEvent, NativeScrollEvent, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../../theme';

const ALIGNMENTS_DATA = [
  {
    id: 'mercury',
    title: 'Меркурий ретроградный',
    subtitle: 'осталось 4 дня',
    icon: '☿',
    gradientColors: ['rgba(255,107,107,0.1)', 'transparent'],
    iconBorderColor: 'rgba(255,107,107,0.3)',
  },
  {
    id: 'fullmoon',
    title: 'Полнолуние в Тельце',
    subtitle: '15 ноября',
    icon: '🌕',
    gradientColors: ['rgba(255,215,0,0.1)', 'transparent'],
    iconBorderColor: 'rgba(255,215,0,0.2)',
  },
  {
    id: 'saturn',
    title: 'Сатурн в Рыбах',
    subtitle: 'Активно',
    icon: '🪐',
    gradientColors: ['rgba(78,205,196,0.1)', 'transparent'],
    iconBorderColor: 'rgba(78,205,196,0.2)',
  },
];

const DATA = [...ALIGNMENTS_DATA, ...ALIGNMENTS_DATA, ...ALIGNMENTS_DATA];
const GAP = 15;

const CelestialAlignments: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeIndexRef = useRef(3); // Start in middle copy (index 3)

  const screenWidth = Dimensions.get('window').width;
  const [widths, setWidths] = useState<number[]>([0, 0, 0]);
  const [hasInitializedScroll, setHasInitializedScroll] = useState(false);

  const handleLayout = (index: number, w: number) => {
    // Only measure widths for the first 3 items to avoid infinite state updates
    if (index >= ALIGNMENTS_DATA.length) return;

    setWidths((prev) => {
      if (prev[index] === w) return prev;
      const next = [...prev];
      next[index] = w;
      return next;
    });
  };

  const isMeasured = widths.every((w) => w > 0);

  const { snapOffsets, paddingLeft, paddingRight } = useMemo(() => {
    let offsets: number[] = [];
    let pLeft = 25;
    let pRight = 25;

    if (isMeasured) {
      pLeft = (screenWidth - widths[0]) / 2;
      pRight = (screenWidth - widths[widths.length - 1]) / 2;

      const allWidths = [...widths, ...widths, ...widths];
      let accumulated = 0;
      offsets = allWidths.map((w, index) => {
        const cardCenter = pLeft + accumulated + w / 2;
        accumulated += w + GAP;
        return cardCenter - screenWidth / 2;
      });
    }

    return { snapOffsets: offsets, paddingLeft: pLeft, paddingRight: pRight };
  }, [isMeasured, widths, screenWidth]);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      if (!isMeasured || snapOffsets.length === 0) return;

      const nextIndex = activeIndexRef.current + 1;
      activeIndexRef.current = nextIndex;
      
      scrollViewRef.current?.scrollTo({
        x: snapOffsets[nextIndex],
        animated: true,
      });
    }, 4000);
  }, [isMeasured, snapOffsets]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isMeasured && !hasInitializedScroll && snapOffsets.length > 3) {
      scrollViewRef.current?.scrollTo({ x: snapOffsets[3], animated: false });
      scrollX.setValue(snapOffsets[3]);
      setHasInitializedScroll(true);
      activeIndexRef.current = 3;
    }
  }, [isMeasured, hasInitializedScroll, snapOffsets, scrollX]);

  useEffect(() => {
    if (isMeasured && snapOffsets.length > 0) {
      startAutoPlay();
    }
    return () => stopAutoPlay();
  }, [isMeasured, snapOffsets, startAutoPlay, stopAutoPlay]);

  const handleScrollBeginDrag = () => {
    stopAutoPlay();
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isMeasured || snapOffsets.length === 0) return;

    const contentOffset = event.nativeEvent.contentOffset.x;
    
    // Find the closest snap offset
    let closestIndex = 3;
    let minDiff = Infinity;
    snapOffsets.forEach((offset, idx) => {
      const diff = Math.abs(offset - contentOffset);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    let targetIndex = closestIndex;
    if (closestIndex < 3) {
      targetIndex = closestIndex + 3;
      scrollViewRef.current?.scrollTo({ x: snapOffsets[targetIndex], animated: false });
      scrollX.setValue(snapOffsets[targetIndex]);
    } else if (closestIndex >= 6) {
      targetIndex = closestIndex - 3;
      scrollViewRef.current?.scrollTo({ x: snapOffsets[targetIndex], animated: false });
      scrollX.setValue(snapOffsets[targetIndex]);
    }

    activeIndexRef.current = targetIndex;

    // Resume autoplay after 8 seconds of inactivity
    stopAutoPlay();
    resumeTimeoutRef.current = setTimeout(() => {
      startAutoPlay();
    }, 8000);
  };

  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const velocityX = event.nativeEvent.velocity?.x || 0;
    if (velocityX === 0) {
      // No momentum, snap immediately and start resume timeout
      handleMomentumScrollEnd(event);
    }
  };

  return (
    <View style={styles.alignmentsSection}>
      <Text style={styles.sectionTitle}>НЕБЕСНЫЕ СОБЫТИЯ</Text>
      
      <View style={styles.scrollWrapper}>
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled={true}
          snapToOffsets={isMeasured ? snapOffsets : undefined}
          snapToAlignment="center"
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          contentContainerStyle={[
            styles.alignmentsScroll,
            isMeasured ? { paddingLeft, paddingRight } : null,
          ]}
        >
          {DATA.map((item, idx) => {
            let opacity: any = 1;
            let scale: any = 1;

            if (isMeasured && snapOffsets.length > 0) {
              const inputRange = [
                snapOffsets[idx] - 80,
                snapOffsets[idx],
                snapOffsets[idx] + 80,
              ];

              opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.7, 1, 0.7],
                extrapolate: 'clamp',
              });

              scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.95, 1, 0.95],
                extrapolate: 'clamp',
              });
            }

             return (
              <Animated.View
                key={`${item.id}-${idx}`}
                style={[
                  styles.animatedCardWrapper,
                  isMeasured && snapOffsets.length > 0
                    ? {
                        opacity,
                        transform: [{ scale }],
                      }
                    : { opacity: 1 },
                ]}
              >
                <View onLayout={(e) => handleLayout(idx, e.nativeEvent.layout.width)}>
                  <BlurView intensity={25} tint="dark" style={styles.alignmentMiniCard}>
                    <LinearGradient
                      colors={item.gradientColors as [string, string]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={[styles.iconCircle, { borderColor: item.iconBorderColor }]}>
                      <Text style={styles.alignmentIcon}>{item.icon}</Text>
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.alignmentTitle}>{item.title}</Text>
                      <Text style={styles.alignmentSub}>{item.subtitle}</Text>
                    </View>
                  </BlurView>
                </View>
              </Animated.View>
            );
          })}
        </Animated.ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  alignmentsSection: {
    marginBottom: 35,
    marginTop: 10,
    marginHorizontal: -25,
  },
  sectionTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 15,
    letterSpacing: 3,
    textTransform: 'uppercase',
    paddingHorizontal: 25,
    fontFamily: theme.fonts.bodyBold,
  },
  scrollWrapper: {
    position: 'relative',
  },
  alignmentsScroll: {
    gap: GAP,
  },
  animatedCardWrapper: {
    // Dynamic size based on layout
  },
  alignmentMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 220,
    gap: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(26,26,46,0.5)',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alignmentIcon: {
    fontSize: 22,
    color: '#FFF',
  },
  textContainer: {
    flex: 1,
  },
  alignmentTitle: {
    fontSize: 14,
    color: '#F0E6D2',
    marginBottom: 2,
    fontFamily: theme.fonts.bodyBold,
  },
  alignmentSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: theme.fonts.body,
  },
});

export default CelestialAlignments;
