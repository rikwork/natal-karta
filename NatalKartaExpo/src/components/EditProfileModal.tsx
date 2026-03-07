import React, { useState, useEffect, useCallback } from 'react';
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
  ImageBackground,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { User, City } from '../types';
import ApiService from '../services/api';
import BirthDateStep from '../screens/Onboarding/steps/BirthDateStep';
import BirthTimeStep from '../screens/Onboarding/steps/BirthTimeStep';
import BirthPlaceStep from '../screens/Onboarding/steps/BirthPlaceStep';
import { formatBirthTime } from '../utils/dateFormatter';

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

      // Check if it's a different calendar day (local time)
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

  // Check if anything actually changed
  // Removed unused hasChanges function

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
    if (visible) {
      fetchUserChart();
    }
  }, [visible, fetchUserChart]);

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
    console.warn('SAVE: handleSave started. Updating user and chart.');
    const nameChanged = name !== user.name;
    const isBirthDataActuallyChanged = JSON.stringify(birthData) !== JSON.stringify(originalBirthData);
    const birthDataChanged = isBirthDataActuallyChanged && !isBirthDataLocked;

    if (!nameChanged && !birthDataChanged) {
      Alert.alert('Информация', 'Вы не внесли никаких изменений.');
      return;
    }

    if (birthDataChanged && !birthData.place) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите город из списка, чтобы сохранить место рождения.');
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
        onUpdate(userResponse.data);
      }

      Alert.alert('Успех', 'Ваши данные сохранены!');
      onClose();
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Что-то пошло не так при сохранении.';
      Alert.alert('Ошибка', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View
            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'transparent' }]}
          />

          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFD700" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Редактировать профиль</Text>
            <View style={{ width: 40 }} />
          </View>

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
                  <BlurView intensity={20} tint="light" style={styles.inputCard}>
                    <Text style={styles.inputLabel}>Имя</Text>
                    <TextInput
                      style={styles.textInput}
                      value={name}
                      onChangeText={setName}
                      placeholder="Ваше имя"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                    />
                  </BlurView>
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

                  <BlurView
                    intensity={15}
                    tint="light"
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
                  </BlurView>
                </View>

              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.mainSaveButton,
                  (isLoading || (name === user.name && isBirthDataLocked)) &&
                  styles.disabledSaveButton,
                ]}
                onPress={handleSave}
                disabled={isLoading}
              >
                <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.saveGradient}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.saveText}>Применить изменения</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#F0E6D2',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContent: {
    padding: 20,
    paddingBottom: 60,
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
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
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
  mainSaveButton: {
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
    height: 60,
  },
  saveGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  disabledSaveButton: {
    opacity: 0.4,
  },
});

export default EditProfileModal;
