import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    Platform,
    ViewStyle,
    TextStyle,
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
}

const AstralButton: React.FC<AstralButtonProps> = ({
    title,
    onPress,
    disabled = false,
    style,
    outerStyle,
    innerStyle,
    textStyle,
}) => {
    const height = (style as any)?.height ?? 56;
    const borderRadius = (style as any)?.borderRadius ?? (typeof height === 'number' ? height / 2 : 28);
    const innerBorderRadius = borderRadius - 1.5;

    return (
        <TouchableOpacity
            style={[
                styles.buttonWrapper,
                {
                    height,
                    borderRadius,
                    shadowRadius: typeof height === 'number' ? height * 0.18 : 10,
                    shadowOpacity: typeof height === 'number' ? Math.min(0.4, 0.2 + (height / 200)) : 0.4
                },
                disabled && styles.disabled,
                style
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={['#9D50BB', '#FFD700']}
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
