import { Dimensions } from 'react-native';

export const COLORS = {
  primary: '#163172', // Dark indigo
  secondary: '#667eea', // Lighter indigo
  primaryLight: '#E0E7FF', // Light variant of primary for selected cards
  secondaryLight: '#C7D2FE', // Light variant of secondary
  accent: '#F59E0B', // Matches warning for backward compatibility
  background: '#d5dade', // Dark navy
  backgroundSecondary: '#0F0F23', // Light gray for alternate backgrounds
  orbBlue: 'rgba(59, 130, 246, 0.12)',
  orbGold: 'rgba(250, 204, 21, 0.1)',
  error: '#EF4444',
  errorBackground: 'rgba(239, 68, 68, 0.1)',
  errorBorder: 'rgba(239, 68, 68, 0.2)',
  white: '#FFFFFF',
  black: '#000000',
  formBackground: '#F6F6F6',
  formBorder: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  success: '#10B981',
  successLight: '#D1FAE5', // Light variant of success
  warning: '#F59E0B',
  warningLight: '#FEF3C7', // Light variant of warning
  disabled: '#D1D5DB',
  progressBackground: '#E5E7EB',
  badgeBackground: 'rgba(255, 255, 255, 0.2)', // For badge overlays
  lockedBackground: 'rgba(209, 213, 219, 0.3)', // For locked topic states
};

export const SIZES = {
  logo: 48,
  title: 32,
  subtitle: 16,
  buttonText: 16,
  errorText: 14,
  linkText: 14,
  signUpLink: 15,
  icon: 24,
  headerText: 28,
  smallText: 12,
  mediumText: 16,
  largeText: 20,
  xLargeText: 24,
  cardPadding: 16,
  borderRadius: 12,
  inputHeight: 48,
  smallBorderRadius: 8,
  topicMapNodeLarge: 120, // For section nodes in topic map
  topicMapNodeSmall: 100, // For topic nodes in topic map
  topicMapConnector: 2, // For topic map connector lines
};

export const ANIMATIONS = {
  fadeDuration: 800,
  slideDuration: 600,
  slideDistance: 30,
};

export const LAYOUT = {
  padding: 20,
  headerMarginTop: Dimensions.get('window').height * 0.08,
  orbTopSize: Dimensions.get('window').width * 0.6,
  orbBottomSize: Dimensions.get('window').width * 0.4,
  orbTopOffset: Dimensions.get('window').height * 0.15,
  orbBottomOffset: Dimensions.get('window').height * 0.1,
  sidePanelWidth: 250, // For swipeable side panel
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
};