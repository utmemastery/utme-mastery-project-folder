import { StyleSheet } from 'react-native';
import { COLORS, SIZES, LAYOUT } from '../constants';

export const onboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sectionContainer: {
    backgroundColor: COLORS.formBackground,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.cardPadding,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.cardPadding,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  cardText: {
    fontSize: SIZES.mediumText,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  selectedCardText: {
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.textTertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    padding: LAYOUT.padding,
  },
});