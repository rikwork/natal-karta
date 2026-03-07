import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Platform,
    SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../types';
import { theme } from '../theme';
import EditProfileModal from '../components/EditProfileModal';

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
    return (
        <SafeAreaView style={styles.mainContainer}>
            <LinearGradient
                colors={['#050514', '#1A1A2E'] as const}
                style={StyleSheet.absoluteFill}
            />

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
                            <Text style={styles.avatarText}>
                                {(user?.name || 'E').charAt(0)}
                            </Text>
                        </LinearGradient>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'Исследователь'}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setIsEditModalVisible(true)}
                    >
                        <Ionicons name="create-outline" size={16} color="#FFD700" />
                        <Text style={styles.editButtonText}>Редактировать профиль</Text>
                    </TouchableOpacity>

                    <View style={styles.badgeContainer}>
                        <LinearGradient
                            colors={user?.subscription_type === 'premium' ? ['#FFD700', '#FFA500'] : ['#4B4B4B', '#2F2F2F']}
                            style={styles.badge}
                        >
                            <Text style={styles.badgeText}>
                                {user?.subscription_type === 'premium' ? 'PREMIUM' : 'FREE'}
                            </Text>
                        </LinearGradient>
                    </View>
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

                    {/* Future settings can be added here */}
                </View>
            </View>

            {user && (
                <EditProfileModal
                    visible={isEditModalVisible}
                    onClose={() => setIsEditModalVisible(false)}
                    user={user}
                    onUpdate={onUpdateUser}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#050514',
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
        marginRight: 40, // Offset for back button to center title
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
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    editButtonText: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default CabinetScreen;
