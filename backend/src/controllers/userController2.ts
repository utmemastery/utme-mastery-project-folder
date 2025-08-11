// backend/src/controllers/userController.ts
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AnalyticsService } from '../services/analyticsService';
import { StudyPlanService } from '../services/studyPlanService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserController {
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
          selectedSubjects: true,
          aspiringCourse: true,
          goalScore: true,
          learningStyle: true,
          onboardingDone: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.email; // Email changes should go through verification
      delete updateData.createdAt;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
          selectedSubjects: true,
          aspiringCourse: true,
          goalScore: true,
          learningStyle: true,
          onboardingDone: true
        }
      });

      res.json({ 
        user: updatedUser,
        message: 'Profile updated successfully' 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const analytics = await AnalyticsService.getUserAnalytics(userId);
      
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getWeakTopics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { limit = 5 } = req.query;
      
      const weakTopics = await AnalyticsService.getWeakTopics(
        userId, 
        parseInt(limit as string)
      );
      
      res.json({ weakTopics });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStudyPlan(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const studyPlan = await StudyPlanService.generateStudyPlan(userId);
      
      res.json({ studyPlan });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateStudyPlan(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { taskId, status, timeSpent } = req.body;

      const updatedTask = await StudyPlanService.updateTaskStatus(
        userId,
        taskId,
        status,
        timeSpent
      );

      res.json({ 
        task: updatedTask,
        message: 'Study plan updated successfully' 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getDashboardData(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      
      // Parallel fetch of all dashboard data
      const [analytics, weakTopics, studyPlan, recentSessions] = await Promise.all([
        AnalyticsService.getUserAnalytics(userId),
        AnalyticsService.getWeakTopics(userId, 3),
        StudyPlanService.getTodaysPlan(userId),
        prisma.practiceSession.findMany({
          where: { userId },
          orderBy: { startTime: 'desc' },
          take: 5,
          select: {
            id: true,
            subject: true,
            sessionType: true,
            correctAnswers: true,
            answeredQuestions: true,
            startTime: true
          }
        })
      ]);

      res.json({
        analytics,
        weakTopics,
        todaysStudyPlan: studyPlan,
        recentSessions
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}