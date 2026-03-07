import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { BirthData } from '../types';
import ApiService from '../services/api';

interface CreateChartScreenProps {
  userId: number;
  onChartCreated: () => void;
  onBack: () => void;
}

const CreateChartScreen: React.FC<CreateChartScreenProps> = ({
  userId,
  onChartCreated,
  onBack,
}) => {
  const [formData, setFormData] = useState<BirthData>({
    name: '',
    birth_date: '',
    birth_time: '',
    birth_place: '',
    latitude: 0,
    longitude: 0,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof BirthData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      birth_date: date.toISOString().split('T')[0],
    }));
    setShowDatePicker(false);
  };

  const handleTimeChange = (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      birth_time: date.toTimeString().split(' ')[0],
    }));
    setShowTimePicker(false);
  };

  const geocodeLocation = async (place: string) => {
    // В реальном приложении здесь будет интеграция с геокодинг API
    // Пока возвращаем координаты Москвы как пример
    return {
      latitude: 55.7558,
      longitude: 37.6176,
    };
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.birth_date || !formData.birth_time || !formData.birth_place) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    try {
      // Получаем координаты места рождения
      const coords = await geocodeLocation(formData.birth_place);

      const chartData = {
        ...formData,
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      await ApiService.createNatalChart(userId, chartData);
      Alert.alert('Успех', 'Натальная карта создана!', [{ text: 'OK', onPress: onChartCreated }]);
    } catch (_error) {
      Alert.alert('Ошибка', 'Не удалось создать натальную карту');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Создать натальную карту</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Имя *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Введите ваше имя"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Дата рождения *</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text style={[styles.inputText, !formData.birth_date && styles.placeholder]}>
              {formData.birth_date || 'Выберите дату'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Время рождения *</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
            <Text style={[styles.inputText, !formData.birth_time && styles.placeholder]}>
              {formData.birth_time || 'Выберите время'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Место рождения *</Text>
          <TextInput
            style={styles.input}
            value={formData.birth_place}
            onChangeText={(value) => handleInputChange('birth_place', value)}
            placeholder="Город, страна"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Создать натальную карту</Text>
          )}
        </TouchableOpacity>
      </View>

      <DatePicker
        modal
        open={showDatePicker}
        date={formData.birth_date ? new Date(formData.birth_date) : new Date()}
        mode="date"
        onConfirm={handleDateChange}
        onCancel={() => setShowDatePicker(false)}
        maximumDate={new Date()}
      />

      <DatePicker
        modal
        open={showTimePicker}
        date={formData.birth_time ? new Date(`2000-01-01T${formData.birth_time}`) : new Date()}
        mode="time"
        onConfirm={handleTimeChange}
        onCancel={() => setShowTimePicker(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: 'rgba(107, 70, 193, 0.4)',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
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
  },
  inputText: {
    fontSize: 16,
    color: '#F0E6D2',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  submitButton: {
    backgroundColor: '#6B46C1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateChartScreen;
