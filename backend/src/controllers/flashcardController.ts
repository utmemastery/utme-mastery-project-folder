import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FlashcardService } from '../services/flashcardService';

export class FlashcardController {
  static async getFlashcardsForReview(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { limit = 20 } = req.query;
      const parsedLimit = parseInt(limit as string);

      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return res.status(400).json({ error: 'Invalid limit value' });
      }

      const flashcards = await FlashcardService.getFlashcardsForReview(
        userId,
        parsedLimit
      );

      res.json({ flashcards });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async submitFlashcardReview(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { flashcardId, response, timeSpent } = req.body;

      if (!flashcardId || !response || !timeSpent) {
        return res.status(400).json({
          error: 'flashcardId, response, and timeSpent are required'
        });
      }

      const validResponses = ['again', 'hard', 'good', 'easy'];
      if (!validResponses.includes(response)) {
        return res.status(400).json({ error: 'Invalid response value' });
      }

      const parsedFlashcardId = parseInt(flashcardId);
      const parsedTimeSpent = parseInt(timeSpent);

      if (isNaN(parsedFlashcardId) || isNaN(parsedTimeSpent)) {
        return res.status(400).json({ error: 'Invalid flashcardId or timeSpent format' });
      }

      const attempt = await FlashcardService.submitFlashcardReview({
        userId,
        flashcardId: parsedFlashcardId,
        response: response as 'again' | 'hard' | 'good' | 'easy',
        timeSpent: parsedTimeSpent
      });

      res.json({
        attempt,
        message: 'Flashcard review submitted successfully'
      });
    } catch (error: any) {
      res.status(error.message.includes('not found') ? 404 : 500).json({ error: error.message });
    }
  }

  static async createFlashcard(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const cardData = req.body;

      if (!cardData.front || !cardData.back || !cardData.subject || !cardData.topic) {
        return res.status(400).json({
          error: 'front, back, subject, and topic are required'
        });
      }

      // Map front/back to prompt/answer for the service
      const mappedCardData = {
        ...cardData,
        prompt: cardData.front,
        answer: cardData.back
      };

      const flashcard = await FlashcardService.createCustomFlashcard(userId, mappedCardData);

      res.status(201).json({
        flashcard,
        message: 'Flashcard created successfully'
      });
    } catch (error: any) {
      res.status(error.message.includes('Invalid') ? 400 : 500).json({ error: error.message });
    }
  }
}