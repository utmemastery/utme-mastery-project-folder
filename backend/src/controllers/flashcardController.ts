// backend/src/controllers/flashcardController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FlashcardService } from '../services/flashcardService';

export class FlashcardController {
  static async getFlashcardsForReview(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { limit = 20 } = req.query;

      const flashcards = await FlashcardService.getFlashcardsForReview(
        userId,
        parseInt(limit as string)
      );

      res.json({ flashcards });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async submitFlashcardAttempt(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { flashcardId, response, timeSpent } = req.body;

      if (!flashcardId || !response || !timeSpent) {
        return res.status(400).json({
          error: 'Flashcard ID, response, and time spent are required'
        });
      }

      const attempt = await FlashcardService.submitFlashcardAttempt({
        userId,
        flashcardId: parseInt(flashcardId),
        response,
        timeSpent: parseInt(timeSpent)
      });

      res.json({
        attempt,
        message: 'Flashcard attempt submitted successfully'
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async createFlashcard(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const cardData = req.body;

      if (!cardData.front || !cardData.back || !cardData.subject) {
        return res.status(400).json({
          error: 'Front, back, and subject are required'
        });
      }

      const flashcard = await FlashcardService.createCustomFlashcard(userId, cardData);

      res.status(201).json({
        flashcard,
        message: 'Flashcard created successfully'
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}