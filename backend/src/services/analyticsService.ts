// backend/src/services/analyticsService.ts
export class AnalyticsService {
  static async getUserAnalytics(userId: number) {
    const prisma = new PrismaClient();
    
    // Get overall statistics
    const totalAttempts = await prisma.questionAttempt.count({
      where: { userId }
    });

    const correctAttempts = await prisma.questionAttempt.count({
      where: { userId, isCorrect: true }
    });

    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    // Get subject-wise performance
    const subjectPerformance = await prisma.$queryRaw`
      SELECT 
        s.name as subject,
        COUNT(qa.id) as total_questions,
        SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct_answers,
        AVG(qa.time_spent) as avg_time_spent
      FROM question_attempts qa
      JOIN questions q ON qa.question_id = q.id
      JOIN subjects s ON q.subject_id = s.id
      WHERE qa.user_id = ${userId}
      GROUP BY s.id, s.name
    `;

    // Get learning trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyStats = await prisma.userStats.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo }
      },
      orderBy: { date: 'asc' }
    });

    // Get current streak
    const currentStreak = await prisma.streak.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    return {
      overall: {
        totalQuestions: totalAttempts,
        correctAnswers: correctAttempts,
        accuracy: Math.round(accuracy),
        currentStreak: currentStreak?.count || 0
      },
      subjectPerformance,
      dailyTrends: dailyStats,
      streakData: currentStreak
    };
  }

  static async getWeakTopics(userId: number, limit: number = 5) {
    const prisma = new PrismaClient();
    
    const weakTopics = await prisma.$queryRaw`
      SELECT 
        t.name as topic,
        s.name as subject,
        up.total_questions,
        up.correct_answers,
        CASE 
          WHEN up.total_questions > 0 THEN (up.correct_answers::float / up.total_questions * 100)
          ELSE 0 
        END as accuracy
      FROM user_progress up
      JOIN topics t ON up.topic_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      WHERE up.user_id = ${userId}
        AND up.total_questions >= 3  -- Only topics with at least 3 attempts
      ORDER BY accuracy ASC, up.total_questions DESC
      LIMIT ${limit}
    `;

    return weakTopics;
  }
}


