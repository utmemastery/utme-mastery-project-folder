import { StyleSheet } from 'react-native';
import { COLORS, SIZES, LAYOUT } from '../constants';

export const globalStyles = StyleSheet.create({
  button: {
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.primary,
    elevation: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonContent: {
    paddingVertical: SIZES.cardPadding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.buttonText,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  input: {
    marginTop: 12,
  },
  inputText: {
    color: COLORS.textPrimary,
  },
  label: {
    color: COLORS.primary,
    fontSize: SIZES.mediumText,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: COLORS.errorBackground,
    borderRadius: SIZES.smallBorderRadius,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.errorText,
    textAlign: 'center',
    fontWeight: '500',
  },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.cardPadding,
    ...LAYOUT.cardShadow,
  },
  sectionHeader: {
    fontSize: SIZES.title,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },
  text: {
    fontSize: SIZES.subtitle,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  subText: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.progressBackground,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
});