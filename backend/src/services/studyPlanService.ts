// backend/src/services/studyPlanService.ts
import { PrismaClient } from '@prisma/client';
import { AnalyticsService } from './analyticsService';

const prisma = new PrismaClient();

export interface StudyTask {
  id: string;
  type: 'practice' | 'review' | 'flashcards' | 'mock_exam' | 'weak_topic';
  title: string;
  description: string;
  subject?: string;
  topic?: string;
  estimatedTime: number; // in minutes
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: Date;
  metadata?: any;
}

export interface StudyPlan {
  date: Date;
  totalEstimatedTime: number;
  tasks: StudyTask[];
  completionRate: number;
}

export class StudyPlanService {
  static async generateStudyPlan(userId: number): Promise<StudyPlan> {
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) throw new Error('User not found');

    // Get user analytics and weak topics
    const [analytics, weakTopics] = await Promise.all([
      AnalyticsService.getUserAnalytics(userId),
      AnalyticsService.getWeakTopics(userId, 5)
    ]);

    // Generate weekly study plan
    const weekPlan: StudyPlan[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const dayPlan = await this.generateDayPlan(userId, date, analytics, weakTopics, user);
      weekPlan.push(dayPlan);
    }

    return weekPlan[0]; // Return today's plan
  }

  static async getTodaysPlan(userId: number): Promise<StudyPlan> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if plan already exists for today
    const existingPlan = await prisma.studyPlan.findFirst({
      where: {
        userId,
        date: today
      },
      include: {
        tasks: true
      }
    });

    if (existingPlan) {
      return this.formatStudyPlan(existingPlan);
    }

    // Generate new plan
    return this.generateStudyPlan(userId);
  }

  private static async generateDayPlan(
    userId: number,
    date: Date,
    analytics: any,
    weakTopics: any[],
    user: any
  ): Promise<StudyPlan> {
    const tasks: StudyTask[] = [];
    let totalTime = 0;

    // 1. Daily quiz task (always included)
    tasks.push({
      id: `daily_quiz_${date.getTime()}`,
      type: 'practice',
      title: 'Daily Quiz',
      description: 'Complete 10 mixed questions from your subjects',
      estimatedTime: 15,
      priority: 'high',
      status: 'pending',
      dueDate: date,
      metadata: { questionCount: 10, mixed: true }
    });
    totalTime += 15;

    // 2. Weak topic focus (if weak topics exist)
    if (weakTopics.length > 0) {
      const weakTopic = weakTopics[0]; // Focus on weakest topic
      tasks.push({
        id: `weak_topic_${date.getTime()}`,
        type: 'weak_topic',
        title: `Focus on ${weakTopic.topic}`,
        description: `Practice questions in ${weakTopic.topic} (${weakTopic.subject})`,
        subject: weakTopic.subject,
        topic: weakTopic.topic,
        estimatedTime: 25,
        priority: 'high',
        status: 'pending',
        dueDate: date,
        metadata: { accuracy: weakTopic.accuracy }
      });
      totalTime += 25;
    }

    // 3. Flashcard review (spaced repetition)
    tasks.push({
      id: `flashcards_${date.getTime()}`,
      type: 'flashcards',
      title: 'Flashcard Review',
      description: 'Review flashcards using spaced repetition',
      estimatedTime: 20,
      priority: 'medium',
      status: 'pending',
      dueDate: date,
      metadata: { reviewType: 'spaced_repetition' }
    });
    totalTime += 20;

    // 4. Subject-specific practice (rotate through subjects)
    const dayOfWeek = date.getDay();
    const selectedSubjects = user.selectedSubjects || [];
    if (selectedSubjects.length > 0) {
      const subjectIndex = dayOfWeek % selectedSubjects.length;
      const todaySubject = selectedSubjects[subjectIndex];
      
      tasks.push({
        id: `subject_practice_${date.getTime()}`,
        type: 'practice',
        title: `${todaySubject.charAt(0).toUpperCase() + todaySubject.slice(1)} Practice`,
        description: `Focused practice session for ${todaySubject}`,
        subject: todaySubject,
        estimatedTime: 30,
        priority: 'medium',
        status: 'pending',
        dueDate: date,
        metadata: { focusSubject: todaySubject }
      });
      totalTime += 30;
    }

    // 5. Mock exam (once per week)
    if (date.getDay() === 0) { // Sunday
      tasks.push({
        id: `mock_exam_${date.getTime()}`,
        type: 'mock_exam',
        title: 'Weekly Mock Exam',
        description: 'Complete a full UTME simulation',
        estimatedTime: 120,
        priority: 'high',
        status: 'pending',
        dueDate: date,
        metadata: { examType: 'weekly_mock' }
      });
      totalTime += 120;
    }

    return {
      date,
      totalEstimatedTime: totalTime,
      tasks,
      completionRate: 0
    };
  }

  static async updateTaskStatus(
    userId: number,
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed',
    timeSpent?: number
  ) {
    const task = await prisma.studyTask.findFirst({
      where: {
        id: taskId,
        studyPlan: { userId }
      }
    });

    if (!task) throw new Error('Task not found');

    const updatedTask = await prisma.studyTask.update({
      where: { id: task.id },
      data: {
        status,
        ...(timeSpent && { actualTimeSpent: timeSpent }),
        ...(status === 'completed' && { completedAt: new Date() })
      }
    });

    return updatedTask;
  }

  private static formatStudyPlan(planData: any): StudyPlan {
    const completedTasks = planData.tasks.filter((t: any) => t.status === 'completed').length;
    const totalTasks = planData.tasks.length;
    
    return {
      date: planData.date,
      totalEstimatedTime: planData.tasks.reduce((sum: number, task: any) => sum + task.estimatedTime, 0),
      tasks: planData.tasks.map((task: any) => ({
        id: task.id,
        type: task.type,
        title: task.title,
        description: task.description,
        subject: task.subject,
        topic: task.topic,
        estimatedTime: task.estimatedTime,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        metadata: task.metadata
      })),
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    };
  }

  static async createCustomTask(userId: number, taskData: Partial<StudyTask>) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create today's study plan
    let studyPlan = await prisma.studyPlan.findFirst({
      where: { userId, date: today }
    });

    if (!studyPlan) {
      studyPlan = await prisma.studyPlan.create({
        data: {
          userId,
          date: today,
          totalEstimatedTime: 0
        }
      });
    }

    // Create the custom task
    const task = await prisma.studyTask.create({
      data: {
        studyPlanId: studyPlan.id,
        type: taskData.type || 'practice',
        title: taskData.title!,
        description: taskData.description!,
        subject: taskData.subject,
        topic: taskData.topic,
        estimatedTime: taskData.estimatedTime || 30,
        priority: taskData.priority || 'medium',
        status: 'pending',
        dueDate: taskData.dueDate || today,
        metadata: taskData.metadata
      }
    });

    return task;
  }
}