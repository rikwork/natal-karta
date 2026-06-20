import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User, City } from '../types';
import ApiService from '../services/api';
import BirthDateStep from '../screens/Onboarding/steps/BirthDateStep';
import BirthTimeStep from '../screens/Onboarding/steps/BirthTimeStep';
import BirthPlaceStep from '../screens/Onboarding/steps/BirthPlaceStep';
import AstralSafeAreaView from '../components/AstralSafeAreaView';
import AstralButton from '../components/AstralButton';
import AstralHeader from '../components/AstralHeader';
import AstralGlassCard from '../components/AstralGlassCard';
import { formatBirthTime } from '../utils/dateFormatter';

interface EditProfileScreenProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onBack: () => void;
  onDeleteProfile: () => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  user,
  onUpdateUser,
  onBack,
  onDeleteProfile,
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
  const [originalBirthData, setOriginalBirthData] = useState({
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetchingChart, setIsFetchingChart] = useState(true);
  const [citySearch, setCitySearch] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [showCityList, setShowCityList] = useState(false);

  const canUpdateBirthData = () => {
    if (!user.birth_data_updated_at) return true;

    try {
      const lastUpdate = new Date(user.birth_data_updated_at);
      const now = new Date();

      const isDifferentDay =
        lastUpdate.getDate() !== now.getDate() ||
        lastUpdate.getMonth() !== now.getMonth() ||
        lastUpdate.getFullYear() !== now.getFullYear();

      return isDifferentDay;
    } catch (_e) {
      return true;
    }
  };

  const isBirthDataLocked = !canUpdateBirthData();

  const fetchUserChart = useCallback(async () => {
    setIsFetchingChart(true);
    try {
      const response = await ApiService.getNatalCharts(user.id);
      if (response.data && response.data.length > 0) {
        const chart = response.data[0];
        const birthDate = new Date(chart.birth_date);
        const formattedTime = formatBirthTime(chart.birth_time);
        const [hour, minute] = formattedTime.split(':').map(Number);

        const initialData = {
          day: birthDate.getDate(),
          month: birthDate.getMonth() + 1,
          year: birthDate.getFullYear(),
          hour: hour || 0,
          minute: minute || 0,
          place: chart.birth_place,
          latitude: chart.latitude,
          longitude: chart.longitude,
        };
        setBirthData(initialData);
        setOriginalBirthData(initialData);
        setCitySearch(chart.birth_place);
        setName(user.name);
      }
    } catch (error) {
      console.error('Error fetching chart:', error);
    } finally {
      setIsFetchingChart(false);
    }
  }, [user.id, user.name]);

  useEffect(() => {
    fetchUserChart();
  }, [fetchUserChart]);

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
    const nameChanged = name !== user.name;
    const isBirthDataActuallyChanged =
      JSON.stringify(birthData) !== JSON.stringify(originalBirthData);
    const birthDataChanged = isBirthDataActuallyChanged && !isBirthDataLocked;

    if (!nameChanged && !birthDataChanged) {
      Alert.alert('Информация', 'Вы не внесли никаких изменений.');
      return;
    }

    if (birthDataChanged && !birthData.place) {
      Alert.alert(
        'Ошибка',
        'Пожалуйста, выберите город из списка, чтобы сохранить место рождения.',
      );
      return;
    }

    setIsLoading(true);
    try {
      if (nameChanged) {
        await ApiService.updateUser(user.id, { name });
      }

      if (birthDataChanged) {
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
          await ApiService.generateNatalChart(user.id, chartResponse.data.id);
        }
      }

      const userResponse = await ApiService.getUser(user.id);
      if (userResponse.data) {
        onUpdateUser(userResponse.data);
      }

      Alert.alert('Успех', 'Ваши данные сохранены!');
      onBack();
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Что-то пошло не так при сохранении.';
      Alert.alert('Ошибка', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    const message = 'Вы уверены, что хотите удалить профиль, все данные будут удалены?';
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(message);
      if (confirmed) {
        performDeleteAccount();
      }
    } else {
      Alert.alert(
        'Удаление профиля',
        message,
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Удалить',
            style: 'destructive',
            onPress: performDeleteAccount,
          },
        ],
        { cancelable: true },
      );
    }
  };

  const performDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await ApiService.deleteUser(user.id);
    } catch (error) {
      console.error('Error deleting user from API:', error);
    } finally {
      setIsDeleting(false);
      onDeleteProfile();
    }
  };

  return (
    <View style={styles.mainContainer}>
      <AstralSafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <AstralHeader title="Редактировать профиль" onBack={onBack} />

          {isFetchingChart ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
            </View>
          ) : (
            <>
              <ScrollView
                contentContainerStyle={styles.formContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Личные данные</Text>
                  <AstralGlassCard style={styles.inputCard}>
                    <Text style={styles.inputLabel}>Имя</Text>
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={setName}
                      placeholder="Ваше имя"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                    />
                  </AstralGlassCard>
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
                      Данные рождения заблокированы до следующего дня.
                    </Text>
                  )}

                  <AstralGlassCard
                    style={[styles.inputCard, isBirthDataLocked && styles.lockedCard]}
                  >
                    <View pointerEvents={isBirthDataLocked ? 'none' : 'auto'}>
                      <View style={styles.fieldGroup}>
                        <Text style={styles.inputLabel}>Дата рождения</Text>
                        <BirthDateStep
                          selectedDate={{
                            day: birthData.day,
                            month: birthData.month,
                            year: birthData.year,
                          }}
                          onDateChange={(type, value) =>
                            setBirthData({ ...birthData, [type]: value })
                          }
                        />
                      </View>

                      <View style={styles.fieldGroup}>
                        <Text style={styles.inputLabel}>Время рождения</Text>
                        <BirthTimeStep
                          selectedTime={{ hour: birthData.hour, minute: birthData.minute }}
                          onTimeChange={(time) => setBirthData({ ...birthData, ...time })}
                        />
                      </View>

                      <View style={styles.fieldGroup}>
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
                  </AstralGlassCard>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Опасная зона</Text>
                  <AstralGlassCard style={styles.deleteCard}>
                    <Text style={styles.deleteDescription}>
                      При удалении аккаунта все ваши данные, включая натальные карты и историю
                      предсказаний, будут удалены без возможности восстановления.
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color="#FF4D4D" />
                      ) : (
                        <>
                          <Ionicons name="trash-outline" size={18} color="#FF4D4D" />
                          <Text style={styles.deleteButtonText}>Удалить профиль</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </AstralGlassCard>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <AstralButton
                  title={isLoading ? 'Сохранение...' : 'Применить изменения'}
                  onPress={handleSave}
                  disabled={isLoading || (name === user.name && isBirthDataLocked)}
                  style={styles.mainSaveButton}
                />
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </AstralSafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  inputCard: {
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: 'rgba(255, 215, 0, 0.8)',
    fontSize: 13,
    marginBottom: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    color: '#FFF',
    fontSize: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  lockedCard: {
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
    marginBottom: 10,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
  },
  mainSaveButton: {
    height: 60,
    borderRadius: 20,
  },
  deleteCard: {
    padding: 20,
    borderColor: 'rgba(255, 77, 77, 0.2)',
    borderWidth: 1,
  },
  deleteDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.3)',
    gap: 8,
    minHeight: 48,
  },
  deleteButtonText: {
    color: '#FF4D4D',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
