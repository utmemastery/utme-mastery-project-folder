import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
  static async getUserAnalytics(userId: number) {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }

    const totalAttempts = await prisma.questionAttempt.count({
      where: { userId }
    });

    const correctAttempts = await prisma.questionAttempt.count({
      where: { userId, isCorrect: true }
    });

    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    const subjects = await prisma.subject.findMany({
      select: {
        name: true,
        questions: {
          select: {
            questionAttempts: {
              where: { userId },
              select: {
                isCorrect: true,
                timeTaken: true
              }
            }
          }
        }
      }
    });

    const subjectPerformance = subjects.map(subject => {
      const attempts = subject.questions.flatMap(q => q.questionAttempts);
      const total_questions = attempts.length;
      const correct_answers = attempts.filter(a => a.isCorrect).length;
      const avg_time_spent =
        total_questions > 0
          ? attempts.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / total_questions
          : 0;
      return {
        subject: subject.name,
        total_questions,
        correct_answers,
        accuracy: total_questions > 0 ? (correct_answers / total_questions) * 100 : 0,
        avg_time_spent
      };
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyStats = await prisma.$queryRaw`
      SELECT 
        DATE("attemptedAt") as date,
        COUNT(*) as total_attempts,
        SUM(CASE WHEN "isCorrect" = true THEN 1 ELSE 0 END) as correct_attempts
      FROM "QuestionAttempt"
      WHERE "userId" = ${userId} AND "attemptedAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("attemptedAt")
      ORDER BY date ASC
    `;

    const currentStreak = await prisma.streak.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      select: { score: true }
    });

    const totalStudyTime = await prisma.studyTask.aggregate({
      where: { studyPlan: { userId }, actualTimeSpent: { not: null } },
      _sum: { actualTimeSpent: true }
    });

    const totalScore = quizAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    const averageScore = quizAttempts.length > 0 ? totalScore / quizAttempts.length : 0;

    const strongestSubject = subjectPerformance.reduce((max, s) => s.accuracy > (max?.accuracy || 0) ? s : max, subjectPerformance[0])?.subject || '';
    const weakestSubject = subjectPerformance.reduce((min, s) => s.accuracy < (min?.accuracy || Infinity) ? s : min, subjectPerformance[0])?.subject || '';

    const lastActive = await prisma.questionAttempt.findFirst({
      where: { userId },
      orderBy: { attemptedAt: 'desc' },
      select: { attemptedAt: true }
    });

    return {
      totalQuestions: totalAttempts,
      correctAnswers: correctAttempts,
      studyStreak: currentStreak?.count || 0,
      totalStudyTime: totalStudyTime._sum.actualTimeSpent || 0,
      averageScore: Math.round(averageScore),
      strongestSubject,
      weakestSubject,
      lastActiveDate: lastActive?.attemptedAt?.toISOString() || new Date().toISOString(),
      subjectPerformance,
      dailyTrends: dailyStats,
      streakData: currentStreak
    };
  }

  static async getWeakTopics(userId: number, limit: number = 5) {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }
    if (!Number.isInteger(limit) || limit <= 0) {
      throw new Error('Invalid limit value');
    }

    const userProgress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        topic: {
          include: { subject: true }
        }
      }
    });

    const topicStats = await Promise.all(
      userProgress.map(async up => {
        const total_questions = await prisma.questionAttempt.count({
          where: {
            userId,
            question: { topicId: up.topicId }
          }
        });
        const correct_answers = await prisma.questionAttempt.count({
          where: {
            userId,
            question: { topicId: up.topicId },
            isCorrect: true
          }
        });
        const accuracy =
          total_questions > 0 ? (correct_answers / total_questions) * 100 : 0;
        return {
          topicId: up.topicId,
          topic: up.topic.name,
          subject: up.topic.subject.name,
          total_questions,
          correct_answers,
          accuracy
        };
      })
    );

    const weakTopics = topicStats
      .filter(t => t.total_questions >= 3)
      .sort((a, b) =>
        a.accuracy !== b.accuracy
          ? a.accuracy - b.accuracy
          : b.total_questions - a.total_questions
      )
      .slice(0, limit);

    return weakTopics;
  }

  static calculateGoalProgress(goalScore: number, quizAttempts: any[]): any {
    const totalScore = quizAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    const averageScore = quizAttempts.length > 0 ? totalScore / quizAttempts.length : 0;
    return {
      goalScore,
      currentScore: averageScore,
      progress: goalScore > 0 ? (averageScore / goalScore) * 100 : 0
    };
  }
}