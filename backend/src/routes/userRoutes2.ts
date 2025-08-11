// backend/src/routes/userRoutes.ts
import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Profile routes
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

// Analytics routes
router.get('/analytics', UserController.getAnalytics);
router.get('/weak-topics', UserController.getWeakTopics);

// Study plan routes
router.get('/study-plan', UserController.getStudyPlan);
router.put('/study-plan/task', UserController.updateStudyPlan);

// Dashboard data
router.get('/dashboard', UserController.getDashboardData);

export default router;