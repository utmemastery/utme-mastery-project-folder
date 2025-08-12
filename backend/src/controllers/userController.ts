import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AnalyticsService } from '../services/analyticsService';
import { StudyPlanService } from '../services/studyPlanService';

const prisma = new PrismaClient();

export class UserController {
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          avatarUrl: true,
          selectedSubjects: true,
          aspiringCourse: true,
          goalScore: true,
          learningStyle: true,
          onboardingDone: true,
          emailVerified: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error: Error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { firstName, lastName, phoneNumber, avatarUrl, selectedSubjects, aspiringCourse, goalScore, learningStyle } = req.body;

      // Validate selectedSubjects if provided
      if (selectedSubjects) {
        const validSubjects = await prisma.subject.findMany({
          where: { name: { in: selectedSubjects } },
          select: { name: true }
        });
        if (validSubjects.length !== selectedSubjects.length) {
          return res.status(400).json({ error: 'One or more selected subjects are invalid' });
        }
      }

      // Validate goalScore if provided
      if (goalScore && (goalScore < 0 || goalScore > 400)) {
        return res.status(400).json({ error: 'Goal score must be between 0 and 400' });
      }

      const updateData = {
        firstName,
        lastName,
        phoneNumber,
        avatarUrl,
        selectedSubjects,
        aspiringCourse,
        goalScore,
        learningStyle,
        onboardingDone: true
      };

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          avatarUrl: true,
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
    } catch (error: Error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async completeOnboarding(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { selectedSubjects, aspiringCourse, goalScore, learningStyle } = req.body;

      // Validate subjects (must be exactly 4 and valid)
      if (!selectedSubjects || selectedSubjects.length !== 4) {
        return res.status(400).json({ error: 'Please select exactly 4 subjects' });
      }

      const validSubjects = await prisma.subject.findMany({
        where: { name: { in: selectedSubjects } },
        select: { name: true }
      });
      if (validSubjects.length !== 4) {
        return res.status(400).json({ error: 'One or more selected subjects are invalid' });
      }

      // Validate goalScore
      if (goalScore && (goalScore < 0 || goalScore > 400)) {
        return res.status(400).json({ error: 'Goal score must be between 0 and 400' });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          selectedSubjects,
          aspiringCourse,
          goalScore,
          learningStyle,
          onboardingDone: true
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          selectedSubjects: true,
          aspiringCourse: true,
          goalScore: true,
          learningStyle: true,
          onboardingDone: true
        }
      });

      // Create initial study plan
      await UserController.createInitialStudyPlan(userId, selectedSubjects);

      res.json({ 
        message: 'Onboarding completed successfully',
        user: {
          id: user.id,
          onboardingDone: user.onboardingDone,
          selectedSubjects: user.selectedSubjects,
          aspiringCourse: user.aspiringCourse,
          goalScore: user.goalScore,
          learningStyle: user.learningStyle
        }
      });
    } catch (error: Error) {
      res.status(500).json({ error: error.message });
    }
  }

  private static async createInitialStudyPlan(userId: number, subjects: string[]) {
    try {
      // Validate subjects exist in Subject model
      const validSubjects = await prisma.subject.findMany({
        where: { name: { in: subjects } },
        select: { name: true }
      });
      if (validSubjects.length !== subjects.length) {
        throw new Error('One or more subjects are invalid');
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6); // 6-month study plan

      const studyPlan = await prisma.studyPlan.create({
        data: {
          userId,
          title: 'UTME Preparation Plan',
          description: 'AI-generated comprehensive study plan for UTME success',
          startDate,
          endDate,
          aiGenerated: true
        }
      });

      // Create initial study tasks for each subject
      const tasks = subjects.map((subject, index) => ({
        studyPlanId: studyPlan.id,
        description: `Complete diagnostic assessment for ${subject}`,
        dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000), // Stagger over days
        priority: 1.0
      }));

      await prisma.studyTask.createMany({
        data: tasks
      });
    } catch (error: Error) {
      throw new Error(`Failed to create initial study plan: ${error.message}`);
    }
  }

  static async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const analytics = await AnalyticsService.getUserAnalytics(userId);
      
      res.json(analytics);
    } catch (error: Error) {
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
    } catch (error: Error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStudyPlan(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const studyPlan = await StudyPlanService.generateStudyPlan(userId);
      
      res.json({ studyPlan });
    } catch (error: Error) {
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
    } catch (error: Error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async regenerateStudyPlan(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const studyPlan = await StudyPlanService.regenerateStudyPlan(userId);
      
      res.json({ 
        studyPlan,
        message: 'Study plan regenerated successfully' 
      });
    } catch (error: Error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const progress = await prisma.userProgress.findMany({
        where: { userId },
        include: {
          topic: { include: { subject: true } },
          subtopic: true
        }
      });

      res.json({ progress });
    } catch (error: Error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSubjectProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { subject } = req.params;

      const subjectExists = await prisma.subject.findUnique({ where: { name: subject } });
      if (!subjectExists) {
        return res.status(404).json({ error: 'Subject not found' });
      }

      const progress = await prisma.userProgress.findMany({
        where: { 
          userId,
          topic: { subject: { name: subject } }
        },
        include: {
          topic: { include: { subject: true } },
          subtopic: true
        }
      });

      res.json({ progress });
    } catch (error: Error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateGoal(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { goalScore } = req.body;

      if (goalScore < 0 || goalScore > 400) {
        return res.status(400).json({ error: 'Goal score must be between 0 and 400' });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { goalScore },
        select: { id: true, goalScore: true }
      });

      res.json({ 
        user,
        message: 'Goal updated successfully' 
      });
    } catch (error: Error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getGoalProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { goalScore: true }
      });

      if (!user || user.goalScore === null) {
        return res.status(404).json({ error: 'No goal score set' });
      }

      const performance = await prisma.performanceSnapshot.findMany({
        where: { userId },
        orderBy: { takenAt: 'desc' },
        take: 1,
        select: { predictedScore: true, confidenceRange: true }
      });

      const latestPerformance = performance[0] || { predictedScore: 0, confidenceRange: 0 };
      const progress = {
        currentScore: latestPerformance.predictedScore,
        confidenceRange: latestPerformance.confidenceRange,
        goalScore: user.goalScore,
        gapToGoal: user.goalScore - latestPerformance.predictedScore
      };

      res.json({ progress });
    } catch (error: Error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAchievements(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const badges = await prisma.badge.findMany({
        where: { userId },
        select: { id: true, type: true, earnedAt: true }
      });

      const leaderboard = await prisma.leaderboard.findMany({
        where: { userId },
        select: { id: true, score: true, period: true, updatedAt: true }
      });

      res.json({ badges, leaderboard });
    } catch (error: Error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStreak(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const streak = await prisma.streak.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        select: { count: true, lastActive: true }
      });

      res.json({ streak: streak || { count: 0, lastActive: null } });
    } catch (error: Error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getDashboardData(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      // Parallel fetch of all dashboard data
      const [analytics, weakTopics, studyPlan, recentSessions, userProgress, recentQuizzes, streak, pendingTasks, studySessions] = await Promise.all([
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
        }),
        prisma.userProgress.findMany({
          where: { userId },
          include: {
            topic: {
              include: { subject: true }
            }
          }
        }),
        prisma.quizAttempt.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            subject: true,
            quizQuestions: {
              include: { question: true }
            }
          }
        }),
        prisma.streak.findFirst({
          where: { userId },
          orderBy: { updatedAt: 'desc' }
        }),
        prisma.studyTask.findMany({
          where: {
            studyPlan: { userId },
            completed: false,
            dueDate: { gte: new Date() }
          },
          orderBy: { dueDate: 'asc' },
          take: 5,
          include: {
            topic: true,
            question: true,
            flashcard: true
          }
        }),
        prisma.studySession.findMany({
          where: { userId },
          select: { duration: true }
        })
      ]);

      // Calculate overall performance
      const totalQuestions = await prisma.questionAttempt.count({
        where: { userId }
      });

      const correctAnswers = await prisma.questionAttempt.count({
        where: { userId, isCorrect: true }
      });

      const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      const totalStudyTime = studySessions.reduce((sum, session) => sum + (session.duration || 0), 0);

      res.json({
        analytics,
        weakTopics,
        todaysStudyPlan: studyPlan,
        recentSessions,
        userProgress,
        recentQuizzes,
        streak: streak?.count || 0,
        pendingTasks,
        stats: {
          totalQuestions,
          correctAnswers,
          accuracy: Math.round(accuracy),
          totalStudyTime
        }
      });
    } catch (error: Error) {
      res.status(500).json({ error: error.message });
    }
  }
}