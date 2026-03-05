import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../../../theme';

const TarotCard: React.FC = () => {
    return (
        <TouchableOpacity style={styles.tarotCardWrapper}>
            <BlurView intensity={30} tint="dark" style={[styles.glassCard, styles.tarotCardBorder]}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardSmallTitle}>DAILY TAROT:</Text>
                    <Text style={styles.tarotTitle}>THE STAR</Text>
                </View>

                <View style={styles.tarotImageContainer}>
                    <Image
                        source={require('../../../../assets/images/tarot_placeholder.png')}
                        style={styles.tarotImage}
                        resizeMode="cover"
                    />
                </View>

                <View style={styles.tarotFooter}>
                    <Text style={styles.tarotStatus}>The Star (Upright)</Text>
                    <Text style={styles.tarotDesc} numberOfLines={2}>
                        Hope, Inspiration, Renewal. A day of healing and clarity.
                    </Text>
                </View>
            </BlurView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tarotCardWrapper: { flex: 1 },
    glassCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        padding: 16,
        height: 280,
    },
    tarotCardBorder: { borderColor: 'rgba(157,101,255,0.3)' },
    cardHeader: { marginBottom: 10 },
    cardSmallTitle: {
        fontSize: 8,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '700',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    tarotTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    tarotImageContainer: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 8,
    },
    tarotImage: { width: '100%', height: '100%' },
    tarotFooter: { marginTop: 4 },
    tarotStatus: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 2,
    },
    tarotDesc: { fontSize: 9, color: 'rgba(255,255,255,0.6)' },
});

export default TarotCard;
