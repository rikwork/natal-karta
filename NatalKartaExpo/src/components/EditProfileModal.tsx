import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { User, City, NatalChart } from '../types';
import ApiService from '../services/api';
import NameStep from '../screens/Onboarding/steps/NameStep';
import BirthDateStep from '../screens/Onboarding/steps/BirthDateStep';
import BirthTimeStep from '../screens/Onboarding/steps/BirthTimeStep';
import BirthPlaceStep from '../screens/Onboarding/steps/BirthPlaceStep';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    user: User;
    onUpdate: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    visible,
    onClose,
    user,
    onUpdate,
}) => {
    const [name, setName] = useState(user.name);
    const [birthData, setBirthData] = useState({
        day: 1,
        month: 1,
        year: 1990,
        hour: 12,
        minute: 0,
        place: '',
        latitude: 0,
        longitude: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingChart, setIsFetchingChart] = useState(true);
    const [citySearch, setCitySearch] = useState('');
    const [filteredCities, setFilteredCities] = useState<City[]>([]);
    const [isSearchingCities, setIsSearchingCities] = useState(false);
    const [showCityList, setShowCityList] = useState(false);

    // Constraint: Check if can update birth data
    const canUpdateBirthData = () => {
        if (!user.birth_data_updated_at) return true;
        const lastUpdate = new Date(user.birth_data_updated_at);
        const now = new Date();
        const diff = now.getTime() - lastUpdate.getTime();
        return diff > 24 * 60 * 60 * 1000;
    };

    const isBirthDataLocked = !canUpdateBirthData();

    useEffect(() => {
        if (visible) {
            fetchUserChart();
        }
    }, [visible]);

    const fetchUserChart = async () => {
        setIsFetchingChart(true);
        try {
            const response = await ApiService.getNatalCharts(user.id);
            if (response.data && response.data.length > 0) {
                const chart = response.data[0]; // Assuming first chart is primary
                const birthDate = new Date(chart.birth_date);
                const [hour, minute] = chart.birth_time.split(':').map(Number);

                setBirthData({
                    day: birthDate.getDate(),
                    month: birthDate.getMonth() + 1,
                    year: birthDate.getFullYear(),
                    hour: hour || 0,
                    minute: minute || 0,
                    place: chart.birth_place,
                    latitude: chart.latitude,
                    longitude: chart.longitude,
                });
                setCitySearch(chart.birth_place);
                setName(user.name);
            }
        } catch (error) {
            console.error('Error fetching chart:', error);
        } finally {
            setIsFetchingChart(false);
        }
    };

    const handleCitySearch = async (text: string) => {
        setCitySearch(text);
        if (text.length < 2) {
            setFilteredCities([]);
            setShowCityList(false);
            return;
        }
        setIsSearchingCities(true);
        try {
            const response = await ApiService.searchCities(text);
            if (response.data) {
                setFilteredCities(response.data);
                setShowCityList(true);
            }
        } catch (error) {
            console.error('City search error:', error);
        } finally {
            setIsSearchingCities(false);
        }
    };

    const handleSelectCity = (city: City) => {
        setBirthData({
            ...birthData,
            place: city.name,
            latitude: city.latitude,
            longitude: city.longitude,
        });
        setCitySearch(city.name);
        setShowCityList(false);
    };

    const handleSave = async () => {
        // Check if birth data was changed
        const birthDataChanged =
            birthData.place !== citySearch || // Simple check, might need more robust comparison
            true; // For simplicity, assume change if not locked

        if (birthDataChanged && isBirthDataLocked) {
            // This shouldn't happen if fields are disabled, but good to have
            Alert.alert('Ограничение', 'Данные рождения можно менять только раз в день.');
            return;
        }

        if (birthDataChanged) {
            const confirm = await new Promise((resolve) => {
                Alert.alert(
                    'Подтверждение',
                    'Вы уверены? Время и место рождения можно менять только раз в день.',
                    [
                        { text: 'Отмена', onPress: () => resolve(false), style: 'cancel' },
                        { text: 'Да, изменить', onPress: () => resolve(true) },
                    ]
                );
            });
            if (!confirm) return;
        }

        setIsLoading(true);
        try {
            // 1. Update User Name
            if (name !== user.name) {
                await ApiService.updateUser(user.id, { name });
            }

            // 2. Create/Update Natal Chart if birth data changed
            const updatedBirthDate = `${birthData.year}-${String(birthData.month).padStart(2, '0')}-${String(birthData.day).padStart(2, '0')}`;
            const updatedBirthTime = `${String(birthData.hour).padStart(2, '0')}:${String(birthData.minute).padStart(2, '0')}`;

            const chartResponse = await ApiService.createNatalChart(user.id, {
                name: `${name} - Натальная карта`,
                birth_date: updatedBirthDate,
                birth_time: updatedBirthTime,
                birth_place: birthData.place,
                latitude: birthData.latitude,
                longitude: birthData.longitude,
            });

            if (chartResponse.data) {
                // 3. Trigger regeneration
                await ApiService.generateNatalChart(user.id, chartResponse.data.id);
            }

            // Fetch updated user to get birth_data_updated_at
            const userResponse = await ApiService.getUser(user.id);
            if (userResponse.data) {
                onUpdate(userResponse.data);
            }

            Alert.alert('Успех', 'Данные успешно обновлены');
            onClose();
        } catch (error) {
            console.error('Save profile error:', error);
            Alert.alert('Ошибка', 'Не удалось сохранить изменения');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <LinearGradient
                    colors={['#050514', '#1A1A2E'] as const}
                    style={styles.modalContent}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#FFD700" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Редактировать профиль</Text>
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={isLoading || isFetchingChart}
                            style={styles.saveButton}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#FFD700" />
                            ) : (
                                <Text style={styles.saveButtonText}>Сохранить</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {isFetchingChart ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#FFD700" />
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={styles.formContent}>
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Личные данные</Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>Имя</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder="Ваше имя"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                    />
                                </View>
                            </View>

                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Данные рождения</Text>
                                    {isBirthDataLocked && (
                                        <View style={styles.lockBadge}>
                                            <Ionicons name="lock-closed" size={12} color="#FFA500" />
                                            <Text style={styles.lockText}>Раз в день</Text>
                                        </View>
                                    )}
                                </View>

                                {isBirthDataLocked && (
                                    <Text style={styles.hintText}>
                                        Вы уже обновляли данные рождения за последние 24 часа. Следующее изменение будет доступно позже.
                                    </Text>
                                )}

                                <View style={[styles.birthDataContainer, isBirthDataLocked && styles.lockedContainer]}>
                                    <View pointerEvents={isBirthDataLocked ? 'none' : 'auto'}>
                                        <Text style={styles.inputLabel}>Дата рождения</Text>
                                        <BirthDateStep
                                            selectedDate={{ day: birthData.day, month: birthData.month, year: birthData.year }}
                                            onDateChange={(type, value) => setBirthData({ ...birthData, [type]: value })}
                                        />

                                        <Text style={styles.inputLabel}>Время рождения</Text>
                                        <BirthTimeStep
                                            selectedTime={{ hour: birthData.hour, minute: birthData.minute }}
                                            onTimeChange={(time) => setBirthData({ ...birthData, ...time })}
                                        />

                                        <Text style={styles.inputLabel}>Место рождения</Text>
                                        <BirthPlaceStep
                                            citySearch={citySearch}
                                            onCitySearchChange={handleCitySearch}
                                            isSearchingCities={isSearchingCities}
                                            showCityList={showCityList}
                                            filteredCities={filteredCities}
                                            onSelectCity={handleSelectCity}
                                            onFocus={() => setShowCityList(citySearch.length >= 2)}
                                        />
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    )}
                </LinearGradient>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '90%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    closeButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#F0E6D2',
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveButton: {
        padding: 5,
    },
    saveButtonText: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    inputWrapper: {
        marginTop: 10,
    },
    inputLabel: {
        color: '#F0E6D2',
        fontSize: 14,
        marginBottom: 8,
        opacity: 0.8,
    },
    textInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 15,
        color: '#FFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    birthDataContainer: {
        marginTop: 10,
    },
    lockedContainer: {
        opacity: 0.5,
    },
    lockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 165, 0, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    lockText: {
        color: '#FFA500',
        fontSize: 10,
        fontWeight: '700',
    },
    hintText: {
        color: '#FFA500',
        fontSize: 12,
        marginBottom: 15,
        lineHeight: 18,
        fontStyle: 'italic',
    },
});

export default EditProfileModal;
