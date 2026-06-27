import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import AstralGlassCard from './AstralGlassCard';
import { Ionicons } from '@expo/vector-icons';

interface AstralAdLockedSectionProps {
  title: string;
  text?: string;
  isUnlocked: boolean;
  onUnlock: () => void;
  previewLines?: number; // 3 by default
  gradientColors?: readonly [string, string];
  icon?: string;
  style?: StyleProp<ViewStyle>;
}

export const AstralAdLockedSection: React.FC<AstralAdLockedSectionProps> = ({
  title,
  text,
  isUnlocked,
  onUnlock,
  previewLines = 3,
  gradientColors,
  icon,
  style,
}) => {
  if (!text) return null;

  const showPreview = !isUnlocked && previewLines > 0;
  const showLockedOverlay = !isUnlocked;

  return (
    <AstralGlassCard style={style}>
      <LinearGradient
        colors={gradientColors || (['rgba(255,255,255,0.05)', 'transparent'] as const)}
        style={styles.cardGradient}
      >
        <View style={styles.titleRow}>
          {icon && (
            <Ionicons
              name={icon as any}
              size={18}
              color={gradientColors ? gradientColors[0] : '#E2E8F0'}
              style={styles.titleIcon}
            />
          )}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>

        {isUnlocked ? (
          <Text style={styles.cardBody}>{text}</Text>
        ) : (
          <View>
            {showPreview && (
              <Text style={styles.cardBody} numberOfLines={previewLines}>
                {text}
              </Text>
            )}
            {showLockedOverlay && (
              <View style={[styles.lockedContainer, !showPreview && styles.lockedContainerFull]}>
                <BlurView intensity={60} tint="dark" style={styles.lockOverlay}>
                  <Text style={styles.lockedText}>
                    {previewLines > 0 ? 'Полный прогноз скрыт' : 'Этот раздел скрыт'}
                  </Text>
                  <TouchableOpacity style={styles.unlockAdButton} onPress={onUnlock} activeOpacity={0.8}>
                    <Text style={styles.unlockAdButtonText}>🔓 Открыть (Смотреть рекламу)</Text>
                  </TouchableOpacity>
                </BlurView>
              </View>
            )}
          </View>
        )}
      </LinearGradient>
    </AstralGlassCard>
  );
};

const styles = StyleSheet.create({
  cardGradient: {
    padding: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  cardBody: {
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 24,
  },
  lockedContainer: {
    marginTop: -20,
    paddingTop: 40,
    overflow: 'hidden',
  },
  lockedContainerFull: {
    marginTop: 0,
    paddingTop: 0,
  },
  lockOverlay: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  lockedText: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 12,
  },
  unlockAdButton: {
    backgroundColor: 'rgba(157, 101, 255, 0.8)', // Purple theme match
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C084FC',
  },
  unlockAdButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
