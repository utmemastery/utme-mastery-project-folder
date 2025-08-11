// backend/src/routes/practiceRoutes.ts
import { Router } from 'express';
import { PracticeController } from '../controllers/practiceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/start-session', PracticeController.startSession);
router.post('/submit-answer', PracticeController.submitAnswer);
router.post('/end-session', PracticeController.endSession);
router.get('/history', PracticeController.getSessionHistory);

export default router;