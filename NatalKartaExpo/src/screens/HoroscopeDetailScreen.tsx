import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Platform,
    Dimensions,
    Image,
    ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DailyPredictionContent } from '../types';
import ApiService from '../services/api';

const { width, height } = Dimensions.get('window');

interface HoroscopeDetailScreenProps {
    sign: string;
    signImage: any;
    onBack: () => void;
}

type Period = 'today' | 'tomorrow' | 'week' | 'month';

const HoroscopeDetailScreen: React.FC<HoroscopeDetailScreenProps> = ({
    sign,
    signImage,
    onBack,
}) => {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('today');
    const [predictions, setPredictions] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPredictions = async () => {
            setLoading(true);
            try {
                const response = await ApiService.getZodiacPredictions(sign);
                if (response.data) {
                    setPredictions(response.data);
                }
            } catch (error) {
                console.error('Error fetching zodiac predictions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPredictions();
    }, [sign]);

    const periods: { id: Period; label: string }[] = [
        { id: 'today', label: 'Сегодня' },
        { id: 'tomorrow', label: 'Завтра' },
        { id: 'week', label: 'Неделя' },
        { id: 'month', label: 'Месяц' },
    ];

    const currentPrediction = predictions[selectedPeriod];

    return (
        <View style={styles.container}>


            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#FFD700" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{sign.toUpperCase()}</Text>
                    <View style={{ width: 40 }} />
                </View>

                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#FFD700" />
                        <Text style={styles.loaderText}>Звезды выстраиваются...</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.imageContainer}>
                            <Image source={signImage} style={styles.signImage} resizeMode="contain" />
                            <LinearGradient
                                colors={['transparent', '#050514'] as const}
                                style={styles.imageOverlay}
                            />
                        </View>

                        <View style={styles.tabsContainer}>
                            <BlurView intensity={30} tint="dark" style={styles.tabsBlur}>
                                {periods.map((period) => (
                                    <TouchableOpacity
                                        key={period.id}
                                        style={[
                                            styles.tabButton,
                                            selectedPeriod === period.id && styles.activeTabButton,
                                        ]}
                                        onPress={() => setSelectedPeriod(period.id)}
                                    >
                                        <Text
                                            style={[
                                                styles.tabText,
                                                selectedPeriod === period.id && styles.activeTabText,
                                            ]}
                                        >
                                            {period.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </BlurView>
                        </View>

                        <View style={styles.contentSection}>
                            <BlurView intensity={20} tint="light" style={styles.predictionCard}>
                                <View style={styles.predictionSection}>
                                    <Text style={styles.sectionTitle}>Энергетика</Text>
                                    <Text style={styles.predictionText}>
                                        {currentPrediction?.energy || 'Предсказание ещё в пути...'}
                                    </Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.predictionSection}>
                                    <Text style={styles.sectionTitle}>Рекомендации</Text>
                                    {currentPrediction?.recommendations?.map((rec: string) => (
                                        <View key={rec} style={styles.bulletRow}>
                                            <Text style={styles.bullet}>✨</Text>
                                            <Text style={styles.bulletText}>{rec}</Text>
                                        </View>
                                    )) || <Text style={styles.predictionText}>Нет рекомендаций на этот период.</Text>}
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.predictionSection}>
                                    <Text style={styles.sectionTitle}>Предупреждения</Text>
                                    {currentPrediction?.warnings?.map((warn: string) => (
                                        <View key={warn} style={styles.bulletRow}>
                                            <Text style={styles.bullet}>⚠️</Text>
                                            <Text style={styles.bulletText}>{warn}</Text>
                                        </View>
                                    )) || <Text style={styles.predictionText}>Предупреждений нет.</Text>}
                                </View>

                                <View style={styles.luckyInfoRow}>
                                    <View style={styles.luckyItem}>
                                        <Text style={styles.luckyLabel}>Число</Text>
                                        <Text style={styles.luckyValue}>{currentPrediction?.number || currentPrediction?.lucky_number || '-'}</Text>
                                    </View>
                                    <View style={styles.luckyItem}>
                                        <Text style={styles.luckyLabel}>Цвет</Text>
                                        <Text style={styles.luckyValue}>{currentPrediction?.color || currentPrediction?.lucky_color || '-'}</Text>
                                    </View>
                                </View>
                            </BlurView>
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#FFD700',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'serif',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    imageContainer: {
        width: width,
        height: width * 0.8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signImage: {
        width: width * 0.7,
        height: width * 0.7,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    tabsContainer: {
        paddingHorizontal: 20,
        marginTop: -20,
        marginBottom: 20,
    },
    tabsBlur: {
        flexDirection: 'row',
        borderRadius: 20,
        overflow: 'hidden',
        padding: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 15,
    },
    activeTabButton: {
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
    },
    tabText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#FFD700',
    },
    contentSection: {
        paddingHorizontal: 20,
    },
    predictionCard: {
        borderRadius: 30,
        padding: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    predictionSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    predictionText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 15,
        lineHeight: 22,
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 20,
    },
    bulletRow: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingRight: 10,
    },
    bullet: {
        fontSize: 14,
        marginRight: 10,
        marginTop: 2,
    },
    bulletText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 15,
        lineHeight: 22,
        flex: 1,
    },
    luckyInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 15,
    },
    luckyItem: {
        flex: 1,
        backgroundColor: 'rgba(255, 215, 0, 0.05)',
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
    },
    luckyLabel: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 5,
    },
    luckyValue: {
        color: '#F0E6D2',
        fontSize: 16,
        fontWeight: '800',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    loaderText: {
        color: '#FFD700',
        fontSize: 16,
        fontStyle: 'italic',
        opacity: 0.8,
    },
});

export default HoroscopeDetailScreen;
