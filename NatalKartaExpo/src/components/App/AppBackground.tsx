import { View, StyleSheet, Animated, Image, useWindowDimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import ZodiacWheel from '../ZodiacWheel';

interface AppBackgroundProps {
    currentScreen: string;
    wheelOpacity: Animated.Value;
    spin: Animated.AnimatedInterpolation<string | number>;
    pulseAnim: Animated.Value;
    isVideoEnabled: boolean;
}

const AppBackground: React.FC<AppBackgroundProps> = ({
    currentScreen,
    wheelOpacity,
    spin,
    pulseAnim,
    isVideoEnabled,
}) => {
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const showBackground = true;

    if (!showBackground) return null;

    return (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#050514' }]}>
            {isVideoEnabled ? (
                <Video
                    source={require('../../../assets/videos/background_video.mp4')}
                    style={StyleSheet.absoluteFill}
                    resizeMode={ResizeMode.COVER}
                    isLooping
                    shouldPlay
                    isMuted
                />
            ) : (
                <Image
                    source={require('../../../assets/images/app_background.png')}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                />
            )}
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(5, 5, 20, 0.6)' }]} />

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
                            transform: [{ translateY: 50 }],
                        },
                    ]}
                >
                    <ZodiacWheel spin={spin} opacity={1} pulseAnim={pulseAnim} />
                </Animated.View>
            </View>
        </View>
    );
};

export default AppBackground;
