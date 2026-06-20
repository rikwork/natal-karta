import { Platform } from 'react-native';

// Общие дизайн-токены для приложения
export const theme = {
  colors: {
    primary: '#9D65FF', // Galactic Purple
    secondary: '#FFD700', // Cosmic Gold
    accent: '#00D1FF', // Stellar Blue
    neonPurple: '#d946ef', // From mockup Tarot card
    neonBlue: '#3b82f6', // From mockup Tarot card
    background: {
      deep: '#0F091A', // Darker background for more contrast
      dark: '#14142B',
      medium: '#1B1B3A',
      card: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E2E8F0',
      accent: '#FFD700', // Gold accents for serif fonts
      muted: 'rgba(255,255,255,0.5)',
    },
    gradient: {
      main: ['#0B081A', '#130e2b', '#1f1638'],
      card: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.02)'],
      glow: ['#9D65FF', '#6B46C1'],
      gold: ['#FDE047', '#EAB308', '#CA8A04'],
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  fonts: {
    heading: 'CormorantGaramond_700Bold',
    headingRegular: 'CormorantGaramond_400Regular',
    body: 'Montserrat_400Regular',
    bodyMedium: 'Montserrat_500Medium',
    bodySemiBold: 'Montserrat_600SemiBold',
    bodyBold: 'Montserrat_700Bold',
    mono: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 28,
    xxxl: 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
} as const;

export type Theme = typeof theme;
