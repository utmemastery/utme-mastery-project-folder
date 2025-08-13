import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PracticeService } from '../services/practiceService';

export class PracticeController {
  static async startSession(req: AuthRequest, res: Response) {
    try {
      const { subject, topics, difficulty, questionCount } = req.body;
      if (!subject) {
        return res.status(400).json({ error: 'Subject is required' });
      }
      const data = await PracticeService.startSession(req.user!.id, {
        subject,
        topics,
        difficulty,
        questionCount: questionCount ? parseInt(questionCount) : undefined
      });
      res.json(data);
    } catch (error: any) {
      res.status(error.message.includes('Invalid') ? 400 : 500).json({ error: error.message });
    }
  }

  static async generateQuestions(req: AuthRequest, res: Response) {
    try {
      const { subject, topics, difficulty, count, excludeAnswered } = req.body;
      if (!subject || !count) {
        return res.status(400).json({ error: 'Subject and count are required' });
      }
      const questions = await PracticeService.generateQuestions(req.user!.id, {
        subject,
        topics,
        difficulty,
        count: parseInt(count),
        excludeAnswered
      });
      res.json({ questions });
    } catch (error: any) {
      res.status(error.message.includes('Invalid') ? 400 : 500).json({ error: error.message });
    }
  }

  static async submitAnswer(req: AuthRequest, res: Response) {
    try {
      const { sessionId, questionId, selectedOption, timeTaken, confidenceLevel } = req.body;
      if (!sessionId || !questionId || selectedOption === undefined) {
        return res.status(400).json({ error: 'sessionId, questionId, and selectedOption are required' });
      }
      const data = await PracticeService.submitAnswer(req.user!.id, {
        sessionId,
        questionId: parseInt(questionId),
        selectedOption: parseInt(selectedOption),
        timeTaken: timeTaken ? parseInt(timeTaken) : undefined,
        confidenceLevel: confidenceLevel ? parseInt(confidenceLevel) : undefined
      });
      res.json({ ...data, message: 'Answer submitted successfully' });
    } catch (error: any) {
      res.status(error.message.includes('not found') ? 404 : 500).json({ error: error.message });
    }
  }

  static async endSession(req: AuthRequest, res: Response) {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }
      const data = await PracticeService.endSession(req.user!.id, sessionId);
      res.json({ session: data, message: 'Session ended successfully' });
    } catch (error: any) {
      res.status(error.message.includes('not found') ? 404 : 500).json({ error: error.message });
    }
  }

  static async getSessionHistory(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const parsedPage = parseInt(page as string);
      const parsedLimit = parseInt(limit as string);
      if (isNaN(parsedPage) || isNaN(parsedLimit)) {
        return res.status(400).json({ error: 'Invalid page or limit' });
      }
      const data = await PracticeService.getSessionHistory(
        req.user!.id,
        parsedPage,
        parsedLimit
      );
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSubjectAnalytics(req: AuthRequest, res: Response) {
    try {
      const { subjects } = req.query;
      if (!subjects) {
        return res.status(400).json({ error: 'Subjects are required' });
      }
      const data = await PracticeService.getSubjectAnalytics(
        req.user!.id,
        (subjects as string).split(',')
      );
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }


  static async getPassages(req: AuthRequest, res: Response) {
    try {
      const { subject } = req.query;
      if (!subject) {
        return res.status(400).json({ error: 'Subject is required' });
      }
      const passages = await PracticeService.getPassages(req.user!.id, subject as string);
      res.json({ passages });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async syncOfflineData(req: AuthRequest, res: Response) {
    try {
      const { resourceType, resourceId, action, data } = req.body;
      await PracticeService.syncOfflineData(req.user!.id, { resourceType, resourceId, action, data });
      res.json({ message: 'Offline data synced successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}