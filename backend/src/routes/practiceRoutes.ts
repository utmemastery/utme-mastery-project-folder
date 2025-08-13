import { Router } from 'express';
import { PracticeController } from '../controllers/practiceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/start-session', PracticeController.startSession);
router.post('/questions/generate', PracticeController.generateQuestions);
router.post('/submit-answer', PracticeController.submitAnswer);
router.post('/end-session', PracticeController.endSession);
router.get('/history', PracticeController.getSessionHistory);
router.get('/analytics/subjects', PracticeController.getSubjectAnalytics);
router.get('/passages', PracticeController.getPassages);
router.post('/offline-sync', PracticeController.syncOfflineData);

export default router;