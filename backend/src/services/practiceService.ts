import { PrismaClient, DifficultyLevel, PracticeSessionType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class PracticeService {
  static async startSession(userId: number, {
    subject,
    topics,
    difficulty,
    questionCount = 10
  }: {
    subject: string;
    topics?: string[];
    difficulty?: string;
    questionCount?: number;
  }) {
    const subjectObj = await prisma.subject.findUnique({ where: { name: subject } });
    if (!subjectObj) throw new Error('Invalid subject');
    const topicIds = topics ? await Promise.all(
      topics.map(async (topic) => {
        const topicObj = await prisma.topic.findUnique({ where: { name: topic } });
        if (!topicObj) throw new Error(`Invalid topic: ${topic}`);
        return topicObj.id;
      })
    ) : [];
    const session = await prisma.practiceSession.create({
      data: {
        id: `session_${Date.now()}`,
        userId,
        subjectId: subjectObj.id,
        difficulty: difficulty?.toUpperCase() as DifficultyLevel,
        questionCount,
        startTime: new Date(),
        topics: topicIds.length > 0 ? { create: topicIds.map(id => ({ topicId: id })) } : undefined
      }
    });
    return session;
  }

  static async generateQuestions(userId: number, {
    subject,
    topics,
    difficulty,
    count,
    excludeAnswered = false
  }: {
    subject: string;
    topics?: string[];
    difficulty?: DifficultyLevel;
    count: number;
    excludeAnswered?: boolean;
  }) {
    const subjectObj = await prisma.subject.findUnique({ where: { name: subject } });
    if (!subjectObj) throw new Error('Invalid subject');
    const topicIds = topics ? await Promise.all(
      topics.map(async (topic) => {
        const topicObj = await prisma.topic.findUnique({ where: { name: topic } });
        if (!topicObj) throw new Error(`Invalid topic: ${topic}`);
        return topicObj.id;
      })
    ) : [];
    const whereClause: any = { subjectId: subjectObj.id };
    if (topicIds.length > 0) whereClause.topicId = { in: topicIds };
    if (difficulty) whereClause.difficulty = difficulty;
    if (excludeAnswered) {
      const answeredQuestionIds = await prisma.questionAttempt.findMany({
        where: { userId },
        select: { questionId: true }
      });
      whereClause.id = { notIn: answeredQuestionIds.map(a => a.questionId) };
    }
    const questions = await prisma.question.findMany({
      where: whereClause,
      take: count,
      include: { options: true }
    });
    return questions.map(q => ({
      id: q.id,
      subject: subjectObj.name,
      topic: q.topic ? q.topic.name : undefined,
      question: q.text,
      options: q.options.map(o => o.text),
      explanation: q.explanation || '',
      difficulty: q.difficulty,
      cognitiveLevel: q.cognitiveLevel,
      yearAsked: q.yearAsked,
      tags: q.tags
    }));
  }

  static async submitAnswer(userId: number, {
    sessionId,
    questionId,
    selectedOption,
    timeTaken,
    confidenceLevel
  }: {
    sessionId: string;
    questionId: number;
    selectedOption: number;
    timeTaken?: number;
    confidenceLevel?: number;
  }) {
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw new Error('Question not found');
    const isCorrect = selectedOption === question.correctOptionId;
    await prisma.questionAttempt.create({
      data: {
        id: `attempt_${Date.now()}`,
        userId,
        questionId,
        selectedOption: selectedOption.toString(),
        isCorrect,
        timeTaken: timeTaken ?? 0,
        practiceSessionId: sessionId,
        confidenceLevel
      }
    });
    const session = await prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        answeredCount: { increment: 1 },
        correctCount: isCorrect ? { increment: 1 } : undefined,
        updatedAt: new Date()
      }
    });
    return { isCorrect, session };
  }

  static async endSession(userId: number, sessionId: string) {
    const session = await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { endTime: new Date() }
    });
    return session;
  }

  static async getSessionHistory(userId: number, page = 1, limit = 10) {
    const sessions = await prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        questionAttempts: true,
        subject: true,
        topic: true
      }
    });
    const total = await prisma.practiceSession.count({ where: { userId } });
    return {
      sessions: sessions.map(session => ({
        ...session,
        accuracy: session.answeredCount > 0
          ? Math.round((session.correctCount / session.answeredCount) * 100)
          : 0
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getSubjectAnalytics(userId: number, subjects: string[]) {
    const subjectData = await Promise.all(subjects.map(async (subject) => {
      const subjectObj = await prisma.subject.findUnique({ where: { name: subject } });
      if (!subjectObj) return null;
      const topicMasteries = await prisma.topicMastery.findMany({
        where: { userId, topic: { subjectId: subjectObj.id } },
        include: { topic: true }
      });
      const performanceSnapshot = await prisma.performanceSnapshot.findFirst({
        where: { userId, subjectId: subjectObj.id },
        orderBy: { takenAt: 'desc' }
      });
      const weakTopics = topicMasteries
        .filter(tm => tm.mastery < 50)
        .map(tm => tm.topic.name);
      return {
        subject,
        mastery: topicMasteries.length > 0
          ? topicMasteries.reduce((sum, tm) => sum + tm.mastery, 0) / topicMasteries.length
          : 0,
        lastScore: performanceSnapshot?.predictedScore || 0,
        weakTopics
      };
    }));
    return Object.fromEntries(subjectData.filter(Boolean).map(data => [data.subject, data]));
  }


  
  static async getPassages(userId: number, subject: string) {
    const subjectObj = await prisma.subject.findUnique({ where: { name: subject } });
    if (!subjectObj) throw new Error('Invalid subject');
    const passages = await prisma.passage.findMany({
      where: { subjectId: subjectObj.id },
      include: { questions: { include: { options: true } } }
    });
    return passages.map(p => ({
      id: p.id,
      subject: subjectObj.name,
      text: p.text,
      type: p.type,
      questions: p.questions.map(q => ({
        id: q.id,
        subject: subjectObj.name,
        topic: q.topic ? q.topic.name : undefined,
        question: q.text,
        options: q.options.map(o => o.text),
        explanation: q.explanation || '',
        difficulty: q.difficulty,
        cognitiveLevel: q.cognitiveLevel,
        yearAsked: q.yearAsked,
        tags: q.tags
      }))
    }));
  }

  static async syncOfflineData(userId: number, {
    resourceType,
    resourceId,
    action,
    data
  }: {
    resourceType: string;
    resourceId: string;
    action: string;
    data: any;
  }) {
    if (resourceType === 'PracticeSession') {
      if (action === 'CREATE') {
        await prisma.practiceSession.create({
          data: {
            id: data.id,
            userId,
            subjectId: (await prisma.subject.findUnique({ where: { name: data.subject } }))!.id,
            topicId: data.topics?.length > 0 ? (await prisma.topic.findUnique({ where: { name: data.topics[0] } }))?.id : undefined,
            difficulty: data.difficulty,
            questionCount: data.questionCount,
            startTime: new Date(data.startTime),
            endTime: data.endTime ? new Date(data.endTime) : undefined,
            sessionType: data.sessionType,
            answeredCount: data.attempts.length,
            correctCount: data.attempts.filter(a => a.isCorrect).length
          }
        });
      } else if (action === 'UPDATE') {
        await prisma.practiceSession.update({
          where: { id: resourceId },
          data: {
            endTime: data.endTime ? new Date(data.endTime) : undefined,
            answeredCount: data.attempts.length,
            correctCount: data.attempts.filter(a => a.isCorrect).length
          }
        });
      }
      await prisma.offlineSync.create({
        data: {
          userId,
          resourceType,
          resourceId,
          action,
          data: data,
          lastSyncedAt: new Date()
        }
      });
    }
  }
}