import React, { useEffect, useRef } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    Platform,
    ViewStyle,
    TextStyle,
    Animated,
    Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AstralButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    style?: ViewStyle;
    outerStyle?: ViewStyle;
    innerStyle?: ViewStyle;
    textStyle?: TextStyle;
    hasCosmicGlow?: boolean;
}

const AstralButton: React.FC<AstralButtonProps> = ({
    title,
    onPress,
    disabled = false,
    style,
    outerStyle,
    innerStyle,
    textStyle,
    hasCosmicGlow = false,
}) => {
    const height = (style as any)?.height ?? 56;
    const borderRadius = (style as any)?.borderRadius ?? (typeof height === 'number' ? height / 2 : 28);
    const innerBorderRadius = borderRadius - 1.5;

    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (hasCosmicGlow && !disabled) {
            Animated.loop(
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 4000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            glowAnim.setValue(0);
        }
    }, [hasCosmicGlow, disabled, glowAnim]);

    const translateX = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200], // Animate gradient from left to right
    });

    return (
        <TouchableOpacity
            style={[
                styles.buttonWrapper,
                { height, borderRadius },
                disabled && styles.disabled,
                style
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <View style={[styles.outerContainer, { borderRadius }]}>
                {hasCosmicGlow && !disabled && (
                    <Animated.View
                        style={[
                            styles.glowLayer,
                            {
                                transform: [{ translateX }],
                                borderRadius,
                            }
                        ]}
                    >
                        <LinearGradient
                            colors={[
                                'transparent',
                                'rgba(157, 80, 187, 0.8)', // Purple
                                'rgba(0, 210, 255, 0.8)', // Cyan
                                'rgba(255, 215, 0, 0.8)', // Gold
                                'rgba(157, 80, 187, 0.8)', // Purple
                                'transparent'
                            ]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.glowGradient}
                        />
                    </Animated.View>
                )}

                <LinearGradient
                    colors={hasCosmicGlow ? ['transparent', 'transparent'] : ['#9D50BB', '#FFD700']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.outer, { borderRadius }, outerStyle]}
                >
                    <LinearGradient
                        colors={['#1a0b2e', '#411d73']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={[styles.inner, { borderRadius: innerBorderRadius }, innerStyle]}
                    >
                        <Text style={[styles.text, textStyle]}>
                            {title}
                        </Text>
                    </LinearGradient>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonWrapper: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    outerContainer: {
        flex: 1,
        overflow: 'hidden',
        position: 'relative',
    },
    glowLayer: {
        ...StyleSheet.absoluteFillObject,
        width: '200%', // Make wider for animation
        zIndex: -1,
    },
    glowGradient: {
        flex: 1,
        width: '100%',
    },
    outer: {
        flex: 1,
        padding: 1.5,
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#F0E6D2',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'serif',
        textAlign: 'center',
        letterSpacing: 1.5,
        textShadowColor: 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    disabled: {
        opacity: 0.4,
        shadowOpacity: 0,
    },
});

export default AstralButton;
