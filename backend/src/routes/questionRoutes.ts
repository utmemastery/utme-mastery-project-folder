// backend/src/routes/questionRoutes.ts
import { Router } from 'express';
import { QuestionController } from '../controllers/questionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate); // All routes require authentication

router.get('/adaptive', QuestionController.getAdaptiveQuestions);
router.post('/diagnostic', QuestionController.getDiagnosticQuestions);
router.get('/diagnostic/:subject', QuestionController.getDiagnosticQuestionsForSubject);
router.post('/submit', QuestionController.submitAnswer);

export default router;