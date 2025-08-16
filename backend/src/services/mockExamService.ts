import { PrismaClient, MockExamStatus, ExamType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface UserAnswer {
  selectedOptionId: number;
}

interface MockExamQuestion {
  id: number;
  questionId: number;
  sectionId?: number;
  isCorrect?: boolean;
  responseTime?: number;
  userAnswer?: UserAnswer | null;
}


interface CreateMockExamData {
  userId: number;
  examType: ExamType;
  subjects: string[]; // subject names
  questions: { questionId: number; sectionId?: number }[];
  title: string;
  description?: string;
  timeLimit: number;
  startTime: Date;
}

interface SubmitMockExamData {
  examId: number;
  userId: number;
  answers: {
    questionId: number;
    selectedOptionId: number;
    responseTime: number;
    sectionId?: number;
  }[];
}

export class MockExamService {
  static async getAvailableMockExams(userId: number) {
    // Get user's selected subjects
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { selectedSubjects: true }
    });

    const selectedSubjects = user?.selectedSubjects || [];

    // Validate subject names against the Subject model
    const validSubjects = await prisma.subject.findMany({
      where: { name: { in: selectedSubjects } },
      select: { name: true }
    });
    const subjects = validSubjects.map(subject => subject.name);

    return [
      {
        id: 'full_utme',
        title: 'Full UTME Mock Exam',
        description: '180 questions across all your subjects',
        type: 'FULL_UTME' as ExamType,
        subjects,
        questionCount: 180,
        timeLimit: 210, // 3.5 hours
        difficulty: 'mixed'
      },
      {
        id: 'subject_english',
        title: 'English Language Mock',
        description: '60 questions focused on English',
        type: 'SUBJECT_SPECIFIC' as ExamType,
        subjects: subjects.includes('english') ? ['english'] : [],
        questionCount: 60,
        timeLimit: 60,
        difficulty: 'mixed'
      },
      {
        id: 'subject_mathematics',
        title: 'Mathematics Mock',
        description: '60 questions focused on Mathematics',
        type: 'SUBJECT_SPECIFIC' as ExamType,
        subjects: subjects.includes('mathematics') ? ['mathematics'] : [],
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
        status: MockExamStatus.COMPLETED
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        examType: true,
        mockExamSubjects: {
          include: {
            subject: { select: { name: true } }
          }
        },
        questionCount: true,
        correctAnswers: true,
        percentage: true,
        completedAt: true
      }
    });

    return recentExams.map(exam => ({
      id: exam.id,
      examType: exam.examType,
      subject: exam.mockExamSubjects.length === 1
        ? exam.mockExamSubjects[0].subject.name
        : 'Multiple Subjects',
      questionCount: exam.questionCount,
      correctAnswers: exam.correctAnswers,
      percentage: exam.percentage,
      completedAt: exam.completedAt
    }));
  }

  static async createMockExam(data: CreateMockExamData) {
    // Find subject IDs
    const subjectRecords = await prisma.subject.findMany({
      where: { name: { in: data.subjects } }
    });
    if (subjectRecords.length !== data.subjects.length) {
      throw new Error('One or more subjects not found');
    }

    // Create the mock exam
const mockExam = await prisma.mockExam.create({
  data: {
    userId: data.userId,
    title: data.title,
    description: data.description,
    examType: data.examType,
    timeLimit: data.timeLimit,
    startTime: data.startTime,
    status: MockExamStatus.IN_PROGRESS,
    questionCount: data.questions.length,
    mockExamSubjects: {
      create: subjectRecords.map(subject => ({
        subjectId: subject.id
      }))
    },
    questions: {
      create: data.questions.map(q => ({
        questionId: q.questionId,
        sectionId: q.sectionId
      }))
    }
  },
  include: {
    mockExamSubjects: {
      include: {
        subject: true // so you can map s.subject.name
      }
    },
    questions: {
      include: {
        question: {
          include: {
            subject: true,
            topic: true,
            options: true
          }
        }
      }
    }
  }
});


    return mockExam;
  }

  static async submitMockExam(data: SubmitMockExamData) {
    // Fetch the exam and its questions
    const mockExam = await prisma.mockExam.findUnique({
      where: { id: data.examId },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                options: true,
                correctOptionId: true,
                subject: { select: { name: true } },
                topic: { select: { name: true } }
              }
            }
          }
        },
        mockExamSubjects: true
      }
    });
    if (!mockExam) throw new Error('Mock exam not found');
    if (mockExam.userId !== data.userId) throw new Error('Unauthorized');

    let correctAnswers = 0;
    let totalTimeSpent = 0;

    // Update each MockExamQuestion with user answer and correctness
    for (const answer of data.answers) {
      const examQuestion = mockExam.questions.find(q => q.questionId === answer.questionId);
      if (!examQuestion) continue;

      const isCorrect = answer.selectedOptionId === examQuestion.question.correctOptionId;
      if (isCorrect) correctAnswers++;
      totalTimeSpent += answer.responseTime;

      await prisma.mockExamQuestion.update({
        where: { id: examQuestion.id },
        data: {
          userAnswer: { selectedOptionId: answer.selectedOptionId },
          isCorrect,
          responseTime: answer.responseTime
        }
      });
    }

    // Calculate percentage
    const percentage = mockExam.questionCount && mockExam.questionCount > 0
      ? Math.round((correctAnswers / mockExam.questionCount) * 100)
      : 0;

    // Update exam status and stats
    const completedExam = await prisma.mockExam.update({
      where: { id: data.examId },
      data: {
        status: MockExamStatus.COMPLETED,
        correctAnswers,
        percentage,
        timeSpent: totalTimeSpent,
        completedAt: new Date(),
        endTime: new Date()
      }
    });

    // Update user analytics
    await this.updateUserAnalytics(data.userId, {
      mockExamTaken: true,
      percentage,
      subjectIds: mockExam.mockExamSubjects.map(s => s.subjectId)
    });

    return completedExam;
  }

static async getMockExamResults(examId: number, userId: number) {
  const exam = await prisma.mockExam.findFirst({
    where: {
      id: examId,
      userId,
      status: MockExamStatus.COMPLETED
    },
    include: {
      questions: {
        include: {
          question: {
            select: {
              id: true,
              text: true,
              options: true, // should be array of objects with id + text
              correctOptionId: true,
              explanation: true,
              subject: { select: { name: true } },
              topic: { select: { name: true } }
            }
          }
        }
      },
      mockExamSubjects: {
        include: {
          subject: { select: { name: true } }
        }
      }
    }
  });

  if (!exam) return null;

  const detailedResults = exam.questions.map(attempt => {
    // If options is stored as array of objects
    const optionIds = attempt.question.options.map(opt => opt.id);
    const optionTexts = attempt.question.options.map(opt => opt.text);

    return {
      questionId: attempt.questionId,
      question: attempt.question.text,
      options: optionTexts,            // string[]
      optionIds,                       // number[]
      selectedAnswer: (attempt.userAnswer as UserAnswer | null)?.selectedOptionId ?? null,
      correctAnswer: attempt.question.correctOptionId,
      isCorrect: attempt.isCorrect,
      subject: attempt.question.subject.name,
      topic: attempt.question.topic?.name ?? null,
      explanation: attempt.question.explanation,
      responseTime: attempt.responseTime
    };
  });

  return {
    examId: exam.id,
    examType: exam.examType,
    subjects: exam.mockExamSubjects.map(s => s.subject.name),
    questionCount: exam.questionCount,
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
          status: MockExamStatus.COMPLETED
        },
        orderBy: {
          completedAt: 'desc'
        },
        skip: offset,
        take: limit,
        select: {
          id: true,
          examType: true,
          mockExamSubjects: {
            include: {
              subject: { select: { name: true } }
            }
          },
          questionCount: true,
          correctAnswers: true,
          percentage: true,
          timeSpent: true,
          completedAt: true
        }
      }),
      prisma.mockExam.count({
        where: {
          userId,
          status: MockExamStatus.COMPLETED
        }
      })
    ]);

    return {
      exams: exams.map(exam => ({
        id: exam.id,
        examType: exam.examType,
        subjects: exam.mockExamSubjects.map(s => s.subject.name),
        questionCount: exam.questionCount,
        correctAnswers: exam.correctAnswers,
        percentage: exam.percentage,
        timeSpent: exam.timeSpent,
        completedAt: exam.completedAt
      })),
      total
    };
  }

  static async getIncompleteMockExam(examId: number, userId: number) {
    const exam = await prisma.mockExam.findFirst({
      where: {
        id: examId,
        userId,
        status: MockExamStatus.IN_PROGRESS
      },
      include: {
        questions: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                options: true,
                subject: { select: { name: true } },
                topic: { select: { name: true } },
                difficulty: true
              }
            }
          }
        },
        mockExamSubjects: {
          include: {
            subject: { select: { name: true } }
          }
        }
      }
    });

    if (!exam) return null;

    // Calculate time remaining
    const elapsed = Math.floor((Date.now() - exam.startTime.getTime()) / 1000);
    const timeRemaining = Math.max(0, ((exam.timeLimit ?? 0) * 60) - elapsed);

    // Get answered questions
    const answers: Record<number, any> = {};

    exam.questions.forEach(attempt => {
      if (attempt.userAnswer !== null) {
        const userAnswer = attempt.userAnswer as unknown as UserAnswer; // cast via unknown
        answers[attempt.questionId] = {
          questionId: attempt.questionId,
          selectedAnswer: userAnswer.selectedOptionId,
          responseTime: attempt.responseTime
        };
      }
    });


    return {
      id: exam.id,
      examType: exam.examType,
      subjects: exam.mockExamSubjects.map(s => s.subject.name),
      questions: exam.questions.map(attempt => ({
        id: attempt.question.id,
        text: attempt.question.text,
        options: attempt.question.options,
        subject: attempt.question.subject.name,
        topic: attempt.question.topic?.name ?? null,
        difficulty: attempt.question.difficulty
      })),
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
    // Update PerformanceSnapshot for each subject
    for (const subjectId of data.subjectIds) {
      await prisma.performanceSnapshot.upsert({
        where: {
          userId_subjectId: { userId, subjectId }
        },
        update: {
          predictedScore: data.percentage,
          takenAt: new Date()
        },
        create: {
          userId,
          subjectId,
          predictedScore: data.percentage,
          takenAt: new Date()
        }
      });
    }
  }
}