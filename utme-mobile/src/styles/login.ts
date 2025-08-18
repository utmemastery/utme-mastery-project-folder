import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, SIZES, LAYOUT } from '../constants';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  keyboardAvoiding: { flex: 1 },
  scrollView: { flexGrow: 1 },
  content: { flex: 1, padding: 24 },

  // BackgroundDecorations
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
  },
  orbTop: {
    position: 'absolute',
    top: LAYOUT.orbTopOffset,
    right: -width * 0.2,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: COLORS.orbBlue,
    transform: [{ rotate: '45deg' }],
  },
  orbBottom: {
    position: 'absolute',
    bottom: LAYOUT.orbBottomOffset,
    left: -width * 0.15,
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: COLORS.orbGold,
    transform: [{ rotate: '-30deg' }],
  },

  // Header
  headerContainer: { 
    alignItems: 'center', 
    marginTop: LAYOUT.headerMarginTop, 
    marginBottom: 24 
  },
  logoContainer: {
    backgroundColor: COLORS.formBackground,
    borderRadius: 100,
    padding: 12,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: COLORS.formBorder,
  },
  logo: { 
    fontSize: SIZES.logo, 
    color: COLORS.white 
  },
  title: { 
    fontSize: SIZES.title, 
    fontWeight: '800', 
    color: COLORS.primary, 
    marginBottom: 8, 
    letterSpacing: -0.5 
  },
  subtitle: { 
    fontSize: SIZES.subtitle, 
    color: COLORS.primary, 
    textAlign: 'center', 
    fontWeight: '700', 
    lineHeight: 22 
  },

  // LoginForm
  formContainer: {
    backgroundColor: COLORS.formBackground,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  eyeIcon: { 
    color: COLORS.secondary, 
    fontWeight: '600', 
    fontSize: SIZES.linkText 
  },
  loadingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  loadingText: { 
    color: COLORS.white, 
    fontSize: SIZES.buttonText, 
    fontWeight: '600', 
    marginRight: 8 
  },
  spinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: COLORS.white,
  },
  forgotPasswordContainer: { 
    alignItems: 'center', 
    marginBottom: 8 
  },
  forgotPassword: { 
    color: COLORS.primary, 
    fontSize: SIZES.linkText, 
    fontWeight: '500', 
    textAlign: 'center' 
  },

  // FooterLinks
  footerContainer: { 
    alignItems: 'center', 
    marginTop: 'auto', 
    paddingBottom: 32 
  },
  signUpButton: {
    backgroundColor: COLORS.formBackground,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.formBorder,
  },
  signUpText: { 
    color: COLORS.primary, 
    fontSize: SIZES.linkText, 
    textAlign: 'center' 
  },
  signUpLink: { 
    color: COLORS.secondary, 
    fontWeight: '700', 
    fontSize: SIZES.signUpLink 
  },
});