// backend/src/controllers/questionController.ts
import { Request, Response } from 'express';
import { QuestionService } from '../services/questionService';
import { AuthRequest } from '../middleware/auth';

export class QuestionController {
  static async getAdaptiveQuestions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { 
        subject, 
        topic, 
        difficulty, 
        cognitiveLevel, 
        count = 10,
        excludeIds 
      } = req.query;

      const filters = {
        subject: subject as string,
        topic: topic as string,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        cognitiveLevel: cognitiveLevel as 'recall' | 'comprehension' | 'application' | 'analysis',
        excludeIds: excludeIds ? JSON.parse(excludeIds as string) : [],
        userId
      };

      const questions = await QuestionService.getAdaptiveQuestions(
        userId, 
        filters, 
        parseInt(count as string)
      );

      res.json({ questions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getDiagnosticQuestions(req: AuthRequest, res: Response) {
    try {
      const { subjects } = req.body;
      
      if (!subjects || !Array.isArray(subjects)) {
        return res.status(400).json({ error: 'Subjects array is required' });
      }

      const diagnosticQuestions = await QuestionService.getDiagnosticQuestions(subjects);
      
      res.json({ diagnosticQuestions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async submitAnswer(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { 
        questionId, 
        selectedAnswer, 
        timeSpent, 
        confidenceLevel, 
        sessionId 
      } = req.body;

      if (!questionId || selectedAnswer === undefined || !timeSpent) {
        return res.status(400).json({ 
          error: 'Question ID, selected answer, and time spent are required' 
        });
      }

      const attempt = await QuestionService.submitQuestionAttempt({
        userId,
        questionId: parseInt(questionId),
        selectedAnswer: parseInt(selectedAnswer),
        timeSpent: parseInt(timeSpent),
        confidenceLevel: confidenceLevel ? parseInt(confidenceLevel) : undefined,
        sessionId
      });

      res.json({ 
        attempt,
        message: 'Answer submitted successfully' 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}