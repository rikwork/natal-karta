import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../../../theme';

interface HoroscopeCardProps {
    onPress: () => void;
    content: string;
}

const HoroscopeCard: React.FC<HoroscopeCardProps> = ({ onPress, content }) => {
    return (
        <TouchableOpacity style={styles.horoscopeCardWrapper} onPress={onPress}>
            <BlurView intensity={30} tint="dark" style={styles.glassCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardSmallTitle}>TODAY&apos;S HOROSCOPE: OCT 28</Text>
                    <Text style={styles.signTitle}>SCORPIO</Text>
                </View>

                <Text style={styles.signEmoji}>♏</Text>

                <View style={styles.cardFooter}>
                    <Text style={styles.cardDescription} numberOfLines={3}>
                        {content || 'Navigate changes with confidence. A creative breakthrough awaits today!'}
                    </Text>
                    <View style={styles.cardSmallIcons}>
                        <Text>✨ 🌙</Text>
                    </View>
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    horoscopeCardWrapper: { flex: 1.1 },
    glassCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        padding: 16,
        height: 280,
    },
    cardHeader: { marginBottom: 10 },
    cardSmallTitle: {
        fontSize: 8,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '700',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    signTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.secondary,
        letterSpacing: 0.5,
    },
    signEmoji: {
        fontSize: 50,
        alignSelf: 'center',
        marginVertical: 10,
        color: theme.colors.secondary,
    },
    cardFooter: { marginTop: 'auto' },
    cardDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 18,
        marginBottom: 8,
    },
    cardSmallIcons: { flexDirection: 'row', gap: 4 },
});

export default HoroscopeCard;
