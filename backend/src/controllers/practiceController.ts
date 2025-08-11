// backend/src/controllers/practiceController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class PracticeController {
  static async startSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { 
        subject, 
        topic, 
        difficulty, 
        questionCount = 10, 
        sessionType = 'practice' 
      } = req.body;

      // Generate session ID
      const sessionId = uuidv4();

      // Get questions based on criteria
      const questions = await prisma.question.findMany({
        where: {
          subject: { name: subject },
          ...(topic && { topic: { name: topic } }),
          ...(difficulty && { difficulty }),
          status: 'ACTIVE'
        },
        include: {
          subject: true,
          topic: true
        },
        orderBy: { createdAt: 'desc' },
        take: questionCount
      });

      if (questions.length === 0) {
        return res.status(404).json({ error: 'No questions found for the specified criteria' });
      }

      // Create practice session
      const session = await prisma.practiceSession.create({
        data: {
          id: sessionId,
          userId,
          subject,
          topic,
          sessionType,
          totalQuestions: questions.length,
          startTime: new Date()
        }
      });

      res.json({ 
        sessionId,
        questions: questions.map(q => ({
          id: q.id,
          question: q.question,
          options: q.options,
          difficulty: q.difficulty,
          topic: q.topic.name,
          subject: q.subject.name,
          cognitiveLevel: q.cognitiveLevel,
          // Don't send correct answer or explanation yet
        })),
        session 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async submitAnswer(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { sessionId, questionId, selectedAnswer, timeSpent, confidenceLevel } = req.body;

      // Verify session belongs to user
      const session = await prisma.practiceSession.findFirst({
        where: { id: sessionId, userId }
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Get question details
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { topic: true }
      });

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      const isCorrect = selectedAnswer === question.correctAnswer;

      // Create question attempt
      const attempt = await prisma.questionAttempt.create({
        data: {
          userId,
          questionId,
          selectedAnswer,
          isCorrect,
          timeSpent,
          confidenceLevel,
          sessionId
        }
      });

      // Update session progress
      await prisma.practiceSession.update({
        where: { id: sessionId },
        data: {
          answeredQuestions: { increment: 1 },
          correctAnswers: isCorrect ? { increment: 1 } : undefined
        }
      });

      res.json({ 
        attempt,
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        message: 'Answer submitted successfully' 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async endSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { sessionId } = req.body;

      // Update session end time
      const session = await prisma.practiceSession.update({
        where: { id: sessionId },
        data: { endTime: new Date() },
        include: {
          questionAttempts: true
        }
      });

      // Calculate final statistics
      const totalTime = session.endTime!.getTime() - session.startTime.getTime();
      const accuracy = session.answeredQuestions > 0 
        ? (session.correctAnswers / session.answeredQuestions) * 100 
        : 0;

      res.json({
        session: {
          ...session,
          accuracy: Math.round(accuracy),
          totalTimeSeconds: Math.round(totalTime / 1000)
        },
        message: 'Session ended successfully'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSessionHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 10 } = req.query;

      const sessions = await prisma.practiceSession.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        include: {
          questionAttempts: {
            include: {
              question: {
                include: {
                  topic: true,
                  subject: true
                }
              }
            }
          }
        }
      });

      const total = await prisma.practiceSession.count({
        where: { userId }
      });

      res.json({
        sessions: sessions.map(session => ({
          ...session,
          accuracy: session.answeredQuestions > 0 
            ? Math.round((session.correctAnswers / session.answeredQuestions) * 100)
            : 0
        })),
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}