// backend/src/routes/flashcardRoutes.ts
import { Router } from 'express';
import { FlashcardController } from '../controllers/flashcardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/review', FlashcardController.getFlashcardsForReview);
router.post('/attempt', FlashcardController.submitFlashcardAttempt);
router.post('/create', FlashcardController.createFlashcard);

export default router;