import { AnalyticsService } from './analyticsService';
import { PrismaClient, StudyTaskType, StudyTaskStatus, StudyTaskPriority } from '@prisma/client';

const prisma = new PrismaClient();

const COURSE_SUBJECT_REQUIREMENTS = {
  medicine: ['english', 'mathematics', 'physics', 'chemistry', 'biology'],
  engineering: ['english', 'mathematics', 'physics', 'chemistry'],
  law: ['english', 'mathematics', 'literature', 'government'],
  pharmacy: ['english', 'mathematics', 'physics', 'chemistry', 'biology'],
  computer_science: ['english', 'mathematics', 'physics', 'chemistry'],
  accounting: ['english', 'mathematics', 'economics', 'government'],
  business_admin: ['english', 'mathematics', 'economics', 'government'],
  economics: ['english', 'mathematics', 'economics', 'government'],
  psychology: ['english', 'mathematics', 'biology', 'government'],
  mass_comm: ['english', 'mathematics', 'literature', 'government']
};

export interface StudyTask {
  id: number;
  type: StudyTaskType;
  title: string;
  description: string;
  subject?: string;
  topic?: string; // Added to match frontend
  topicId?: number;
  estimatedTime?: number;
  priority?: StudyTaskPriority;
  status: StudyTaskStatus;
  dueDate: Date;
  metadata?: any;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudyPlan {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  aiGenerated: boolean;
  date?: Date;
  tasks: StudyTask[];
  createdAt?: Date;
  updatedAt?: Date;
  totalEstimatedTime: number; // Added for frontend
  completionRate: number; // Added for frontend
}

export class StudyPlanService {
  static async generateStudyPlan(userId: number): Promise<StudyPlan> {
    // Validate userId
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        selectedSubjects: true,
        aspiringCourse: true,
        goalScore: true,
        learningStyle: true,
        diagnosticResults: true
      }
    });

    if (!user) throw new Error('User not found');

    // Validate course-subject compatibility
    if (user.aspiringCourse && COURSE_SUBJECT_REQUIREMENTS[user.aspiringCourse as keyof typeof COURSE_SUBJECT_REQUIREMENTS]) {
      const requiredSubjects = COURSE_SUBJECT_REQUIREMENTS[user.aspiringCourse as keyof typeof COURSE_SUBJECT_REQUIREMENTS];
      const missingSubjects = requiredSubjects.filter(subject => !user.selectedSubjects.includes(subject));
      if (missingSubjects.length > 0) {
        throw new Error(`Missing required subjects for ${user.aspiringCourse}: ${missingSubjects.join(', ')}`);
      }
    }

    // Get user analytics and weak topics
    const [analytics, weakTopics] = await Promise.all([
      AnalyticsService.getUserAnalytics(userId),
      AnalyticsService.getWeakTopics(userId, 5)
    ]);

    // Prioritize subjects based on diagnosticResults if available
    let prioritizedSubjects = user.selectedSubjects;
    if (user.diagnosticResults && Array.isArray(user.diagnosticResults)) {
      prioritizedSubjects = user.diagnosticResults
        .sort((a, b) => a.proficiency - b.proficiency)
        .map((r: { subject: string; proficiency: number }) => r.subject)
        .filter(subject => user.selectedSubjects.includes(subject));
      prioritizedSubjects = [...new Set([...prioritizedSubjects, ...user.selectedSubjects])];
    }

    // Generate weekly study plan
    const weekPlan: StudyPlan[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const dayPlan = await this.generateDayPlan(userId, date, analytics, weakTopics, user, prioritizedSubjects);
      weekPlan.push(dayPlan);
    }

    return weekPlan[0]; // Return today's plan
  }

  static async regenerateStudyPlan(userId: number): Promise<StudyPlan> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.studyPlan.deleteMany({ where: { userId, date: today } });
    return this.generateStudyPlan(userId);
  }

  static async getTodaysPlan(userId: number): Promise<StudyPlan> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingPlan = await prisma.studyPlan.findFirst({
      where: {
        userId,
        date: today
      },
      include: {
        tasks: { include: { topic: true } } // Include topic for name
      }
    });

    if (existingPlan) {
      return this.formatStudyPlan(existingPlan);
    }

    return this.generateStudyPlan(userId);
  }

  private static async generateDayPlan(
    userId: number,
    date: Date,
    analytics: any,
    weakTopics: any[],
    user: any,
    prioritizedSubjects: string[]
  ): Promise<StudyPlan> {
    const tasks: StudyTask[] = [];
    let totalTime = 0;

    if (user.aspiringCourse && COURSE_SUBJECT_REQUIREMENTS[user.aspiringCourse as keyof typeof COURSE_SUBJECT_REQUIREMENTS]) {
      const requiredSubjects = COURSE_SUBJECT_REQUIREMENTS[user.aspiringCourse as keyof typeof COURSE_SUBJECT_REQUIREMENTS];
      const invalidSubjects = prioritizedSubjects.filter(subject => !requiredSubjects.includes(subject));
      if (invalidSubjects.length > 0) {
        throw new Error(`Invalid subjects for ${user.aspiringCourse}: ${invalidSubjects.join(', ')}`);
      }
    }

    tasks.push({
      id: 0,
      type: StudyTaskType.PRACTICE,
      title: 'Daily Quiz',
      description: 'Complete 10 mixed questions from your subjects',
      estimatedTime: 15,
      priority: StudyTaskPriority.HIGH,
      status: StudyTaskStatus.PENDING,
      dueDate: date,
      metadata: { questionCount: 10, mixed: true },
      completed: false
    });
    totalTime += 15;

    const weakTopicTasks = await Promise.all(
      weakTopics
        .filter((wt: any) => prioritizedSubjects.includes(wt.subject))
        .slice(0, 3)
        .map(async (topic: any, index: number) => {
          const topicData = await prisma.topic.findUnique({ where: { id: topic.topicId } });
          const taskType = user.learningStyle === 'visual' ? StudyTaskType.PRACTICE : StudyTaskType.REVIEW;
          return {
            id: 0,
            type: taskType,
            title: `Practice ${topic.topic}`,
            description: `Focus on ${topic.topic} in ${topic.subject}`,
            subject: topic.subject,
            topic: topicData?.name,
            topicId: topic.topicId,
            estimatedTime: 20,
            priority: StudyTaskPriority.MEDIUM,
            status: StudyTaskStatus.PENDING,
            dueDate: date,
            metadata: { topicId: topic.topicId },
            completed: false
          };
        })
    );

    tasks.push(...weakTopicTasks);
    totalTime += weakTopicTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);

    const studyPlan = await prisma.studyPlan.create({
      data: {
        userId,
        title: 'Daily Study Plan',
        description: 'Auto-generated daily study plan',
        startDate: date,
        endDate: date,
        aiGenerated: true,
        date,
        tasks: {
          create: tasks.map(task => ({
            type: task.type,
            title: task.title,
            description: task.description,
            subject: task.subject,
            topicId: task.topicId,
            estimatedTime: task.estimatedTime,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate,
            metadata: task.metadata,
            completed: task.completed
          }))
        }
      },
      include: { tasks: { include: { topic: true } } }
    });

    return this.formatStudyPlan(studyPlan);
  }

  static async generateInitialStudyPlan(
    userId: number,
    selectedSubjects: string[],
    aspiringCourse: string,
    goalScore: number,
    learningStyle: string
  ): Promise<StudyPlan> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }
    if (!Array.isArray(selectedSubjects) || selectedSubjects.length < 1) {
      throw new Error('selectedSubjects must be a non-empty array');
    }
    if (!aspiringCourse) {
      throw new Error('aspiringCourse is required');
    }
    if (typeof goalScore !== 'number' || goalScore < 0 || goalScore > 400) {
      throw new Error('Goal score must be a number between 0 and 400');
    }
    if (!['visual', 'auditory', 'kinesthetic', 'reading'].includes(learningStyle)) {
      throw new Error('Invalid learning style');
    }

    if (COURSE_SUBJECT_REQUIREMENTS[aspiringCourse as keyof typeof COURSE_SUBJECT_REQUIREMENTS]) {
      const requiredSubjects = COURSE_SUBJECT_REQUIREMENTS[aspiringCourse as keyof typeof COURSE_SUBJECT_REQUIREMENTS];
      const missingSubjects = requiredSubjects.filter(subject => !selectedSubjects.includes(subject));
      if (missingSubjects.length > 0) {
        throw new Error(`Missing required subjects for ${aspiringCourse}: ${missingSubjects.join(', ')}`);
      }
    }

    const [analytics, weakTopics] = await Promise.all([
      AnalyticsService.getUserAnalytics(userId),
      AnalyticsService.getWeakTopics(userId, 5)
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.generateDayPlan(userId, today, analytics, weakTopics, {
      selectedSubjects,
      aspiringCourse,
      goalScore,
      learningStyle,
      diagnosticResults: []
    }, selectedSubjects);
  }

  static async getStudyPlan(userId: number): Promise<StudyPlan[]> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }

    const plans = await prisma.studyPlan.findMany({
      where: { userId },
      include: { tasks: { include: { topic: true } } },
      orderBy: { date: 'asc' }
    });

    return plans.map(this.formatStudyPlan);
  }

  static async updateStudyTask(userId: number, taskId: number, status: StudyTaskStatus, timeSpent?: number) {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }
    if (!Number.isInteger(taskId) || taskId <= 0) {
      throw new Error('Invalid task ID');
    }
    if (!Object.values(StudyTaskStatus).includes(status)) {
      throw new Error('Invalid status');
    }

    const task = await prisma.studyTask.findFirst({
      where: {
        id: taskId,
        studyPlan: { userId }
      },
      include: { topic: true }
    });

    if (!task) throw new Error('Task not found');

    const updatedTask = await prisma.studyTask.update({
      where: { id: task.id },
      data: {
        status,
        ...(timeSpent && { actualTimeSpent: timeSpent }),
        ...(status === StudyTaskStatus.COMPLETED && { completed: true, completedAt: new Date() })
      },
      include: { topic: true }
    });

    return {
      ...updatedTask,
      topic: updatedTask.topic?.name
    };
  }

  static async createCustomTask(userId: number, taskData: Partial<StudyTask>) {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }
    if (!taskData.title || !taskData.description) {
      throw new Error('Title and description are required');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let studyPlan = await prisma.studyPlan.findFirst({
      where: { userId, date: today }
    });

    if (!studyPlan) {
      studyPlan = await prisma.studyPlan.create({
        data: {
          userId,
          title: 'Daily Study Plan',
          description: 'Auto-generated daily study plan',
          startDate: today,
          endDate: today,
          aiGenerated: true,
          date: today
        }
      });
    }

    const task = await prisma.studyTask.create({
      data: {
        studyPlanId: studyPlan.id,
        type: taskData.type || StudyTaskType.PRACTICE,
        title: taskData.title!,
        description: taskData.description!,
        subject: taskData.subject,
        topicId: taskData.topicId,
        estimatedTime: taskData.estimatedTime || 30,
        priority: taskData.priority || StudyTaskPriority.MEDIUM,
        status: StudyTaskStatus.PENDING,
        dueDate: taskData.dueDate || today,
        metadata: taskData.metadata,
        completed: false
      },
      include: { topic: true }
    });

    return {
      ...task,
      topic: task.topic?.name
    };
  }

  private static formatStudyPlan(planData: any): StudyPlan {
    const tasks = planData.tasks.map((task: any) => ({
      id: task.id,
      type: task.type,
      title: task.title,
      description: task.description,
      subject: task.subject,
      topic: task.topic?.name,
      topicId: task.topicId,
      estimatedTime: task.estimatedTime,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      metadata: task.metadata,
      completed: task.completed,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));

    return {
      id: planData.id,
      userId: planData.userId,
      title: planData.title,
      description: planData.description,
      startDate: planData.startDate,
      endDate: planData.endDate,
      aiGenerated: planData.aiGenerated,
      date: planData.date,
      createdAt: planData.createdAt,
      updatedAt: planData.updatedAt,
      tasks,
      totalEstimatedTime: tasks.reduce((sum: number, task: any) => sum + (task.estimatedTime || 0), 0),
      completionRate: tasks.length > 0
        ? (tasks.filter((t: any) => t.status === StudyTaskStatus.COMPLETED).length / tasks.length) * 100
        : 0
    };
  }
}