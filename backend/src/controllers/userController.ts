import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class UserController {
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { firstName, lastName, selectedSubjects, aspiringCourse, goalScore, learningStyle } = req.body;
      
      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          firstName,
          lastName,
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

      res.json({ user, message: 'Profile updated successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async completeOnboarding(req: AuthRequest, res: Response) {
    try {
      const { selectedSubjects, aspiringCourse, goalScore, learningStyle } = req.body;

      // Validate subjects (must be exactly 4)
      if (!selectedSubjects || selectedSubjects.length !== 4) {
        return res.status(400).json({ error: 'Please select exactly 4 subjects' });
      }

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          selectedSubjects,
          aspiringCourse,
          goalScore,
          learningStyle,
          onboardingDone: true
        }
      });

      // Create initial study plan
      await UserController.createInitialStudyPlan(user.id, selectedSubjects);

      res.json({ 
        message: 'Onboarding completed successfully',
        user: {
          id: user.id,
          onboardingDone: user.onboardingDone,
          selectedSubjects: user.selectedSubjects
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  private static async createInitialStudyPlan(userId: number, subjects: string[]) {
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
  }

  static async getDashboardData(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      // Get user progress across subjects
      const userProgress = await prisma.userProgress.findMany({
        where: { userId },
        include: {
          topic: {
            include: { subject: true }
          }
        }
      });

      // Get recent quiz attempts
      const recentQuizzes = await prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          subject: true,
          quizQuestions: {
            include: { question: true }
          }
        }
      });

      // Get current streak
      const streak = await prisma.streak.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });

      // Get pending study tasks
      const pendingTasks = await prisma.studyTask.findMany({
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
      });

      // Calculate overall performance
      const totalQuestions = await prisma.questionAttempt.count({
        where: { userId }
      });

      const correctAnswers = await prisma.questionAttempt.count({
        where: { userId, isCorrect: true }
      });

      const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

      res.json({
        userProgress,
        recentQuizzes,
        streak: streak?.count || 0,
        pendingTasks,
        stats: {
          totalQuestions,
          correctAnswers,
          accuracy: Math.round(accuracy),
          totalStudyTime: 0 // Calculate from study sessions
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}