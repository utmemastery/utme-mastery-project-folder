import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate); // All user routes require authentication

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.post('/complete-onboarding', UserController.completeOnboarding);
router.get('/dashboard', UserController.getDashboardData);

export default router;