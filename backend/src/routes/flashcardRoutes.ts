// backend/src/routes/flashcardRoutes.ts
import { Router } from 'express';
import { FlashcardController } from '../controllers/flashcardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/review', FlashcardController.getFlashcardsForReview);
router.post('/flashcards/review', FlashcardController.submitFlashcardReview);
router.post('/create', FlashcardController.createFlashcard);

export default router;