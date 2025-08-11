// backend/src/services/questionService.ts - COMPLETED
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface QuestionFilters {
  subject?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  cognitiveLevel?: 'recall' | 'comprehension' | 'application' | 'analysis';
  excludeIds?: number[];
  userId?: number;
}

export class QuestionService {
  static async getAdaptiveQuestions(userId: number, filters: QuestionFilters, count: number = 10) {
    // Get user's performance data
    const userProgress = await prisma.userProgress.findMany({
      where: { userId },
      include: { topic: { include: { subject: true } } }
    });

    const recentAttempts = await prisma.questionAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { question: true }
    });

    // Calculate user's proficiency per topic
    const topicProficiency = this.calculateTopicProficiency(recentAttempts);

    // Build adaptive query
    const whereClause: any = {
      status: 'ACTIVE',
      subject: { name: filters.subject },
    };

    if (filters.topic) whereClause.topic = { name: filters.topic };
    if (filters.difficulty) whereClause.difficulty = filters.difficulty;
    if (filters.cognitiveLevel) whereClause.cognitiveLevel = filters.cognitiveLevel;
    if (filters.excludeIds?.length) whereClause.id = { notIn: filters.excludeIds };

    // Adaptive difficulty selection
    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        subject: true,
        topic: true,
        questionAttempts: {
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: [
        { difficulty: this.getDifficultyOrder(topicProficiency, filters.subject) },
        { createdAt: 'desc' }
      ],
      take: count * 2 // Get more to filter from
    });

    // Apply spaced repetition logic
    const filteredQuestions = this.applySpacedRepetition(questions, recentAttempts, userId);
    
    // Return final selection
    return filteredQuestions.slice(0, count);
  }

  static async getDiagnosticQuestions(subjects: string[]) {
    const diagnosticQuestions = await Promise.all(
      subjects.map(async (subject) => {
        const questions = await prisma.question.findMany({
          where: {
            subject: { name: subject },
            isDiagnostic: true,
            status: 'ACTIVE'
          },
          include: {
            subject: true,
            topic: true
          },
          orderBy: { order: 'asc' },
          take: 5 // 5 diagnostic questions per subject
        });
        
        return { subject, questions };
      })
    );

    return diagnosticQuestions;
  }

  static async submitQuestionAttempt(attemptData: {
    userId: number;
    questionId: number;
    selectedAnswer: number;
    timeSpent: number;
    confidenceLevel?: number;
    sessionId?: string;
  }) {
    const { userId, questionId, selectedAnswer, timeSpent, confidenceLevel, sessionId } = attemptData;

    // Get question to check correct answer
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { topic: true }
    });

    if (!question) throw new Error('Question not found');

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

    // Update user progress
    await this.updateUserProgress(userId, question.topicId, isCorrect, timeSpent);

    // Update user statistics
    await this.updateUserStats(userId, isCorrect, timeSpent, question.difficulty);

    return attempt;
  }

  private static calculateTopicProficiency(attempts: any[]) {
    const topicStats: Record<number, { correct: number; total: number }> = {};
    
    attempts.forEach(attempt => {
      const topicId = attempt.question.topicId;
      if (!topicStats[topicId]) {
        topicStats[topicId] = { correct: 0, total: 0 };
      }
      topicStats[topicId].total++;
      if (attempt.isCorrect) topicStats[topicId].correct++;
    });

    const proficiency: Record<number, number> = {};
    Object.entries(topicStats).forEach(([topicId, stats]) => {
      proficiency[parseInt(topicId)] = stats.correct / stats.total;
    });

    return proficiency;
  }

  private static getDifficultyOrder(proficiency: Record<number, number>, subject?: string) {
    // Logic to determine optimal difficulty based on user proficiency
    const avgProficiency = Object.values(proficiency).reduce((sum, p) => sum + p, 0) / Object.keys(proficiency).length || 0;
    
    if (avgProficiency < 0.4) return 'asc'; // Start with easier questions
    if (avgProficiency > 0.8) return 'desc'; // Challenge with harder questions
    return 'asc'; // Balanced approach
  }

  private static applySpacedRepetition(questions: any[], recentAttempts: any[], userId: number) {
    // Group attempts by question for spaced repetition analysis
    const attemptsByQuestion = recentAttempts.reduce((acc, attempt) => {
      if (!acc[attempt.questionId]) acc[attempt.questionId] = [];
      acc[attempt.questionId].push(attempt);
      return acc;
    }, {});

    return questions.filter(question => {
      const questionAttempts = attemptsByQuestion[question.id] || [];
      
      // If never attempted, include
      if (questionAttempts.length === 0) return true;
      
      // Get last attempt
      const lastAttempt = questionAttempts[0]; // Most recent
      const daysSinceAttempt = (Date.now() - new Date(lastAttempt.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      
      // Spaced repetition intervals based on performance
      if (lastAttempt.isCorrect) {
        // If answered correctly, space out the repetition
        const correctAttempts = questionAttempts.filter(a => a.isCorrect).length;
        const interval = Math.pow(2, correctAttempts); // Exponential spacing
        return daysSinceAttempt >= interval;
      } else {
        // If answered incorrectly, review sooner
        return daysSinceAttempt >= 1; // Review after 1 day
      }
    });
  }

  private static async updateUserProgress(userId: number, topicId: number, isCorrect: boolean, timeSpent: number) {
    const existingProgress = await prisma.userProgress.findUnique({
      where: { userId_topicId: { userId, topicId } }
    });

    if (existingProgress) {
      // Update existing progress
      await prisma.userProgress.update({
        where: { userId_topicId: { userId, topicId } },
        data: {
          totalQuestions: existingProgress.totalQuestions + 1,
          correctAnswers: existingProgress.correctAnswers + (isCorrect ? 1 : 0),
          totalTimeSpent: existingProgress.totalTimeSpent + timeSpent,
          lastPracticed: new Date()
        }
      });
    } else {
      // Create new progress record
      await prisma.userProgress.create({
        data: {
          userId,
          topicId,
          totalQuestions: 1,
          correctAnswers: isCorrect ? 1 : 0,
          totalTimeSpent: timeSpent,
          lastPracticed: new Date()
        }
      });
    }
  }

  private static async updateUserStats(userId: number, isCorrect: boolean, timeSpent: number, difficulty: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update daily stats
    const dailyStats = await prisma.userStats.findFirst({
      where: { userId, date: today }
    });

    if (dailyStats) {
      await prisma.userStats.update({
        where: { id: dailyStats.id },
        data: {
          questionsAnswered: dailyStats.questionsAnswered + 1,
          correctAnswers: dailyStats.correctAnswers + (isCorrect ? 1 : 0),
          timeSpent: dailyStats.timeSpent + timeSpent
        }
      });
    } else {
      await prisma.userStats.create({
        data: {
          userId,
          date: today,
          questionsAnswered: 1,
          correctAnswers: isCorrect ? 1 : 0,
          timeSpent
        }
      });
    }

    // Update streak
    await this.updateStreak(userId, isCorrect);
  }

  private static async updateStreak(userId: number, isCorrect: boolean) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentStreak = await prisma.streak.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    if (!currentStreak) {
      // Create first streak
      await prisma.streak.create({
        data: {
          userId,
          count: 1,
          type: 'DAILY',
          lastUpdated: today
        }
      });
    } else {
      const lastUpdate = new Date(currentStreak.lastUpdated);
      lastUpdate.setHours(0, 0, 0, 0);
      
      const diffDays = (today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        // Continue streak
        await prisma.streak.update({
          where: { id: currentStreak.id },
          data: {
            count: currentStreak.count + 1,
            lastUpdated: today
          }
        });
      } else if (diffDays > 1) {
        // Reset streak
        await prisma.streak.update({
          where: { id: currentStreak.id },
          data: {
            count: 1,
            lastUpdated: today
          }
        });
      }
      // If diffDays === 0, already updated today, do nothing
    }
  }
}