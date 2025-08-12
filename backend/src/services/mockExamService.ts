// backend/src/services/mockExamService.ts
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface MockExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  topic: string;
  difficulty: string;
}

interface CreateMockExamData {
  userId: number;
  type: string;
  subjects: string[];
  questions: MockExamQuestion[];
  timeLimit: number;
  startTime: Date;
}

interface SubmitMockExamData {
  examId: string;
  userId: number;
  answers: Array<{
    questionId: number;
    selectedAnswer: number;
    timeSpent: number;
  }>;
  timeSpent: number;
}

export class MockExamService {
  static async getAvailableMockExams(userId: number) {
    // Get user's selected subjects
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { selectedSubjects: true }
    });

    const subjects = user?.selectedSubjects || [];

    return [
      {
        id: 'full_utme',
        title: 'Full UTME Mock Exam',
        description: '180 questions across all your subjects',
        type: 'full_utme',
        subjects,
        questionCount: 180,
        timeLimit: 210, // 3.5 hours
        difficulty: 'mixed'
      },
      {
        id: 'subject_english',
        title: 'English Language Mock',
        description: '60 questions focused on English',
        type: 'subject_specific',
        subjects: ['english'],
        questionCount: 60,
        timeLimit: 60,
        difficulty: 'mixed'
      },
      {
        id: 'subject_mathematics',
        title: 'Mathematics Mock',
        description: '60 questions focused on Mathematics',
        type: 'subject_specific',
        subjects: ['mathematics'],
        questionCount: 60,
        timeLimit: 60,
        difficulty: 'mixed'
      }
    ];
  }

  static async getRecentScores(userId: number, limit: number = 10) {
    const recentExams = await prisma.mockExam.findMany({
      where: {
        userId,
        status: 'completed'
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        type: true,
        subjects: true,
        totalQuestions: true,
        correctAnswers: true,
        percentage: true,
        completedAt: true
      }
    });

    return recentExams.map(exam => ({
      id: exam.id,
      examType: exam.type,
      subject: exam.subjects.length === 1 ? exam.subjects[0] : 'Multiple Subjects',
      totalQuestions: exam.totalQuestions,
      correctAnswers: exam.correctAnswers,
      percentage: exam.percentage,
      completedAt: exam.completedAt
    }));
  }

  static async createMockExam(data: CreateMockExamData) {
    const examId = uuidv4();

    // Create the mock exam record
    const exam = await prisma.mockExam.create({
      data: {
        id: examId,
        userId: data.userId,
        type: data.type,
        subjects: data.subjects,
        totalQuestions: data.questions.length,
        timeLimit: data.timeLimit,
        startTime: data.startTime,
        status: 'in_progress'
      }
    });

    // Create question attempts for tracking
    const questionAttempts = data.questions.map(question => ({
      mockExamId: examId,
      questionId: question.id,
      selectedAnswer: null,
      isCorrect: null,
      timeSpent: 0
    }));

    await prisma.mockExamQuestionAttempt.createMany({
      data: questionAttempts
    });

    return {
      id: examId,
      type: data.type,
      subjects: data.subjects,
      questions: data.questions,
      timeLimit: data.timeLimit,
      startTime: data.startTime
    };
  }

  static async submitMockExam(data: SubmitMockExamData) {
    const { examId, userId, answers, timeSpent } = data;

    // Get the mock exam
    const exam = await prisma.mockExam.findFirst({
      where: {
        id: examId,
        userId,
        status: 'in_progress'
      }
    });

    if (!exam) {
      throw new Error('Mock exam not found or already completed');
    }

    // Process answers and calculate score
    let correctAnswers = 0;
    const detailedResults: any[] = [];

    for (const answer of answers) {
      // Get the correct answer for this question
      const question = await prisma.question.findUnique({
        where: { id: answer.questionId }
      });

      if (!question) continue;

      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;

      // Update the question attempt
      await prisma.mockExamQuestionAttempt.updateMany({
        where: {
          mockExamId: examId,
          questionId: answer.questionId
        },
        data: {
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
          timeSpent: answer.timeSpent
        }
      });

      detailedResults.push({
        questionId: answer.questionId,
        question: question.question,
        options: question.options,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        subject: question.subject,
        topic: question.topic,
        explanation: question.explanation,
        timeSpent: answer.timeSpent
      });
    }

    const percentage = Math.round((correctAnswers / exam.totalQuestions) * 100);
    const projectedUTMEScore = Math.round(200 + (percentage / 100) * 200);

    // Update the mock exam with results
    const completedExam = await prisma.mockExam.update({
      where: { id: examId },
      data: {
        status: 'completed',
        correctAnswers,
        percentage,
        timeSpent,
        completedAt: new Date()
      }
    });

    // Update user analytics
    await this.updateUserAnalytics(userId, {
      mockExamTaken: true,
      percentage,
      subjects: exam.subjects
    });

    return {
      examId,
      totalQuestions: exam.totalQuestions,
      correctAnswers,
      percentage,
      projectedUTMEScore,
      timeSpent,
      subjectBreakdown: await this.calculateSubjectBreakdown(detailedResults),
      detailedResults,
      completedAt: completedExam.completedAt
    };
  }

  static async getMockExamResults(examId: string, userId: number) {
    const exam = await prisma.mockExam.findFirst({
      where: {
        id: examId,
        userId,
        status: 'completed'
      },
      include: {
        questionAttempts: {
          include: {
            question: true
          }
        }
      }
    });

    if (!exam) return null;

    const detailedResults = exam.questionAttempts.map(attempt => ({
      questionId: attempt.questionId,
      question: attempt.question.question,
      options: attempt.question.options,
      selectedAnswer: attempt.selectedAnswer,
      correctAnswer: attempt.question.correctAnswer,
      isCorrect: attempt.isCorrect,
      subject: attempt.question.subject,
      topic: attempt.question.topic,
      explanation: attempt.question.explanation,
      timeSpent: attempt.timeSpent
    }));

    return {
      examId: exam.id,
      type: exam.type,
      subjects: exam.subjects,
      totalQuestions: exam.totalQuestions,
      correctAnswers: exam.correctAnswers,
      percentage: exam.percentage,
      timeSpent: exam.timeSpent,
      completedAt: exam.completedAt,
      subjectBreakdown: await this.calculateSubjectBreakdown(detailedResults),
      detailedResults
    };
  }

  static async getMockExamHistory(userId: number, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const [exams, total] = await Promise.all([
      prisma.mockExam.findMany({
        where: {
          userId,
          status: 'completed'
        },
        orderBy: {
          completedAt: 'desc'
        },
        skip: offset,
        take: limit,
        select: {
          id: true,
          type: true,
          subjects: true,
          totalQuestions: true,
          correctAnswers: true,
          percentage: true,
          timeSpent: true,
          completedAt: true
        }
      }),
      prisma.mockExam.count({
        where: {
          userId,
          status: 'completed'
        }
      })
    ]);

    return { exams, total };
  }

  static async getIncompleteMockExam(examId: string, userId: number) {
    const exam = await prisma.mockExam.findFirst({
      where: {
        id: examId,
        userId,
        status: 'in_progress'
      },
      include: {
        questionAttempts: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                options: true,
                subject: true,
                topic: true,
                difficulty: true
              }
            }
          }
        }
      }
    });

    if (!exam) return null;

    // Calculate time remaining
    const elapsed = Math.floor((Date.now() - exam.startTime.getTime()) / 1000);
    const timeRemaining = Math.max(0, (exam.timeLimit * 60) - elapsed);

    // Get answered questions
    const answers: Record<number, any> = {};
    exam.questionAttempts.forEach(attempt => {
      if (attempt.selectedAnswer !== null) {
        answers[attempt.questionId] = {
          questionId: attempt.questionId,
          selectedAnswer: attempt.selectedAnswer,
          timeSpent: attempt.timeSpent
        };
      }
    });

    return {
      id: exam.id,
      type: exam.type,
      subjects: exam.subjects,
      questions: exam.questionAttempts.map(attempt => attempt.question),
      timeLimit: exam.timeLimit,
      startTime: exam.startTime,
      timeRemaining,
      answers
    };
  }

  private static async calculateSubjectBreakdown(results: any[]) {
    const subjectStats: Record<string, any> = {};

    results.forEach(result => {
      if (!subjectStats[result.subject]) {
        subjectStats[result.subject] = {
          total: 0,
          correct: 0,
          percentage: 0
        };
      }
      
      subjectStats[result.subject].total++;
      if (result.isCorrect) {
        subjectStats[result.subject].correct++;
      }
    });

    // Calculate percentages
    Object.keys(subjectStats).forEach(subject => {
      const stats = subjectStats[subject];
      stats.percentage = Math.round((stats.correct / stats.total) * 100);
    });

    return subjectStats;
  }

  private static async updateUserAnalytics(userId: number, data: any) {
    // Update user progress and analytics
    const today = new Date().toISOString().split('T')[0];
    
    await prisma.userProgress.upsert({
      where: {
        userId_date: {
          userId,
          date: today
        }
      },
      update: {
        mockExamsTaken: {
          increment: 1
        },
        lastActivity: new Date()
      },
      create: {
        userId,
        date: today,
        mockExamsTaken: 1,
        lastActivity: new Date()
      }
    });

    // Update subject-specific progress
    for (const subject of data.subjects) {
      await prisma.subjectProgress.upsert({
        where: {
          userId_subject: {
            userId,
            subject
          }
        },
        update: {
          mockExamAverage: data.percentage,
          lastMockExamScore: data.percentage,
          totalMockExams: {
            increment: 1
          }
        },
        create: {
          userId,
          subject,
          mockExamAverage: data.percentage,
          lastMockExamScore: data.percentage,
          totalMockExams: 1
        }
      });
    }
  }
}