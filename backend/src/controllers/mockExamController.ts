import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth'; 
import { MockExamService } from '../services/mockExamService';
import { QuestionService } from '../services/questionService';
import { ExamType } from '@prisma/client';

export class MockExamController {
  static async getMockExams(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id; // Changed from userId
      const mockExams = await MockExamService.getAvailableMockExams(userId);
      
      res.json({
        success: true,
        mockExams
      });
    } catch (error) {
      console.error('Get mock exams error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch mock exams'
      });
    }
  }

  static async getRecentScores(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id; // Changed from userId
      const scores = await MockExamService.getRecentScores(userId, 10);
      
      res.json({
        success: true,
        scores
      });
    } catch (error) {
      console.error('Get recent scores error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recent scores'
      });
    }
  }

  static async startMockExam(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id; // Changed from userId
      const { type, subjects, timeLimit, questionCount, title, description } = req.body;

      // Validate examType
      if (!Object.values(ExamType).includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid exam type'
        });
      }

      // Generate questions for the mock exam
      const questions = await QuestionService.generateMockExamQuestions({
        subjects,
        questionCount,
        userId
      });

      if (questions.length < questionCount) {
        return res.status(400).json({
          success: false,
          error: 'Not enough questions available for the selected subjects'
        });
      }

      // Create mock exam session
      const exam = await MockExamService.createMockExam({
        userId,
        examType: type as ExamType,
        subjects,
        questions: questions.slice(0, questionCount),
        title: title || `Mock Exam ${new Date().toISOString().split('T')[0]}`,
        description: description || undefined,
        timeLimit,
        startTime: new Date()
      });

      res.json({
        success: true,
        exam: {
          id: exam.id,
          type: exam.examType,
          subjects: exam.mockExamSubjects.map(s => s.subject.name),
          questions: exam.questions.map(q => ({
            id: q.questionId,
            text: q.question.text,
            options: q.question.options,
            subject: q.question.subject.name,
            topic: q.question.topic?.name ?? null,
            difficulty: q.question.difficulty
            // Note: Correct answer is not sent to frontend
          })),
          timeLimit: exam.timeLimit,
          startTime: exam.startTime
        }
      });
    } catch (error) {
      console.error('Start mock exam error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start mock exam'
      });
    }
  }

  static async submitMockExam(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id; // Changed from userId
      const { examId, answers } = req.body;

      // Process the mock exam submission
      const results = await MockExamService.submitMockExam({
        examId,
        userId,
        answers
      });

      res.json({
        success: true,
        results
      });
    } catch (error) {
      console.error('Submit mock exam error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit mock exam'
      });
    }
  }

  static async getMockExamResults(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id; // Changed from userId
      const { examId } = req.params;

      const results = await MockExamService.getMockExamResults(Number(examId), userId);

      if (!results) {
        return res.status(404).json({
          success: false,
          error: 'Mock exam results not found'
        });
      }

      res.json({
        success: true,
        results
      });
    } catch (error) {
      console.error('Get mock exam results error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch mock exam results'
      });
    }
  }

  static async getMockExamHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id; // Changed from userId
      const { page = 1, limit = 20 } = req.query;

      const history = await MockExamService.getMockExamHistory(
        userId, 
        parseInt(page as string), 
        parseInt(limit as string)
      );

      res.json({
        success: true,
        history: history.exams,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: history.total,
          pages: Math.ceil(history.total / parseInt(limit as string))
        }
      });
    } catch (error) {
      console.error('Get mock exam history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch mock exam history'
      });
    }
  }

  static async resumeMockExam(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id; // Changed from userId
      const { examId } = req.params;

      const exam = await MockExamService.getIncompleteMockExam(Number(examId), userId);

      if (!exam) {
        return res.status(404).json({
          success: false,
          error: 'Mock exam not found or already completed'
        });
      }

      res.json({
        success: true,
        exam
      });
    } catch (error) {
      console.error('Resume mock exam error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resume mock exam'
      });
    }
  }
}