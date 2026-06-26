import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { PartnerCompatibility, City } from '../types';
import ApiService from '../services/api';
import AstralButton from '../components/AstralButton';
import AstralHeader from '../components/AstralHeader';
import AstralSafeAreaView from '../components/AstralSafeAreaView';
import AstralGlassCard from '../components/AstralGlassCard';
import AstralCitySelector from '../components/AstralCitySelector';

const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

interface CompatibilityFormScreenProps {
  userId: number;
  onCompatibilityCreated: (comp: PartnerCompatibility) => void;
  onBack: () => void;
}

export const CompatibilityFormScreen: React.FC<CompatibilityFormScreenProps> = ({
  userId,
  onCompatibilityCreated,
  onBack,
}) => {
  const [partnerName, setPartnerName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00:00');
  const [birthPlace, setBirthPlace] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const isFormValid =
    partnerName.trim() !== '' &&
    birthDate !== '' &&
    birthPlace !== '' &&
    latitude !== null &&
    longitude !== null;

  const [citySearch, setCitySearch] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [showCityList, setShowCityList] = useState(false);
  const [isSearchingCities, setIsSearchingCities] = useState(false);

  const handleDateChange = (date: Date) => {
    setBirthDate(date.toISOString().split('T')[0]);
    setShowDatePicker(false);
  };

  const handleTimeChange = (date: Date) => {
    setBirthTime(date.toTimeString().split(' ')[0]);
    setShowTimePicker(false);
  };

  const searchCities = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.length < 2) {
          setFilteredCities([]);
          setShowCityList(false);
          return;
        }

        setIsSearchingCities(true);
        try {
          const primaryLang = /[A-Za-z]/.test(query) ? 'en' : 'ru';
          const response = await ApiService.searchCities(query, primaryLang);
          const cities = response.data || [];

          if (cities && cities.length) {
            setFilteredCities(cities);
            setShowCityList(true);
          } else {
            setFilteredCities([]);
            setShowCityList(false);
          }
        } catch {
          setFilteredCities([]);
          setShowCityList(false);
        } finally {
          setIsSearchingCities(false);
        }
      }, 300),
    [],
  );

  const handleSelectCity = (city: City) => {
    const formattedCity = `${city.name}${city.admin_name1 ? `, ${city.admin_name1}` : ''}, ${city.country}`;
    setCitySearch(formattedCity);
    setBirthPlace(formattedCity);
    setLatitude(city.latitude);
    setLongitude(city.longitude);
    setShowCityList(false);
  };

  const handleSubmit = async () => {
    if (!partnerName.trim()) {
      Alert.alert('Ошибка', 'Введите имя партнера');
      return;
    }
    if (!birthDate) {
      Alert.alert('Ошибка', 'Выберите дату рождения партнера');
      return;
    }
    if (!birthPlace || latitude === null || longitude === null) {
      Alert.alert('Ошибка', 'Выберите место рождения партнера');
      return;
    }

    setLoading(true);
    try {
      const partnerData = {
        partner_name: partnerName,
        partner_birth_date: birthDate,
        partner_birth_time: birthTime,
        partner_birth_place: birthPlace,
        partner_latitude: latitude!,
        partner_longitude: longitude!,
      };

      const response = await ApiService.createPartnerCompatibility(userId, partnerData);
      if (response.data) {
        onCompatibilityCreated(response.data);
      } else {
        Alert.alert('Ошибка', response.error || 'Не удалось рассчитать совместимость');
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось рассчитать совместимость');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AstralSafeAreaView style={styles.container}>
      <AstralHeader title="Совместимость" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <AstralGlassCard style={styles.formCard}>
          <Text style={styles.titleText}>Данные партнера</Text>
          <Text style={styles.subtitleText}>
            Введите данные второй половинки для расчета звездной совместимости
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Имя партнера *</Text>
            <TextInput
              style={styles.input}
              value={partnerName}
              onChangeText={setPartnerName}
              placeholder="Как зовут вашу половинку?"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Дата рождения *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={[styles.inputText, !birthDate && styles.placeholder]}>
                {birthDate || 'Выберите дату'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Время рождения (опционально)</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
              <Text style={[styles.inputText, !birthTime && styles.placeholder]}>
                {birthTime ? birthTime.substring(0, 5) : '12:00'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Место рождения *</Text>
            <AstralCitySelector
              citySearch={citySearch}
              onCitySearchChange={(text) => {
                setCitySearch(text);
                searchCities(text);
              }}
              isSearchingCities={isSearchingCities}
              showCityList={showCityList}
              filteredCities={filteredCities}
              onSelectCity={handleSelectCity}
              onFocus={() => {
                if (citySearch.length >= 2) setShowCityList(true);
              }}
              placeholder="Город рождения"
            />
          </View>

          <AstralButton
            title={loading ? 'Рассчитываем...' : 'Рассчитать совместимость'}
            onPress={handleSubmit}
            disabled={loading || !isFormValid}
            style={styles.submitButton}
          />
        </AstralGlassCard>
      </ScrollView>

      <DatePicker
        modal
        open={showDatePicker}
        date={birthDate ? new Date(birthDate) : new Date(1995, 0, 1)}
        mode="date"
        onConfirm={handleDateChange}
        onCancel={() => setShowDatePicker(false)}
        maximumDate={new Date()}
      />

      <DatePicker
        modal
        open={showTimePicker}
        date={birthTime ? new Date(`2000-01-01T${birthTime}`) : new Date()}
        mode="time"
        onConfirm={handleTimeChange}
        onCancel={() => setShowTimePicker(false)}
      />
    </AstralSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formCard: {
    padding: 24,
    margin: 20,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F0E6D2',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
    position: 'relative',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 215, 0, 0.8)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#F0E6D2',
  },
  inputText: {
    fontSize: 16,
    color: '#F0E6D2',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  submitButton: {
    marginTop: 20,
    height: 60,
    borderRadius: 20,
  },
});

export default CompatibilityFormScreen;
