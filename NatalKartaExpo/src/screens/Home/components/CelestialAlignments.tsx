import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';

const CelestialAlignments: React.FC = () => {
    return (
        <View style={styles.alignmentsSection}>
            <Text style={styles.sectionTitle}>CELESTIAL ALIGNMENTS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.alignmentsScroll}>
                <BlurView intensity={20} tint="dark" style={styles.alignmentMiniCard}>
                    <Text style={styles.alignmentIcon}>☿</Text>
                    <View>
                        <Text style={styles.alignmentTitle}>Mercury in Retrograde</Text>
                        <Text style={styles.alignmentSub}>4d left</Text>
                    </View>
                </BlurView>
                <BlurView intensity={20} tint="dark" style={styles.alignmentMiniCard}>
                    <Text style={styles.alignmentIcon}>🌕</Text>
                    <View>
                        <Text style={styles.alignmentTitle}>Full Moon in Taurus</Text>
                        <Text style={styles.alignmentSub}>Nov 15</Text>
                    </View>
                </BlurView>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    alignmentsSection: { marginBottom: 30 },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 15,
        letterSpacing: 2,
    },
    alignmentsScroll: { gap: 12 },
    alignmentMiniCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        minWidth: 180,
        gap: 12,
    },
    alignmentIcon: { fontSize: 24 },
    alignmentTitle: { fontSize: 13, fontWeight: '700', color: '#FFF' },
    alignmentSub: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
});

export default CelestialAlignments;
