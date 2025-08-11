import { Router } from 'express';
import { 
  AuthController, 
  authLimiter, 
  registerValidation, 
  loginValidation 
} from '../controllers/authController';

const router = Router();

router.post('/register', authLimiter, registerValidation, AuthController.register);
router.post('/login', authLimiter, loginValidation, AuthController.login);
router.post('/verify-email', authLimiter, AuthController.verifyEmail);
router.post('/resend-verification', authLimiter, AuthController.resendVerificationCode);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, AuthController.resetPassword);

export default router;