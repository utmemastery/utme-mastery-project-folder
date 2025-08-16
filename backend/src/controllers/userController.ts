import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AnalyticsService } from '../services/analyticsService';
import { StudyPlanService } from '../services/studyPlanService';
import { StudyTaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

const COURSE_SUBJECT_REQUIREMENTS = {
  medicine: ['english', 'physics', 'chemistry', 'biology'],
  engineering: ['english', 'mathematics', 'physics', 'chemistry'],
  law: ['english', 'mathematics', 'literature', 'government'],
  pharmacy: ['english', 'physics', 'chemistry', 'biology'],
  computer_science: ['english', 'mathematics', 'physics', 'chemistry'],
  accounting: ['english', 'mathematics', 'economics', 'government'],
  business_admin: ['english', 'mathematics', 'economics', 'government'],
  economics: ['english', 'mathematics', 'economics', 'government'],
  psychology: ['english', 'mathematics', 'biology', 'government'],
  mass_comm: ['english', 'mathematics', 'literature', 'government']
};

export class UserController {
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      // Validate userId
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

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
          createdAt: true,
          preferredStudyTime: true,
          studyReminders: true,
          examYear: true,
          dateOfBirth: true,
          state: true,
          school: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ profile: user }); // Align with frontend's expected key
    } catch (error: any) {
      res.status(500).json({ error: `Failed to fetch profile: ${error.message}` });
    }
  }

static async updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    let {
      firstName,
      lastName,
      phoneNumber,
      avatarUrl,
      selectedSubjects,
      aspiringCourse,
      goalScore,
      learningStyle,
      diagnosticResults,
      preferredStudyTime,
      studyReminders,
      examYear,
      dateOfBirth,
      state,
      school
    } = req.body;

    console.log(JSON.stringify(req.body, null, 2));


    // Validate userId
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Normalize selectedSubjects if provided
    if (selectedSubjects) {
      if (!Array.isArray(selectedSubjects)) {
        return res.status(400).json({ error: 'selectedSubjects must be an array of strings' });
      }

      const normalizedSubjects = selectedSubjects.map(
        (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
      );
      selectedSubjects = normalizedSubjects;

      console.log(`Normalized subjects: ${JSON.stringify(selectedSubjects)}`);

      // Validate against DB
      const validSubjects = await prisma.subject.findMany({
        where: { name: { in: selectedSubjects } },
        select: { name: true }
      });
      if (validSubjects.length !== selectedSubjects.length) {
        const invalidSubjects = selectedSubjects.filter(
          (s: string) => !validSubjects.some(v => v.name === s)
        );
        return res.status(400).json({ error: `Invalid subjects: ${invalidSubjects.join(', ')}` });
      }

      // Validate course-subject compatibility
      if (aspiringCourse && COURSE_SUBJECT_REQUIREMENTS[aspiringCourse as keyof typeof COURSE_SUBJECT_REQUIREMENTS]) {
        const requiredSubjects = COURSE_SUBJECT_REQUIREMENTS[aspiringCourse as keyof typeof COURSE_SUBJECT_REQUIREMENTS];
        const missingSubjects = requiredSubjects.filter(subject => !selectedSubjects.includes(subject));
        if (missingSubjects.length > 0) {
          return res.status(400).json({ 
            error: `Missing required subjects for ${aspiringCourse}: ${missingSubjects.join(', ')}` 
          });
        }
      }
    }

    // Validate goalScore
    if (goalScore !== undefined && (typeof goalScore !== 'number' || goalScore < 0 || goalScore > 400)) {
      return res.status(400).json({ error: 'Goal score must be a number between 0 and 400' });
    }

    // Validate diagnosticResults
    if (diagnosticResults) {
      if (!Array.isArray(diagnosticResults) || !diagnosticResults.every(
        (r: any) => typeof r.subject === 'string' && typeof r.proficiency === 'number'
      )) {
        return res.status(400).json({ error: 'diagnosticResults must be an array of { subject: string, proficiency: number }' });
      }
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
      diagnosticResults,
      onboardingDone: true,
      preferredStudyTime,
      studyReminders,
      examYear,
      dateOfBirth,
      state,
      school
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
        onboardingDone: true,
        preferredStudyTime: true,
        studyReminders: true,
        examYear: true,
        dateOfBirth: true,
        state: true,
        school: true
      }
    });

    res.json({ profile: updatedUser, message: 'Profile updated successfully' });

  } catch (error: any) {
    res.status(error.message.includes('Invalid') ? 400 : 500).json({ error: `Failed to update profile: ${error.message}` });
  }
}


  static async uploadProfileImage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      if (!file) {
        return res.status(400).json({ error: 'No image provided' });
      }

      // Simulate image upload and return URL (replace with actual storage logic, e.g., S3)
      const imageUrl = `/uploads/${file.filename}`; // Placeholder for actual storage URL

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: imageUrl },
        select: { id: true, avatarUrl: true }
      });

      res.json({ imageUrl: updatedUser.avatarUrl });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to upload profile image: ${error.message}` });
    }
  }

  static async updateSubjects(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { selectedSubjects } = req.body;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      if (!Array.isArray(selectedSubjects)) {
        return res.status(400).json({ error: 'selectedSubjects must be an array of strings' });
      }

      const validSubjects = await prisma.subject.findMany({
        where: { name: { in: selectedSubjects } },
        select: { name: true }
      });
      if (validSubjects.length !== selectedSubjects.length) {
        const invalidSubjects = selectedSubjects.filter((s: string) => !validSubjects.some(v => v.name === s));
        return res.status(400).json({ error: `Invalid subjects: ${invalidSubjects.join(', ')}` });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { selectedSubjects },
        select: { id: true, selectedSubjects: true }
      });

      res.json({ profile: updatedUser });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to update subjects: ${error.message}` });
    }
  }

  static async updatePreferences(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { preferredStudyTime, studyReminders } = req.body;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      if (studyReminders === undefined && !preferredStudyTime) {
        return res.status(400).json({ error: 'At least one preference field is required' });
      }

      const updateData: any = {};
      if (preferredStudyTime) updateData.preferredStudyTime = preferredStudyTime;
      if (studyReminders !== undefined) updateData.studyReminders = studyReminders;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: { id: true, preferredStudyTime: true, studyReminders: true }
      });

      res.json({ profile: updatedUser });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to update preferences: ${error.message}` });
    }
  }

  static async deleteAccount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      await prisma.user.delete({ where: { id: userId } });
      res.json({ message: 'Account deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to delete account: ${error.message}` });
    }
  }

  static async exportData(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const userData = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          studyPlans: { include: { tasks: true } },
          questionAttempts: true,
          achievements: true,
          streaks: true
        }
      });

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Simulate data export (e.g., send email with data)
      res.json({ message: 'Data export requested. You will receive an email with your data.' });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to export data: ${error.message}` });
    }
  }

  static async completeOnboarding(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { selectedSubjects, aspiringCourse, goalScore, learningStyle } = req.body;

      // Validate userId
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Validate selectedSubjects
      if (!Array.isArray(selectedSubjects)) {
        return res.status(400).json({ error: 'selectedSubjects must be an array of strings' });
      }
      const validSubjects = await prisma.subject.findMany({
        where: { name: { in: selectedSubjects } },
        select: { name: true }
      });
      if (validSubjects.length !== selectedSubjects.length) {
        const invalidSubjects = selectedSubjects.filter((s: string) => !validSubjects.some(v => v.name === s));
        return res.status(400).json({ error: `Invalid subjects: ${invalidSubjects.join(', ')}` });
      }

      // Validate course-subject compatibility
      if (aspiringCourse && COURSE_SUBJECT_REQUIREMENTS[aspiringCourse as keyof typeof COURSE_SUBJECT_REQUIREMENTS]) {
        const requiredSubjects = COURSE_SUBJECT_REQUIREMENTS[aspiringCourse as keyof typeof COURSE_SUBJECT_REQUIREMENTS];
        const missingSubjects = requiredSubjects.filter(subject => !selectedSubjects.includes(subject));
        if (missingSubjects.length > 0) {
          return res.status(400).json({ 
            error: `Missing required subjects for ${aspiringCourse}: ${missingSubjects.join(', ')}`
          });
        }
      }

      // Validate goalScore
      if (typeof goalScore !== 'number' || goalScore < 0 || goalScore > 400) {
        return res.status(400).json({ error: 'Goal score must be a number between 0 and 400' });
      }

      const updatedUser = await prisma.user.update({
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
        profile: updatedUser,
        message: 'Onboarding completed successfully' 
      });
    } catch (error: any) {
      res.status(error.message.includes('Invalid') ? 400 : 500).json({ error: `Failed to complete onboarding: ${error.message}` });
    }
  }

  static async getDashboardData(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const dashboardData = await AnalyticsService.getUserAnalytics(userId);
      res.json({ dashboard: dashboardData });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to fetch dashboard data: ${error.message}` });
    }
  }

  static async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const analytics = await AnalyticsService.getUserAnalytics(userId);
      res.json({ stats: analytics }); // Align with frontend's expected key
    } catch (error: any) {
      res.status(500).json({ error: `Failed to fetch analytics: ${error.message}` });
    }
  }

  static async getWeakTopics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const weakTopics = await AnalyticsService.getWeakTopics(userId);
      res.json({ weakTopics });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to fetch weak topics: ${error.message}` });
    }
  }

  static async getStudyPlan(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const studyPlan = await StudyPlanService.getStudyPlan(userId);
      res.json({ studyPlan });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to fetch study plan: ${error.message}` });
    }
  }

  static async updateStudyPlan(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { taskId, status } = req.body;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      if (!taskId || !status) {
        return res.status(400).json({ error: 'taskId and status are required' });
      }

      // Validate status against StudyTaskStatus enum
      if (!Object.values(StudyTaskStatus).includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${Object.values(StudyTaskStatus).join(', ')}` });
      }

      const updatedTask = await StudyPlanService.updateStudyTask(userId, parseInt(taskId), status);

      res.json({ task: updatedTask });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to update study plan: ${error.message}` });
    }
  }

  static async regenerateStudyPlan(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const newStudyPlan = await StudyPlanService.regenerateStudyPlan(userId);
      res.json({ studyPlan: newStudyPlan });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to regenerate study plan: ${error.message}` });
    }
  }

  static async getProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const progress = await prisma.userProgress.findMany({
        where: { userId },
        include: {
          topic: {
            include: { subject: true }
          }
        }
      });

      res.json({ progress });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to fetch progress: ${error.message}` });
    }
  }

  static async getSubjectProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { subject } = req.params;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      if (!subject) {
        return res.status(400).json({ error: 'Subject is required' });
      }

      const progress = await prisma.userProgress.findMany({
        where: {
          userId,
          topic: { subject: { name: subject } }
        },
        include: {
          topic: {
            include: { subject: true }
          }
        }
      });

      res.json({ progress });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to fetch subject progress: ${error.message}` });
    }
  }

  static async updateGoal(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { goalScore } = req.body;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      if (typeof goalScore !== 'number' || goalScore < 0 || goalScore > 400) {
        return res.status(400).json({ error: 'Goal score must be a number between 0 and 400' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { goalScore },
        select: { id: true, goalScore: true }
      });

      res.json({ profile: updatedUser });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to update goal: ${error.message}` });
    }
  }

  static async getGoalProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { goalScore: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const quizAttempts = await prisma.quizAttempt.findMany({
        where: { userId },
        include: { subject: true }
      });

      const goalProgress = AnalyticsService.calculateGoalProgress(user.goalScore?? 0, quizAttempts);

      res.json({ goalProgress });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to fetch goal progress: ${error.message}` });
    }
  }

  static async getAchievements(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const achievements = await prisma.achievement.findMany({
        where: { userId },
        orderBy: { earnedAt: 'desc' }
      });

      res.json({ achievements });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to fetch achievements: ${error.message}` });
    }
  }

  static async getStreak(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const streak = await prisma.streak.findFirst({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        select: { count: true, lastActive: true }
      });

      res.json({ streak: streak || { count: 0, lastActive: null } });
    } catch (error: any) {
      res.status(500).json({ error: `Failed to fetch streak: ${error.message}` });
    }
  }
}