import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { User, NatalChart } from '../types';
import EditProfileModal from '../components/EditProfileModal';
import AstralButton from '../components/AstralButton';
import ApiService from '../services/api';
import { formatBirthTime } from '../utils/dateFormatter';

interface CabinetScreenProps {
  user: User | null;
  isVideoEnabled: boolean;
  onToggleVideo: (enabled: boolean) => void;
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

const CabinetScreen: React.FC<CabinetScreenProps> = ({
  user,
  isVideoEnabled,
  onToggleVideo,
  onBack,
  onUpdateUser,
}) => {
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [userChart, setUserChart] = React.useState<NatalChart | null>(null);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const fetchUserChart = React.useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingData(true);
    try {
      const response = await ApiService.getNatalCharts(user.id);
      if (response.data && response.data.length > 0) {
        setUserChart(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching chart in cabinet:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    fetchUserChart();
  }, [fetchUserChart]);

  return (
    <View style={styles.mainContainer}>
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: 'transparent' }]}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Личный кабинет</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.profileSection}>
            <View style={styles.avatarBorder}>
              <LinearGradient
                colors={['#FFD700', '#9D50BB'] as const}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarText}>{(user?.name || 'E').charAt(0)}</Text>
              </LinearGradient>
            </View>
            <Text style={styles.userName}>{user?.name || 'Исследователь'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>

            <AstralButton
              title="Изменить данные"
              onPress={() => setIsEditModalVisible(true)}
              style={styles.editButton}
              textStyle={styles.editButtonText}
            />

            <View style={styles.badgeContainer}>
              <LinearGradient
                colors={
                  user?.subscription_type === 'premium'
                    ? ['#FFD700', '#FFA500']
                    : ['#4B4B4B', '#2F2F2F']
                }
                style={styles.badge}
              >
                <Text style={styles.badgeText}>
                  {user?.subscription_type === 'premium' ? 'PREMIUM' : 'FREE'}
                </Text>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Астрологический профиль</Text>
            <BlurView intensity={20} tint="light" style={styles.dataCard}>
              <View style={styles.dataRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="calendar-outline" size={18} color="#FFD700" />
                </View>
                <View>
                  <Text style={styles.dataLabel}>Дата и время рождения</Text>
                  {isLoadingData ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFD700"
                      style={{ alignSelf: 'flex-start' }}
                    />
                  ) : (
                    <Text style={styles.dataValue}>
                      {userChart
                        ? `${new Date(userChart.birth_date).toLocaleDateString('ru-RU')} ${formatBirthTime(userChart.birth_time)}`
                        : 'Данные не загружены'}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.dataRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="location-outline" size={18} color="#FFD700" />
                </View>
                <View>
                  <Text style={styles.dataLabel}>Место рождения</Text>
                  {isLoadingData ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFD700"
                      style={{ alignSelf: 'flex-start' }}
                    />
                  ) : (
                    <Text style={styles.dataValue}>
                      {userChart?.birth_place || 'Данные не загружены'}
                    </Text>
                  )}
                </View>
              </View>
            </BlurView>
          </View>

          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Настройки</Text>

            <BlurView intensity={20} tint="light" style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Видео-фон</Text>
                <Text style={styles.settingDescription}>
                  Использовать анимированное звездное небо на главном экране
                </Text>
              </View>
              <Switch
                value={isVideoEnabled}
                onValueChange={onToggleVideo}
                trackColor={{ false: '#3e3e3e', true: '#9D50BB' }}
                thumbColor={isVideoEnabled ? '#FFD700' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
              />
            </BlurView>
          </View>
        </View>
      </SafeAreaView>

      {user && (
        <EditProfileModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          user={user}
          onUpdate={onUpdateUser}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#F0E6D2',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 40,
    fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'serif',
  },
  content: {
    flex: 1,
    padding: 25,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    padding: 5,
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F0E6D2',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 15,
  },
  badgeContainer: {
    marginTop: 5,
  },
  badge: {
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  settingsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 15,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F0E6D2',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 16,
  },
  editButton: {
    marginTop: 15,
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  editButtonText: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  dataSection: {
    marginBottom: 30,
  },
  dataCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 20,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  dataValue: {
    color: '#F0E6D2',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CabinetScreen;
