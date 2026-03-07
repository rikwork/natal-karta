import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface HoroscopeCardProps {
    onPress: () => void;
    content: string;
}

const HoroscopeCard: React.FC<HoroscopeCardProps> = ({ onPress, content }) => {
    return (
        <TouchableOpacity style={styles.horoscopeCardWrapper} onPress={onPress} activeOpacity={0.9}>
            <BlurView intensity={40} tint="dark" style={styles.glassCard}>
                <LinearGradient
                    colors={['rgba(255,215,0,0.1)', 'transparent'] as const}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />

                <View style={styles.cardHeader}>
                    <Text style={styles.cardSmallTitle}>ГОРОСКОП НА СЕГОДНЯ: 28 ОКТ</Text>
                    <Text style={styles.signTitle}>СКОРПИОН</Text>
                </View>

                <View style={styles.emojiContainer}>
                    <Text style={styles.signEmoji}>♏</Text>
                    <View style={styles.glowEffect} />
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.cardDescription} numberOfLines={3}>
                        {content || 'Принимайте перемены с уверенностью. Сегодня вас ждет творческий прорыв!'}
                    </Text>
                    <View style={styles.cardSmallIcons}>
                        <Text style={styles.iconText}>✨ 🌙 🌟</Text>
                    </View>
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    horoscopeCardWrapper: {
        flex: 1.1,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    glassCard: {
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.2)',
        padding: 20,
        height: 300,
        backgroundColor: 'rgba(26,26,46,0.4)',
    },
    cardHeader: {
        marginBottom: 12,
        borderLeftWidth: 2,
        borderLeftColor: '#FFD700',
        paddingLeft: 10,
    },
    cardSmallTitle: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    signTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFD700',
        letterSpacing: 1,
        fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'serif',
    },
    emojiContainer: {
        marginVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signEmoji: {
        fontSize: 56,
        color: '#FFD700',
        zIndex: 2,
    },
    glowEffect: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFD700',
        opacity: 0.2,
        // Note: filter is not supported in React Native StyleSheet, but this is a reminder for web/future
    },
    cardFooter: {
        marginTop: 'auto',
    },
    cardDescription: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 18,
        marginBottom: 10,
        fontWeight: '400',
        fontStyle: 'italic',
    },
    cardSmallIcons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    iconText: {
        fontSize: 14,
        opacity: 0.8,
    }
});

export default HoroscopeCard;
