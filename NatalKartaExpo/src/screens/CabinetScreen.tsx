import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { User, NatalChart } from '../types';
import ApiService from '../services/api';
import { formatBirthTime } from '../utils/dateFormatter';
import AstralHeader from '../components/AstralHeader';
import AstralGlassCard from '../components/AstralGlassCard';
import AstralSafeAreaView from '../components/AstralSafeAreaView';
import { theme } from '../theme';

interface CabinetScreenProps {
  user: User | null;
  isVideoEnabled: boolean;
  onToggleVideo: (enabled: boolean) => void;
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onNavigateToEditProfile: () => void;
}

const CabinetScreen: React.FC<CabinetScreenProps> = ({
  user,
  isVideoEnabled,
  onToggleVideo,
  onBack,
  onUpdateUser,
  onNavigateToEditProfile,
}) => {
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
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'transparent' }]} />

      <AstralSafeAreaView style={styles.safeArea}>
        <AstralHeader title="Личный кабинет" onBack={onBack} />
        <View style={styles.content}>
          <View style={styles.profileSection}>
            <LinearGradient
              colors={['#9D65FF', '#FFD700'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarBorderGradient}
            >
              <View style={styles.avatarInnerContainer}>
                <Text style={styles.avatarText}>{(user?.name || 'E').charAt(0).toUpperCase()}</Text>
              </View>
            </LinearGradient>

            <Text style={styles.userName}>{user?.name || 'Исследователь'}</Text>

            <TouchableOpacity
              style={styles.editButton}
              onPress={onNavigateToEditProfile}
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>Изменить данные</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Астрологический профиль</Text>
            <AstralGlassCard style={styles.dataCard}>
              <View style={styles.dataRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="calendar-outline" size={18} color="#FFD700" />
                </View>
                <View style={{ flex: 1 }}>
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
                <View style={{ flex: 1 }}>
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
            </AstralGlassCard>
          </View>

          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Настройки</Text>

            <AstralGlassCard style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Видео-фон</Text>
                <Text style={styles.settingDescription}>
                  Использовать анимированное звездное небо на главном экране
                </Text>
              </View>
              <Switch
                value={isVideoEnabled}
                onValueChange={onToggleVideo}
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#9D65FF' }}
                thumbColor={isVideoEnabled ? '#FFFFFF' : '#8E8E93'}
                ios_backgroundColor="rgba(255, 255, 255, 0.1)"
              />
            </AstralGlassCard>
          </View>
        </View>
      </AstralSafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(157, 101, 255, 0.15)',
  },
  backButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '700',
    marginRight: 40,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    padding: 25,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarBorderGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 2,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9D65FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarInnerContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    backgroundColor: '#0F0E17',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 38,
    fontFamily: theme.fonts.mono,
  },
  userName: {
    fontSize: 24,
    color: '#F0E6D2',
    fontFamily: theme.fonts.heading,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: theme.fonts.body,
    marginBottom: 15,
  },
  badgeContainer: {
    marginTop: 5,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumBadgeText: {
    color: '#0F0E17',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  freeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  freeBadgeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
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
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(157, 101, 255, 0.25)',
    backgroundColor: 'rgba(15, 14, 23, 0.4)',
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
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(157, 101, 255, 0.4)',
    backgroundColor: 'rgba(157, 101, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#9D65FF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  dataSection: {
    marginBottom: 30,
  },
  dataCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: 'rgba(15, 14, 23, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(157, 101, 255, 0.25)',
    gap: 20,
    overflow: 'hidden',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(157, 101, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(157, 101, 255, 0.25)',
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
