import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const CelestialAlignments: React.FC = () => {
    return (
        <View style={styles.alignmentsSection}>
            <Text style={styles.sectionTitle}>НЕБЕСНЫЕ СОБЫТИЯ</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.alignmentsScroll}
            >
                <BlurView intensity={25} tint="dark" style={styles.alignmentMiniCard}>
                    <LinearGradient
                        colors={['rgba(255,107,107,0.1)', 'transparent']}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.iconCircle}>
                        <Text style={styles.alignmentIcon}>☿</Text>
                    </View>
                    <View>
                        <Text style={styles.alignmentTitle}>Меркурий ретроградный</Text>
                        <Text style={styles.alignmentSub}>осталось 4 дня</Text>
                    </View>
                </BlurView>

                <BlurView intensity={25} tint="dark" style={styles.alignmentMiniCard}>
                    <LinearGradient
                        colors={['rgba(255,215,0,0.1)', 'transparent']}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={[styles.iconCircle, { borderColor: 'rgba(255,215,0,0.2)' }]}>
                        <Text style={styles.alignmentIcon}>🌕</Text>
                    </View>
                    <View>
                        <Text style={styles.alignmentTitle}>Полнолуние в Тельце</Text>
                        <Text style={styles.alignmentSub}>15 ноября</Text>
                    </View>
                </BlurView>

                <BlurView intensity={25} tint="dark" style={styles.alignmentMiniCard}>
                    <LinearGradient
                        colors={['rgba(78,205,196,0.1)', 'transparent']}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={[styles.iconCircle, { borderColor: 'rgba(78,205,196,0.2)' }]}>
                        <Text style={styles.alignmentIcon}>🪐</Text>
                    </View>
                    <View>
                        <Text style={styles.alignmentTitle}>Сатурн в Рыбах</Text>
                        <Text style={styles.alignmentSub}>Активно</Text>
                    </View>
                </BlurView>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    alignmentsSection: {
        marginBottom: 35,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 15,
        letterSpacing: 3,
        textTransform: 'uppercase',
        paddingLeft: 4,
    },
    alignmentsScroll: {
        gap: 15,
        paddingRight: 20,
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
    alignmentTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#F0E6D2',
        marginBottom: 2,
    },
    alignmentSub: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '500',
    },
});

export default CelestialAlignments;
