import { PrismaClient, DifficultyLevel, CognitiveLevel } from '@prisma/client';

const prisma = new PrismaClient();

export interface QuestionFilters {
  subject?: string;
  topic?: string;
  difficulty?: DifficultyLevel;
  cognitiveLevel?: CognitiveLevel;
  excludeIds?: number[];
  userId?: number;
}

interface Attempt {
  questionId: number;
  isCorrect: boolean;
  attemptedAt: string | Date;
}


export class QuestionService {
  static async getAdaptiveQuestions(userId: number, filters: QuestionFilters, count: number = 10) {
    const recentAttempts = await prisma.questionAttempt.findMany({
      where: { userId },
      orderBy: { attemptedAt: 'desc' },
      take: 50,
      include: { question: { include: { topic: true, subject: true, options: true } } }
    });

    const topicProficiency = this.calculateTopicProficiency(recentAttempts);

    const whereClause: any = {};
    if (filters.subject) whereClause.subject = { name: filters.subject };
    if (filters.topic) whereClause.topic = { name: filters.topic };
    if (filters.difficulty) whereClause.difficulty = filters.difficulty;
    if (filters.cognitiveLevel) whereClause.cognitiveLevel = filters.cognitiveLevel;
    if (filters.excludeIds?.length) whereClause.id = { notIn: filters.excludeIds };

    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        subject: true,
        topic: true,
        options: true,
        questionAttempts: {
          where: { userId },
          orderBy: { attemptedAt: 'desc' },
          take: 1
        }
      },
      orderBy: [
        { difficulty: this.getDifficultyOrder(topicProficiency) },
        { createdAt: 'desc' }
      ],
      take: count * 2
    });

    const filteredQuestions = this.applySpacedRepetition(questions, recentAttempts);

    return filteredQuestions.slice(0, count);
  }

  static async getDiagnosticQuestions(subjects: string[]) {
    const diagnosticQuestions = await Promise.all(
      subjects.map(async (subject) => {
        const questions = await prisma.question.findMany({
          where: { subject: { name: subject }, isDiagnostic: true },
          include: { subject: true, topic: true, options: true },
          orderBy: { createdAt: 'asc' },
          take: 10
        });

        return {
          subject,
          questions: questions.map(q => ({
            id: q.id,
            text: q.text,
            options: q.options,
            correctAnswer: q.correctOptionId,
            difficulty: q.difficulty,
            topic: q.topic?.name ?? null
          }))
        };
      })
    );

    return diagnosticQuestions;
  }

  static async getDiagnosticQuestionsForSubject(subject: string) {
    if (!subject) throw new Error('Subject is required');

    const questions = await prisma.question.findMany({
      where: { subject: { name: subject }, isDiagnostic: true },
      include: { subject: true, topic: true, options: true },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    if (questions.length === 0) throw new Error(`No diagnostic questions available for subject: ${subject}`);

    return questions.map(q => ({
      id: q.id,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctOptionId,
      difficulty: q.difficulty,
      topic: q.topic?.name ?? null
    }));
  }

  static async generateMockExamQuestions({ 
  subjects, 
  questionCount,
  userId
}: { 
  subjects: string[]; 
  questionCount: number; 
  userId: number; 
}) {
  const questionsPerSubject = Math.floor(questionCount / subjects.length);
  const remainingQuestions = questionCount % subjects.length;

  const questions = await Promise.all(
    subjects.map(async (subject, index) => {
      const count = questionsPerSubject + (index < remainingQuestions ? 1 : 0);
      return prisma.question.findMany({
        where: { subject: { name: subject } }, // You could add userId filtering here if needed
        include: { topic: { select: { sectionId: true } } },
        take: count,
        orderBy: { createdAt: 'desc' }
      });
    })
  );

  const result = questions.flat().map(q => ({
    questionId: q.id,
    sectionId: q.topic?.sectionId ?? undefined
  }));

  if (result.length < questionCount) 
    throw new Error('Not enough questions available for the selected subjects');

  return result.slice(0, questionCount);
}


  static async submitQuestionAttempt({
    userId,
    questionId,
    selectedOption,
    timeTaken,
    practiceSessionId
  }: {
    userId: number;
    questionId: number;
    selectedOption: string | number; // Accept both, convert to string for Prisma
    timeTaken: number;
    practiceSessionId?: string;
  }) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { topic: true, options: true }
    });

    if (!question) throw new Error('Question not found');

    const selectedOptionId = typeof selectedOption === 'number' ? selectedOption.toString() : selectedOption;
    const isCorrect = selectedOptionId === question.correctOptionId?.toString();

    const attempt = await prisma.questionAttempt.create({
      data: {
        userId,
        questionId,
        selectedOption: selectedOptionId,
        isCorrect,
        timeTaken,
        practiceSessionId,
        attemptedAt: new Date()
      }
    });

    if (question.topicId) await this.updateUserProgress(userId, question.topicId, isCorrect);

    await this.updateStreak(userId, isCorrect);

    return {
      id: attempt.id,
      isCorrect,
      timeTaken,
      questionId
    };
  }

  private static calculateTopicProficiency(recentAttempts: any[]): Record<number, number> {
    const topicStats: Record<number, { total: number; correct: number }> = {};

    recentAttempts.forEach(attempt => {
      const topicId = attempt.question.topicId;
      if (!topicId) return;

      if (!topicStats[topicId]) topicStats[topicId] = { total: 0, correct: 0 };
      topicStats[topicId].total++;
      if (attempt.isCorrect) topicStats[topicId].correct++;
    });

    const proficiency: Record<number, number> = {};
    Object.entries(topicStats).forEach(([topicId, stats]) => {
      proficiency[parseInt(topicId)] = stats.correct / stats.total;
    });

    return proficiency;
  }

  private static getDifficultyOrder(proficiency: Record<number, number>) {
    const avgProficiency = Object.values(proficiency).reduce((sum, p) => sum + p, 0) / Object.keys(proficiency).length || 0;
    if (avgProficiency < 0.4) return 'asc';
    if (avgProficiency > 0.8) return 'desc';
    return 'asc';
  }

private static applySpacedRepetition(
  questions: { id: number; text: string; options?: any[]; subject?: { name: string }; topic?: { name: string } | null; difficulty: string }[],
  recentAttempts: Attempt[]
) {
  const attemptsByQuestion = recentAttempts.reduce((acc, attempt) => {
    if (!acc[attempt.questionId]) acc[attempt.questionId] = [];
    acc[attempt.questionId].push(attempt);
    return acc;
  }, {} as Record<number, Attempt[]>);

  return questions.filter(question => {
    const questionAttempts = attemptsByQuestion[question.id] || [];

    if (questionAttempts.length === 0) return true;

    const lastAttempt = questionAttempts[0];
    const daysSinceAttempt = (Date.now() - new Date(lastAttempt.attemptedAt).getTime()) / (1000 * 60 * 60 * 24);

    if (lastAttempt.isCorrect) {
      const correctAttempts = questionAttempts.filter((a: Attempt) => a.isCorrect).length;
      const interval = Math.pow(2, correctAttempts);
      return daysSinceAttempt >= interval;
    } else {
      return daysSinceAttempt >= 1;
    }
  }).map(question => ({
    id: question.id,
    text: question.text,
    options: question.options ?? [],
    subject: question.subject?.name ?? '',
    topic: question.topic?.name ?? null,
    difficulty: question.difficulty
  }));
}


  private static async updateUserProgress(userId: number, topicId: number, isCorrect: boolean) {
    const existingProgress = await prisma.userProgress.findFirst({
      where: { userId, topicId }
    });

    if (existingProgress) {
      await prisma.userProgress.update({
        where: { id: existingProgress.id },
        data: {
          masteryScore: (existingProgress.masteryScore ?? 0) + (isCorrect ? 1 : 0),
          lastReviewed: new Date()
        }
      });
    } else {
      await prisma.userProgress.create({
        data: {
          userId,
          topicId,
          masteryScore: isCorrect ? 1 : 0,
          lastReviewed: new Date()
        }
      });
    }
  }

  private static async updateStreak(userId: number, isCorrect: boolean) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentStreak = await prisma.streak.findFirst({ where: { userId }, orderBy: { lastActive: 'desc' } });

    if (!currentStreak) {
      await prisma.streak.create({ data: { userId, count: 1, lastActive: today } });
    } else {
      const lastUpdate = new Date(currentStreak.lastActive);
      lastUpdate.setHours(0, 0, 0, 0);

      const diffDays = (today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        await prisma.streak.update({ where: { id: currentStreak.id }, data: { count: currentStreak.count + 1, lastActive: today } });
      } else if (diffDays > 1) {
        await prisma.streak.update({ where: { id: currentStreak.id }, data: { count: 1, lastActive: today } });
      }
    }
  }
}
