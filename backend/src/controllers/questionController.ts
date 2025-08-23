import { Request, Response } from 'express';
import { QuestionService } from '../services/questionService';
import { AuthRequest } from '../middleware/auth';
import { DifficultyLevel, CognitiveLevel } from '@prisma/client';

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

      // Strictly typed maps
      const difficultyMap: Record<'easy' | 'medium' | 'hard', DifficultyLevel> = {
        easy: DifficultyLevel.EASY,
        medium: DifficultyLevel.MEDIUM,
        hard: DifficultyLevel.HARD
      };

      const cognitiveLevelMap: Record<
        'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create',
        CognitiveLevel
      > = {
        remember: CognitiveLevel.REMEMBER,
        understand: CognitiveLevel.UNDERSTAND,
        apply: CognitiveLevel.APPLY,
        analyze: CognitiveLevel.ANALYZE,
        evaluate: CognitiveLevel.EVALUATE,
        create: CognitiveLevel.CREATE
      };

      // Narrow types to strings before validation
      const diffKey = typeof difficulty === 'string' ? difficulty : undefined;
      const cogKey = typeof cognitiveLevel === 'string' ? cognitiveLevel : undefined;

      // Validate difficulty and cognitiveLevel if provided
      if (diffKey && !(diffKey in difficultyMap)) {
        return res.status(400).json({ error: `Invalid difficulty: ${diffKey}` });
      }
      if (cogKey && !(cogKey in cognitiveLevelMap)) {
        return res.status(400).json({ error: `Invalid cognitive level: ${cogKey}` });
      }

      let parsedExcludeIds: number[] = [];
      if (excludeIds) {
        try {
          parsedExcludeIds = JSON.parse(excludeIds as string);
          if (!Array.isArray(parsedExcludeIds) || parsedExcludeIds.some(id => typeof id !== 'number')) {
            throw new Error('excludeIds must be an array of numbers');
          }
        } catch (error) {
          return res.status(400).json({ error: 'Invalid excludeIds format' });
        }
      }

      const filters = {
        subject: subject as string,
        topic: topic as string,
        difficulty: diffKey ? difficultyMap[diffKey as keyof typeof difficultyMap] : undefined,
        cognitiveLevel: cogKey ? cognitiveLevelMap[cogKey as keyof typeof cognitiveLevelMap] : undefined,
        excludeIds: parsedExcludeIds,
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
        return res.status(400).json({ error: 'Subjects must be an array of strings' });
      }

      const invalidSubjects = subjects.filter((s: any) => typeof s !== 'string');
      if (invalidSubjects.length > 0) {
        return res.status(400).json({ error: `Invalid subjects: ${invalidSubjects.join(', ')}` });
      }

      const diagnosticQuestions = await QuestionService.getDiagnosticQuestions(subjects);
      
      res.json({ diagnosticQuestions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getDiagnosticQuestionsForSubject(req: AuthRequest, res: Response) {
    try {
      const { subject } = req.params;

      if (!subject || typeof subject !== 'string') {
        return res.status(400).json({ error: 'Subject must be a valid string' });
      }

      const questions = await QuestionService.getDiagnosticQuestionsForSubject(subject);
      
      res.json({ questions });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async submitAnswer(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { questionId, selectedAnswer, timeSpent, practiceSessionId } = req.body;

      if (!questionId || selectedAnswer === undefined || !timeSpent) {
        return res.status(400).json({ error: 'Missing required fields: questionId, selectedAnswer, timeSpent' });
      }

      const parsedQuestionId = parseInt(questionId);
      const parsedSelectedAnswer = parseInt(selectedAnswer);
      const parsedTimeSpent = parseInt(timeSpent);

      if (isNaN(parsedQuestionId) || isNaN(parsedSelectedAnswer) || isNaN(parsedTimeSpent)) {
        return res.status(400).json({ error: 'Invalid number format for questionId, selectedAnswer, or timeSpent' });
      }

      const attempt = await QuestionService.submitQuestionAttempt({
        userId,
        questionId: parsedQuestionId,
        selectedOption: parsedSelectedAnswer,
        timeTaken: parsedTimeSpent,
        practiceSessionId
      });

      res.json({ attempt });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
