import React from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import ZodiacWheel from '../ZodiacWheel';

interface AppBackgroundProps {
    currentScreen: string;
    wheelOpacity: Animated.Value;
    spin: Animated.AnimatedInterpolation<string | number>;
    pulseAnim: Animated.Value;
}

const AppBackground: React.FC<AppBackgroundProps> = ({
    currentScreen,
    wheelOpacity,
    spin,
    pulseAnim,
}) => {
    const showBackground =
        currentScreen === 'Onboarding' || currentScreen === 'Loading' || currentScreen === 'Result';

    if (!showBackground) return null;

    return (
        <View style={StyleSheet.absoluteFillObject}>
            <Image
                source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj_EyvNiJnWwHl1dT647d1neMGhn5cHPcdBqtFAaPHr5a3vZPbeQsnldExCo95wjhuFikQNLEPPNQ77lxA_H5DNylgzwV8zytGuSeNJcDdx_f-BuvafKAUoX30eogMG_oqc9kMsoPewi37YTSA8VvlJg5Os5pEDndnE3DI2SAbUqDACWl0EuLQzJh97D24G7oGQVTZe1dh3iNVIjvEzRIGKQAiOAYlYNataspz6w-xpQygLXXHhdMQE5r39xlZwfrnyLdEl6SwXTTs',
                }}
                style={StyleSheet.absoluteFillObject}
            />
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
