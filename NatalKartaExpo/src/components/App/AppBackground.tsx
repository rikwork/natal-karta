import React from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import ZodiacWheel from '../ZodiacWheel';

interface BackgroundVideoProps {
  isEnabled: boolean;
}

// Отдельный мемоизированный компонент для видео, чтобы избежать его пересоздания
const BackgroundVideoComponent: React.FC<BackgroundVideoProps> = ({ isEnabled }) => {
  if (!isEnabled) return null;

  return (
    <Video
      source={require('../../../assets/videos/background_video.mp4')}
      style={StyleSheet.absoluteFill}
      resizeMode={ResizeMode.COVER}
      isLooping
      shouldPlay
      isMuted
      progressUpdateIntervalMillis={60000} // Отключаем частые сообщения через Bridge
    />
  );
};

const BackgroundVideo = React.memo(
  BackgroundVideoComponent,
  (prevProps, nextProps) => prevProps.isEnabled === nextProps.isEnabled
);

interface AppBackgroundProps {
  currentScreen: string;
  wheelOpacity: Animated.Value;
  wheelTranslateY: Animated.Value;
  spin: Animated.AnimatedInterpolation<string | number>;
  pulseAnim: Animated.Value;
  isVideoEnabled: boolean;
}

const AppBackground: React.FC<AppBackgroundProps> = ({
  wheelOpacity,
  wheelTranslateY,
  spin,
  pulseAnim,
  isVideoEnabled,
}) => {
  const showBackground = true;

  if (!showBackground) return null;

  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#050514' }]}>
      {/* Статичный фон-плейсхолдер, отображаемый мгновенно */}
      <Image
        source={require('../../../assets/images/app_background.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Видео-фон, воспроизводимый поверх картинки после загрузки */}
      <BackgroundVideo isEnabled={isVideoEnabled} />

      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(5, 5, 20, 0.75)' }]} />

      <View
        style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}
        pointerEvents="none"
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              alignItems: 'center',
              justifyContent: 'center',
              opacity: wheelOpacity,
              transform: [{ translateY: wheelTranslateY }],
            },
          ]}
        >
          <ZodiacWheel spin={spin} opacity={1} pulseAnim={pulseAnim} />
        </Animated.View>
      </View>
    </View>
  );
};

export default React.memo(AppBackground);
