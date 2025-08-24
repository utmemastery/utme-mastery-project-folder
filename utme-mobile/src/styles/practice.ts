import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, SIZES, LAYOUT } from '../constants';

const { width } = Dimensions.get('window');

export const practiceStyles = StyleSheet.create({
  // PracticeHomeScreen styles
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 10,
  },
  orbTop: {
    position: 'absolute',
    top: LAYOUT.orbTopOffset,
    right: -0.25 * LAYOUT.orbTopSize,
    width: LAYOUT.orbTopSize,
    height: LAYOUT.orbTopSize,
    borderRadius: LAYOUT.orbTopSize / 2,
    backgroundColor: COLORS.orbBlue,
    transform: [{ rotate: '20deg' }],
  },
  orbBottom: {
    position: 'absolute',
    bottom: LAYOUT.orbBottomOffset,
    left: -0.2 * LAYOUT.orbBottomSize,
    width: LAYOUT.orbBottomSize,
    height: LAYOUT.orbBottomSize,
    borderRadius: LAYOUT.orbBottomSize / 2,
    backgroundColor: COLORS.orbGold,
    transform: [{ rotate: '-40deg' }],
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    padding: LAYOUT.padding,
    paddingTop: LAYOUT.padding + 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.headerText,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: SIZES.subtitle,
    color: COLORS.white,
    opacity: 0.9,
    fontStyle: 'italic',
  },
  streakContainer: {
    marginTop: 12,
  },
  streakText: {
    color: COLORS.white,
    fontSize: SIZES.mediumText,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: LAYOUT.padding,
  },
  performanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.cardPadding,
    ...LAYOUT.cardShadow,
  },
  cardTitle: {
    fontSize: SIZES.title,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  performanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masteryCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.cardPadding,
  },
  masteryPercent: {
    fontSize: SIZES.largeText,
    fontWeight: '700',
    color: COLORS.white,
  },
  masteryLabel: {
    fontSize: SIZES.smallText,
    color: COLORS.white,
    opacity: 0.9,
  },
  performanceStats: {
    flex: 1,
  },
  performanceText: {
    fontSize: SIZES.mediumText,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
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
  performanceSubText: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SIZES.cardPadding * 2,
  },
  sectionTitle: {
    fontSize: SIZES.title,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.cardPadding,
  },
  modesScroll: {
    marginBottom: SIZES.cardPadding,
  },
  modeCard: {
    width: width * 0.7,
    padding: SIZES.cardPadding,
    borderRadius: SIZES.borderRadius,
    marginRight: SIZES.cardPadding,
    ...LAYOUT.cardShadow,
  },
  smartReviewCard: {
    backgroundColor: COLORS.primary,
  },
  adaptiveCard: {
    backgroundColor: COLORS.secondary,
  },
  timedCard: {
    backgroundColor: COLORS.warning,
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: SIZES.mediumText,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  modeSubtitle: {
    fontSize: SIZES.smallText,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 2,
  },
  modeDetail: {
    fontSize: SIZES.smallText,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 16,
  },
  modeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.smallBorderRadius,
    alignItems: 'center',
  },
  modeButtonText: {
    color: COLORS.white,
    fontSize: SIZES.smallText,
    fontWeight: '600',
  },
  subjectsScroll: {
    marginBottom: SIZES.cardPadding,
  },
  subjectCard: {
    width: width * 0.4,
    padding: SIZES.cardPadding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    marginRight: SIZES.cardPadding,
    ...LAYOUT.cardShadow,
  },
  subjectHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: SIZES.cardPadding,
  },
  subjectIcon: {
    fontSize: SIZES.mediumText,
  },
  subjectName: {
    fontSize: SIZES.mediumText,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  subjectMastery: {
    fontSize: SIZES.largeText,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  subjectTrend: {
    marginBottom: 4,
  },
  trendText: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
  },
  trendUp: {
    color: COLORS.success,
  },
  trendDown: {
    color: COLORS.error,
  },
  trendFlat: {
    color: COLORS.textSecondary,
  },
  subjectWeak: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  weakArea: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  subjectButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.smallBorderRadius,
    alignItems: 'center',
  },
  subjectButtonText: {
    color: COLORS.white,
    fontSize: SIZES.smallText,
    fontWeight: '600',
  },
  recommendationsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.cardPadding,
    ...LAYOUT.cardShadow,
  },
  priorityAreas: {
    marginBottom: SIZES.cardPadding,
  },
  priorityTitle: {
    fontSize: SIZES.mediumText,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  priorityItem: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  insightText: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  personalizedButton: {
    paddingVertical: SIZES.cardPadding,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // PracticeSessionScreen styles
  sessionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: LAYOUT.padding,
    backgroundColor: COLORS.white,
    ...LAYOUT.cardShadow,
  },
  pauseButton: {
    padding: 8,
  },
  questionCounter: {
    fontSize: SIZES.mediumText,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  timer: {
    fontSize: SIZES.mediumText,
    color: COLORS.primary,
  },
  accuracyBadge: {
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  accuracyText: {
    color: COLORS.white,
    fontSize: SIZES.smallText,
    fontWeight: '600',
  },
  sidePanelToggle: {
    position: 'absolute',
    top: LAYOUT.padding,
    right: LAYOUT.padding,
    zIndex: 1,
  },
  sessionContent: {
    flex: 1,
    padding: LAYOUT.padding,
  },
  questionContainer: {
    marginBottom: SIZES.cardPadding,
  },
  breadcrumb: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  questionText: {
    fontSize: SIZES.mediumText,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.cardPadding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    marginBottom: 8,
    ...LAYOUT.cardShadow,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  optionBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetter: {
    color: COLORS.white,
    fontSize: SIZES.smallText,
    fontWeight: '600',
  },
  optionText: {
    flex: 1,
    fontSize: SIZES.mediumText,
    color: COLORS.textPrimary,
  },
  selectedIndicator: {
    fontSize: SIZES.smallText,
    color: COLORS.primary,
    marginLeft: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  confidenceLabel: {
    fontSize: SIZES.mediumText,
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  confidenceSlider: {
    flexDirection: 'row',
    flex: 1,
  },
  confidenceLevel: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.progressBackground,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  confidenceFilled: {
    backgroundColor: COLORS.primary,
  },
  confidencePercent: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  controlsContainer: {
    justifyContent: 'space-between',
    padding: LAYOUT.padding,
    backgroundColor: COLORS.white,
    ...LAYOUT.cardShadow,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  controlText: {
    fontSize: SIZES.smallText,
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 16,
  },
  nextText: {
    color: COLORS.white,
    fontSize: SIZES.smallText,
    fontWeight: '600',
    marginRight: 4,
  },
  sidePanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.7,
    backgroundColor: COLORS.white,
    padding: LAYOUT.padding,
    ...LAYOUT.cardShadow,
  },
  sidePanelTitle: {
    fontSize: SIZES.title,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.cardPadding,
  },
  progressOverview: {
    marginBottom: SIZES.cardPadding,
  },
  progressText: {
    fontSize: SIZES.mediumText,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  questionList: {
    flex: 1,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.cardPadding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.progressBackground,
  },
  currentQuestionItem: {
    backgroundColor: COLORS.primaryLight,
  },
  questionNumber: {
    fontSize: SIZES.mediumText,
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  questionStatus: {
    fontSize: SIZES.mediumText,
    marginRight: 8,
  },
  questionTitle: {
    flex: 1,
    fontSize: SIZES.smallText,
    color: COLORS.textPrimary,
  },
  sessionStats: {
    marginVertical: SIZES.cardPadding,
  },
  statText: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  sidePanelControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sidePanelButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.smallBorderRadius,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  sidePanelButtonText: {
    color: COLORS.white,
    fontSize: SIZES.smallText,
    fontWeight: '600',
  },

  // PostPracticeAnalysisScreen styles
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.cardPadding,
    ...LAYOUT.cardShadow,
    marginBottom: SIZES.cardPadding,
  },
  celebrationText: {
    fontSize: SIZES.title,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.cardPadding,
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: SIZES.cardPadding,
  },
  finalScore: {
    fontSize: SIZES.headerText,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  scoreProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.progressBackground,
    marginHorizontal: 4,
  },
  scoreDotFilled: {
    backgroundColor: COLORS.primary,
  },
  scoreDetails: {
    fontSize: SIZES.mediumText,
    color: COLORS.textPrimary,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
  },
  analysisCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.cardPadding,
    ...LAYOUT.cardShadow,
    marginBottom: SIZES.cardPadding,
  },
  strengthsSection: {
    marginBottom: SIZES.cardPadding,
  },
  weaknessesSection: {
    marginBottom: SIZES.cardPadding,
  },
  strengthItem: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  weaknessItem: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  insightSection: {
    marginBottom: SIZES.cardPadding,
  },
  tipItem: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  actionsContainer: {
    marginBottom: SIZES.cardPadding,
  },
  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.cardPadding,
    marginBottom: SIZES.cardPadding,
    ...LAYOUT.cardShadow,
  },
  reviewCard: {
    backgroundColor: COLORS.primaryLight,
  },
  practiceCard: {
    backgroundColor: COLORS.secondaryLight,
  },
  scheduleCard: {
    backgroundColor: COLORS.warningLight,
  },
  shareCard: {
    backgroundColor: COLORS.successLight,
  },
  actionTitle: {
    fontSize: SIZES.mediumText,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  actionDetail: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.smallBorderRadius,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: SIZES.smallText,
    fontWeight: '600',
  },
    topicMap: {
    padding: SIZES.cardPadding,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    ...LAYOUT.cardShadow,
  },
  sectionNode: {
    marginBottom: SIZES.cardPadding,
  },
  sectionName: {
    fontSize: SIZES.mediumText,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  topicNodes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topicNode: {
    padding: 10,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.smallBorderRadius,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedNode: {
    backgroundColor: COLORS.lockedBackground,
    opacity: 0.7,
  },
  topicText: {
    fontSize: SIZES.smallText,
    color: COLORS.textPrimary,
  },
    hintContainer: {
    marginTop: SIZES.cardPadding,
    padding: SIZES.cardPadding,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius,
  },
  hintText: {
    fontSize: SIZES.smallText,
    color: COLORS.textSecondary,
  },
    achievements: {
    marginTop: SIZES.cardPadding,
  },
  badgeCard: {
    padding: 8,
    backgroundColor: COLORS.badgeBackground,
    borderRadius: SIZES.smallBorderRadius,
    marginRight: 8,
  },
  badgeText: {
    fontSize: SIZES.smallText,
    color: COLORS.textPrimary,
  },
});