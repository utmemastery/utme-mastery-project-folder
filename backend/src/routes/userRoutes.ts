import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validateProfileUpdate, validateOnboardingCompletion } from '../middleware/validation';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Profile Management
router.get('/profile', UserController.getProfile);
router.put('/profile', validateProfileUpdate, UserController.updateProfile);
router.post('/complete-onboarding', validateOnboardingCompletion, UserController.completeOnboarding);

// Dashboard & Analytics
router.get('/dashboard', UserController.getDashboardData);
router.get('/analytics', UserController.getAnalytics);
router.get('/weak-topics', UserController.getWeakTopics);

// Study Plan Management
router.get('/study-plan', UserController.getStudyPlan);
router.put('/study-plan/task', UserController.updateStudyPlan);
router.put('/study-plan/regenerate', UserController.regenerateStudyPlan);

// Progress Tracking
router.get('/progress', UserController.getProgress);
router.get('/progress/:subject', UserController.getSubjectProgress);

// Goal Management
router.put('/goal', UserController.updateGoal);
router.get('/goal-progress', UserController.getGoalProgress);

// Achievements & Streaks
router.get('/achievements', UserController.getAchievements);
router.get('/streak', UserController.getStreak);

export default router;