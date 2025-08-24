import { 
    PrismaClient, 
    PracticeSessionType, 
    DifficultyLevel, 
    MockExamStatus, 
    AchievementType,
    StudyTaskType,      // ADD THIS
    StudyTaskStatus     // ADD THIS
} from '@prisma/client';
import { ValidationError } from '../utils/errors/ValidationError';
import { NotFoundError } from '../utils/errors/NotFoundError';

const prisma = new PrismaClient();

type SessionDifficulty = DifficultyLevel | 'MIXED' | undefined;


interface SessionData {
    subjectId: number;
    sectionId?: number;
    topicId?: number;
    sessionType: PracticeSessionType;
    difficulty?: SessionDifficulty;
    questionCount?: number;
    timeLimit?: number;
    topicIds?: number[];
}

interface WeakAreasOptions {
    threshold?: number;
    limit?: number;
}

interface Context {
    sessionId?: string;
    score?: number;
    accuracy?: number;
    streak?: number;
    topicMastery?: number;
    questionsAnswered?: number;
}

interface Topic {
    id: number;
    name: string;
    description: string | null;
    sectionId: number | null;
    parentTopicId: number | null;
    topicMasteries: { mastery: number }[];
    questions: { id: number }[];
}

interface Section {
    id: number;
    name: string;
    description: string | null;
    topics: Topic[];
}

interface Subject {
    id: number;
    name: string;
    description: string | null;
    topics: Topic[];
    sections: Section[];
    performanceSnapshots: { trend: number | null }[];
}

interface QuestionAttempt {
    isCorrect: boolean;
    timeTaken: number;
    question: { topicId: number };
}

export class PracticeService {
    // Practice Home Screen Data
    async getPracticeDashboard(userId: number): Promise<any> {
        const [
            overallMastery,
            streak,
            recentSessions,
            subjectProgress,
            reviewQueue,
            recommendations
        ] = await Promise.all([
            this.calculateOverallMastery(userId),
            this.getUserStreak(userId),
            this.getRecentPracticeSessions(userId, 5),
            this.getSubjectMasteryOverview(userId),
            this.getDueReviewCount(userId),
            this.getPersonalizedRecommendations(userId)
        ]);

        return {
            overallMastery,
            streak,
            recentSessions,
            subjectProgress,
            reviewQueue,
            recommendations
        };
    }

    async getPerformanceSnapshot(userId: number): Promise<any> {
        const snapshots = await prisma.performanceSnapshot.findMany({
            where: { userId },
            include: {
                subject: { select: { name: true } }
            },
            orderBy: { takenAt: 'desc' },
            take: 10
        });

        const overall = await this.calculateOverallMastery(userId);

        return {
            overall,
            bySubject: snapshots.map(snapshot => ({
                subjectName: snapshot.subject.name,
                predictedScore: snapshot.predictedScore,
                confidence: snapshot.subjectConfidence,
                trend: snapshot.trend,
                takenAt: snapshot.takenAt
            }))
        };
    }

    async getPersonalizedRecommendations(userId: number): Promise<any[]> {
        const [weakAreas, reviewQueue, studyPlan] = await Promise.all([
            this.getWeakAreas(userId, { threshold: 0.6, limit: 3 }),
            this.getDueReviewCount(userId),
            this.getCurrentStudyPlan(userId)
        ]);

        const recommendations: any[] = [];

        // Spaced repetition recommendations
        if (reviewQueue.dueCount > 0) {
            recommendations.push({
                type: 'SPACED_REPETITION',
                priority: 'HIGH',
                title: 'Smart Review Due',
                description: `${reviewQueue.dueCount} questions ready for review`,
                action: 'START_SMART_REVIEW',
                metadata: { questionCount: reviewQueue.dueCount }
            });
        }

        // Weak areas recommendations
        weakAreas.forEach(area => {
            recommendations.push({
                type: 'WEAK_AREA',
                priority: area.mastery < 0.4 ? 'HIGH' : 'MEDIUM',
                title: `Focus on ${area.topicName}`,
                description: `Low confidence: ${Math.round(area.mastery * 100)}%`,
                action: 'PRACTICE_TOPIC',
                metadata: { 
                    topicId: area.topicId,
                    subjectId: area.subjectId,
                    currentMastery: area.mastery
                }
            });
        });

        // Study plan integration
        if (studyPlan && studyPlan.upcomingTasks.length > 0) {
            const nextTask = studyPlan.upcomingTasks[0];
            if (nextTask.type === 'PRACTICE') {
                recommendations.push({
                    type: 'STUDY_PLAN',
                    priority: 'MEDIUM',
                    title: 'Study Plan Task',
                    description: nextTask.title,
                    action: 'START_PLANNED_PRACTICE',
                    metadata: { taskId: nextTask.id }
                });
            }
        }

        return recommendations.sort((a, b) => {
            const priorityOrder: { [key: string]: number } = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    // Subject & Topic Management
async getSubjectsWithProgress(userId: number): Promise<any[]> {
    const subjects = await prisma.subject.findMany({
        include: {
            topics: {
                include: {
                    topicMasteries: {
                        where: { userId },
                        select: { mastery: true, accuracy: true }
                    }
                }
            },
            performanceSnapshots: {
                where: { userId },
                orderBy: { takenAt: 'desc' },
                take: 1
            },
            sections: true // Add sections to satisfy the Subject type
        }
    });

    return subjects.map(subject => {
      const masteries = subject.topics.flatMap(topic => topic.topicMasteries);
      const avgMastery = masteries.length > 0 
          ? masteries.reduce((sum, m) => sum + m.mastery, 0) / masteries.length
          : 0;
      const avgAccuracy = masteries.length > 0
          ? masteries.reduce((sum, m) => sum + m.accuracy, 0) / masteries.length
          : 0;

        const latestSnapshot = subject.performanceSnapshots[0];
        const trend = latestSnapshot ? latestSnapshot.trend : 0;

        return {
            id: subject.id,
            name: subject.name,
            description: subject.description,
            mastery: avgMastery,
            accuracy: avgAccuracy,
            trend,
            topicCount: subject.topics.length,
            masteredTopics: masteries.filter(m => m.mastery >= 0.8).length
        };
    });
}

    async getSubjectDetails(userId: number, subjectId: number): Promise<any> {
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            include: {
                sections: {
                    include: {
                        topics: {
                            include: {
                                topicMasteries: {
                                    where: { userId }
                                }
                            }
                        }
                    }
                },
                performanceSnapshots: {
                    where: { userId },
                    orderBy: { takenAt: 'desc' },
                    take: 5
                }
            }
        }) as Subject | null;

        if (!subject) {
            throw new NotFoundError('Subject not found');
        }

        // Calculate prerequisite mapping
        const topicMap = new Map<number, any>();
        subject.sections.forEach((section: Section) => {
            section.topics.forEach((topic: Topic) => {
                const mastery = topic.topicMasteries[0];
                topicMap.set(topic.id, {
                    ...topic,
                    mastery: mastery ? mastery.mastery : 0,
                    isUnlocked: this.isTopicUnlocked(topic, topicMap)
                });
            });
        });

        return {
            ...subject,
            sections: subject.sections.map((section: Section) => ({
                ...section,
                topics: section.topics.map((topic: Topic) => topicMap.get(topic.id))
            }))
        };
    }

async getSubjectSections(userId: number, subjectId: number): Promise<any[]> {
    const sections = await prisma.section.findMany({
        where: { subjectId },
        include: {
            topics: {
                include: {
                    topicMasteries: {
                        where: { userId }
                    },
                    questions: { select: { id: true } } // Include questions to satisfy Topic type
                }
            }
        }
    });

    return sections.map(section => ({
        id: section.id,
        name: section.name,
        description: section.description,
        topicCount: section.topics.length,
        masteredTopics: section.topics.filter(topic => 
            topic.topicMasteries.length > 0 && topic.topicMasteries[0].mastery >= 0.8
        ).length,
        avgMastery: this.calculateSectionMastery(section.topics, userId)
    }));
}

async getSectionTopics(userId: number, sectionId: number): Promise<any[]> {
    const section = await prisma.section.findUnique({
        where: { id: sectionId },
        include: {
            topics: {
                include: {
                    topicMasteries: {
                        where: { userId },
                        select: {
                            mastery: true,
                            accuracy: true,
                            questionsPracticed: true,
                            avgTime: true
                        }
                    },
                    questions: {
                        select: { id: true }
                    }
                }
            }
        }
    });

    if (!section) {
        throw new NotFoundError('Section not found');
    }

    return section.topics.map(topic => {
        const mastery = topic.topicMasteries[0];
        return {
            id: topic.id,
            name: topic.name,
            description: topic.description,
            questionCount: topic.questions.length,
            mastery: mastery ? mastery.mastery : 0,
            accuracy: mastery ? mastery.accuracy : 0,
            questionsPracticed: mastery ? mastery.questionsPracticed : 0,
            avgTime: mastery ? mastery.avgTime : 0,
            isUnlocked: true // Implement prerequisite logic
        };
    });
}

    async getTopicDetails(userId: number, topicId: number): Promise<any> {
        const topic = await prisma.topic.findUnique({
            where: { id: topicId },
            include: {
                subject: { select: { name: true } },
                section: { select: { name: true } },
                topicMasteries: {
                    where: { userId }
                },
                questions: {
                    select: { 
                        id: true, 
                        difficulty: true,
                        questionAttempts: {
                            where: { userId },
                            select: { isCorrect: true, timeTaken: true }
                        }
                    }
                },
                subtopics: {
                    include: {
                        topicMasteries: {
                            where: { userId }
                        }
                    }
                }
            }
        });

        if (!topic) {
            throw new NotFoundError('Topic not found');
        }

        const mastery = topic.topicMasteries[0];
        const attempts = topic.questions.flatMap(q => q.questionAttempts);
        
        return {
            ...topic,
            mastery: mastery ? mastery.mastery : 0,
            accuracy: mastery ? mastery.accuracy : 0,
            questionsPracticed: mastery ? mastery.questionsPracticed : 0,
            avgTime: mastery ? mastery.avgTime : 0,
            totalQuestions: topic.questions.length,
            difficultyBreakdown: this.calculateDifficultyBreakdown(topic.questions),
            recentPerformance: this.calculateRecentPerformance(attempts),
            subtopics: topic.subtopics.map((subtopic: any) => ({
                ...subtopic,
                mastery: subtopic.topicMasteries[0]?.mastery || 0
            }))
        };
    }

    async getTopicMastery(userId: number, topicId: number): Promise<any> {
        let mastery = await prisma.topicMastery.findUnique({
            where: {
                userId_topicId: { userId, topicId }
            }
        });

        if (!mastery) {
            // Create initial mastery record
            mastery = await prisma.topicMastery.create({
                data: {
                    userId,
                    topicId,
                    mastery: 0,
                    questionsPracticed: 0,
                    accuracy: 0,
                    avgTime: 0
                }
            });
        }

        return mastery;
    }

    // Practice Session Management
async createPracticeSession(
  userId: number,
  sessionData: SessionData
): Promise<any> {
  let {
    subjectId,
    sectionId,
    topicId,
    sessionType,
    difficulty,
    questionCount = 15,
    timeLimit,
    topicIds = []
  } = sessionData;

  if (!subjectId || !sessionType) {
    throw new ValidationError('Subject ID and session type are required');
  }

  // Normalize topicIds
  if (topicIds.length === 0 && topicId) {
    topicIds = [topicId];
  }

  // Normalize difficulty: "MIXED" → null for DB
  const dbDifficulty: DifficultyLevel | null =
    difficulty === 'MIXED' ? null : (difficulty ?? null);

  // Create practice session
  const session = await prisma.practiceSession.create({
    data: {
      userId,
      subjectId,
      sectionId,
      topicId: topicIds[0] || null,
      sessionType,
      difficulty: dbDifficulty,
      questionCount,
      timeLimit,
      status: MockExamStatus.IN_PROGRESS
    }
  });

  // Link multiple topics
  if (topicIds.length > 0) {
    await prisma.practiceSessionTopic.createMany({
      data: topicIds.map((tId) => ({
        practiceSessionId: session.id,
        topicId: tId
      }))
    });
  }

  // Generate questions
  const questions = await this.generateSessionQuestions({
    ...session,
    difficulty: difficulty // keep original string ("MIXED") for logic
  });

  return {
    ...session,
    questions: questions.map((q) => ({ id: q.id }))
  };
}

async generateSessionQuestions(session: any): Promise<any[]> {
  const {
    userId,
    subjectId,
    sectionId,
    topicId,
    sessionType,
    difficulty,
    questionCount
  } = session;

  let whereClause: any = { subjectId };

  if (sectionId) whereClause.sectionId = sectionId;
  if (topicId) {
  // check if this topic has children
  const children = await prisma.topic.findMany({
    where: { parentTopicId: topicId },
    select: { id: true }
  });

  if (children.length > 0) {
    // Parent topic: include children
    whereClause.topicId = { in: children.map(c => c.id) };
  } else {
    // Leaf topic: just itself
    whereClause.topicId = topicId;
  }
}


  // Only filter difficulty if explicitly specified and not MIXED
  if (difficulty && difficulty !== 'MIXED') {
    whereClause.difficulty = difficulty;
  }

  // Session type logic
  switch (sessionType) {
    case 'DIAGNOSTIC':
      whereClause.isDiagnostic = true;
      break;
    case 'REVIEW':
      return this.getReviewQuestions(userId, questionCount);
    case 'ADAPTIVE':
      return this.getAdaptiveQuestions(userId, session);
    default:
      break;
  }

  // Fetch from DB
  const questions = await prisma.question.findMany({
    where: whereClause,
    include: {
      topic: { select: { name: true } },
      options: true,
      image: true,
      passage: true
    },
    orderBy: [{ createdAt: 'desc' }],
    take: questionCount * 2
  });

  // MIXED difficulty logic
  let finalQuestions: any[] = [];
  if (!difficulty || difficulty === 'MIXED') {
    const easyQs = questions.filter((q) => q.difficulty === 'EASY');
    const mediumQs = questions.filter((q) => q.difficulty === 'MEDIUM');
    const hardQs = questions.filter((q) => q.difficulty === 'HARD');

    finalQuestions = [
      ...this.shuffleArray(mediumQs).slice(0, Math.ceil(questionCount * 0.5)),
      ...this.shuffleArray(easyQs).slice(0, Math.ceil(questionCount * 0.3)),
      ...this.shuffleArray(hardQs).slice(0, Math.ceil(questionCount * 0.2))
    ];

    finalQuestions = this.shuffleArray(finalQuestions).slice(
      0,
      questionCount
    );
  } else {
    finalQuestions = this.shuffleArray(questions).slice(
      0,
      Math.min(questionCount, questions.length)
    );
  }

  return finalQuestions;
}


    async getPracticeSession(userId: number, sessionId: string): Promise<any> {
        const session = await prisma.practiceSession.findFirst({
            where: { id: sessionId, userId },
            include: {
                subject: { select: { name: true } },
                section: { select: { name: true } },
                topic: { select: { name: true } },
                topics: {
                    include: {
                        topic: { select: { name: true } }
                    }
                },
                questionAttempts: {
                    include: {
                        question: {
                            include: {
                                options: true,
                                topic: { select: { name: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!session) {
            throw new NotFoundError('Practice session not found');
        }

        return session;
    }

async preloadQuestions(sessionId: string, currentIndex: number, count: number) {
  const session = await prisma.practiceSession.findUnique({
    where: { id: sessionId },
    include: { questionAttempts: true }
  });
  if (!session) throw new Error('Session not found');

  // Regenerate the ordered pool of questions for this session
  const allQuestions = await this.generateSessionQuestions({
    ...session,
    difficulty: session.difficulty ?? 'MIXED' // preserve original logic
  });

  // Slice out the IDs for the requested chunk
  const slice = allQuestions.slice(currentIndex, currentIndex + count);

  // Fetch full data for these IDs
  const questions = await prisma.question.findMany({
    where: { id: { in: slice.map((q) => q.id) } },
    include: {
      topic: { select: { name: true } },
      options: true,
      image: true,
      passage: true
    }
  });

  console.log('Preloaded questions:', questions.length);

  // Maintain original order of slice
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  return slice.map((q) => questionMap.get(q.id)).filter(Boolean);
}


    async updatePracticeSession(userId: number, sessionId: string, updateData: any): Promise<any> {
        const session = await prisma.practiceSession.findFirst({
            where: { id: sessionId, userId }
        });

        if (!session) {
            throw new NotFoundError('Practice session not found');
        }

        return prisma.practiceSession.update({
            where: { id: sessionId },
            data: updateData
        });
    }

    async completePracticeSession(userId: number, sessionId: string): Promise<any> {
        const session = await prisma.practiceSession.findFirst({
            where: { id: sessionId, userId },
            include: {
                questionAttempts: {
                    include: {
                        question: {
                            include: {
                                topic: true,
                                options: true
                            }
                        }
                    }
                }
            }
        });

        if (!session) {
            throw new NotFoundError('Practice session not found');
        }

        // Calculate session statistics
        const correctCount = session.questionAttempts.filter((a: QuestionAttempt) => a.isCorrect).length;
        const accuracy = session.questionAttempts.length > 0 
            ? correctCount / session.questionAttempts.length 
            : 0;
        const totalTime = session.questionAttempts.reduce((sum: number, a: QuestionAttempt) => sum + a.timeTaken, 0);
        const avgTime = session.questionAttempts.length > 0 
            ? totalTime / session.questionAttempts.length 
            : 0;

        // Update session
        const completedSession = await prisma.practiceSession.update({
            where: { id: sessionId },
            data: {
                status: MockExamStatus.COMPLETED,
                endTime: new Date(),
                correctCount,
                answeredCount: session.questionAttempts.length
            }
        });

        // Update topic masteries
        await this.updateTopicMasteries(userId, session.questionAttempts);

        // Update spaced repetition schedules
        await this.updateSpacedRepetitionSchedules(userId, session.questionAttempts);

        // Generate session summary
        const summary = await this.generateSessionSummary(completedSession, session.questionAttempts);

        return summary;
    }

    async submitQuestionAttempt(userId: number, sessionId: string, questionId: number, attemptData: any): Promise<any> {
        const { selectedOption, timeTaken, confidenceLevel } = attemptData;

        // Validate session belongs to user
        const session = await prisma.practiceSession.findFirst({
            where: { id: sessionId, userId }
        });

        if (!session) {
            throw new NotFoundError('Practice session not found');
        }

        // Get question with correct answer
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                options: true
            }
        });

        if (!question) {
            throw new NotFoundError('Question not found');
        }

        // Validate selected option
        if (!question.options.some(opt => opt.id === selectedOption)) {
            throw new ValidationError('Invalid option selected');
        }

        const isCorrect = question.options.find(opt => opt.id === selectedOption)?.isCorrect || false;

        // Create question attempt
        const attempt = await prisma.questionAttempt.create({
            data: {
                userId,
                practiceSessionId: sessionId,
                questionId,
                selectedOption,
                isCorrect,
                timeTaken,
                confidenceLevel,
                attemptedAt: new Date()
            }
        });

        // Update topic mastery
        await this.updateTopicMastery(userId, question.topicId, isCorrect, timeTaken, confidenceLevel);

        return {
            attemptId: attempt.id,
            isCorrect,
            confidenceLevel,
            timeTaken
        };
    }

    // Leaderboard Management
    async updateLeaderboard(userId: number, score: number, period: string = 'weekly'): Promise<void> {
        await prisma.leaderboard.upsert({
            where: { userId_period: { userId, period } },
            update: {
                score: { increment: score },
                updatedAt: new Date()
            },
            create: {
                userId,
                score,
                period,
                updatedAt: new Date()
            }
        });
    }

    async getLeaderboard(period: string = 'weekly', limit: number = 100): Promise<any[]> {
        const leaderboard = await prisma.leaderboard.findMany({
            where: { period },
            include: {
                user: {
                    select: {
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { score: 'desc' },
            take: limit
        });

        return leaderboard.map(entry => ({
            userId: entry.userId,
            username: entry.user.username,
            firstName: entry.user.firstName,
            lastName: entry.user.lastName,
            avatarUrl: entry.user.avatarUrl,
            score: entry.score,
            period
        }));
    }

    async getUserRank(userId: number, period: string = 'weekly'): Promise<number> {
        const userScore = await this.getUserScore(userId, period);
        const higherScores = await prisma.leaderboard.count({
            where: {
                period,
                score: { gt: userScore }
            }
        });
        return higherScores + 1;
    }

    async getUserScore(userId: number, period: string): Promise<number> {
        const entry = await prisma.leaderboard.findUnique({
            where: { userId_period: { userId, period } }
        });
        return entry?.score || 0;
    }

    // Sharing
    async shareProgress(userId: number, achievementId: number, message: string, privacy: string = 'PUBLIC'): Promise<any> {
        const achievement = await prisma.achievement.findFirst({
            where: { id: achievementId, userId }
        });
        if (!achievement) {
            throw new NotFoundError('Achievement not found');
        }

        return await prisma.sharedProgress.create({
            data: {
                userId,
                achievementId,
                message,
                privacy,
                createdAt: new Date()
            }
        });
    }

    // Gamification Enhancements
    async checkAndAwardAchievements(userId: number, context: Context = {}): Promise<any[]> {
        const { sessionId, score, accuracy, streak, topicMastery } = context;
        const newAchievements: any[] = [];

        // Fetch session data if sessionId is provided
        let session = null;
        if (sessionId) {
            session = await prisma.practiceSession.findFirst({
                where: { id: sessionId, userId },
                include: { questionAttempts: true }
            });
            if (!session) throw new NotFoundError('Practice session not found');
        }

        // Score-based achievements
        if (score && score >= 90) {
            newAchievements.push(await this.awardAchievement(userId, 'SCORE', 'Scored 90%+ in practice', 50));
        }
        if (score && score >= 95) {
            newAchievements.push(await this.awardAchievement(userId, 'SCORE', 'Scored 95%+ in practice', 100));
        }

        // Accuracy achievements
        const questionsAnswered = session?.questionCount || context.questionsAnswered || 0;
        if (accuracy && accuracy >= 0.95 && questionsAnswered >= 10) {
            newAchievements.push(await this.awardAchievement(userId, 'SCORE', 'Maintained 95%+ accuracy', 75));
        }

        // Streak achievements
        if (streak && streak >= 7) {
            newAchievements.push(await this.awardAchievement(userId, 'MILESTONE', '7-day practice streak', 100));
        }
        if (streak && streak >= 30) {
            newAchievements.push(await this.awardAchievement(userId, 'MILESTONE', '30-day practice streak', 500));
        }

        // Topic mastery achievements
        if (topicMastery && topicMastery >= 0.9) {
            newAchievements.push(await this.awardAchievement(userId, 'BADGE', 'Achieved 90%+ topic mastery', 200));
        }

        // Volume achievements
        const totalSessions = await this.getUserSessionCount(userId);
        if (totalSessions >= 50) {
            newAchievements.push(await this.awardAchievement(userId, 'BADGE', 'Completed 50 practice sessions', 300));
        }
        if (totalSessions >= 100) {
            newAchievements.push(await this.awardAchievement(userId, 'BADGE', 'Completed 100 practice sessions', 750));
        }

        return newAchievements.filter(Boolean);
    }

async awardAchievement(userId: number, type: AchievementType, description: string, points: number): Promise<any | null> {
    const existing = await prisma.achievement.findFirst({
        where: { userId, type }
    });

    if (existing) return null;

    return await prisma.achievement.create({
        data: {
            userId,
            type,
            title: this.getAchievementTitle(type),
            description,
            points,
            earnedAt: new Date()
        }
    });
}

    getAchievementTitle(type: AchievementType): string {
        const titles: { [key in AchievementType]: string } = {
            BADGE: 'Badge',
            MILESTONE: 'Milestone',
            SCORE: 'Score'
        };
        return titles[type] || type;
}

    async awardBadge(userId: number, badgeType: string, metadata: any = {}): Promise<any> {
        return await prisma.badge.create({
            data: {
                userId,
                type: badgeType,
                earnedAt: new Date()
            }
        });
    }

    async getUserBadges(userId: number): Promise<any[]> {
        return await prisma.badge.findMany({
            where: { userId },
            orderBy: { earnedAt: 'desc' }
        });
    }

    async updateStreak(userId: number, activity: string = 'practice'): Promise<any> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const streak = await prisma.streak.findFirst({
            where: { userId },
            orderBy: { lastActive: 'desc' }
        });

        if (!streak) {
            return await prisma.streak.create({
                data: {
                    userId,
                    count: 1,
                    lastActive: new Date()
                }
            });
        }

        const lastActive = new Date(streak.lastActive);
        lastActive.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            return streak;
        } else if (daysDiff === 1) {
            return await prisma.streak.update({
                where: { id: streak.id },
                data: {
                    count: streak.count + 1,
                    lastActive: new Date()
                }
            });
        } else {
            return await prisma.streak.update({
                where: { id: streak.id },
                data: {
                    count: 1,
                    lastActive: new Date()
                }
            });
        }
    }

    async getCurrentStreak(userId: number): Promise<number> {
        const streak = await prisma.streak.findFirst({
            where: { userId },
            orderBy: { lastActive: 'desc' }
        });

        if (!streak) return 0;

        const today = new Date();
        const lastActive = new Date(streak.lastActive);
        const hoursDiff = (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

        return hoursDiff <= 24 ? streak.count : 0;
    }

    async calculateSessionPoints(sessionData: any): Promise<number> {
        const { correctCount, totalQuestions, accuracy, timeTaken, averageTime } = sessionData;
        
        let basePoints = correctCount * 10;
        
        if (accuracy >= 0.9) basePoints += 50;
        else if (accuracy >= 0.8) basePoints += 30;
        else if (accuracy >= 0.7) basePoints += 15;

        if (timeTaken < averageTime * 0.8) {
            basePoints += 25;
        }

        if (correctCount === totalQuestions) {
            basePoints += 100;
        }

        return Math.floor(basePoints);
    }

    async getUserSessionCount(userId: number): Promise<number> {
        return await prisma.practiceSession.count({
            where: { 
                userId,
                status: 'COMPLETED'
            }
        });
    }

    async getUserTotalPoints(userId: number): Promise<number> {
        const achievements = await prisma.achievement.findMany({
            where: { userId },
            select: { points: true }
        });

        return achievements.reduce((total, achievement) => total + achievement.points, 0);
    }

    async getGamificationSummary(userId: number): Promise<any> {
        const [achievements, badges, currentStreak, totalPoints, rank] = await Promise.all([
            prisma.achievement.count({ where: { userId } }),
            this.getUserBadges(userId),
            this.getCurrentStreak(userId),
            this.getUserTotalPoints(userId),
            this.getUserRank(userId, 'weekly')
        ]);

        return {
            achievementCount: achievements,
            badges: badges.length,
            currentStreak,
            totalPoints,
            weeklyRank: rank,
            level: Math.floor(totalPoints / 1000) + 1
        };
    }

    // Helper Methods
    async calculateOverallMastery(userId: number): Promise<any> {
        const masteries = await prisma.topicMastery.findMany({
            where: { userId }
        });

        if (masteries.length === 0) return { mastery: 0, questionsAnswered: 0, accuracy: 0 };

        const totalMastery = masteries.reduce((sum, m) => sum + m.mastery, 0);
        const totalQuestions = masteries.reduce((sum, m) => sum + m.questionsPracticed, 0);
        const weightedAccuracy = masteries.reduce((sum, m) => sum + (m.accuracy * m.questionsPracticed), 0);

        return {
            mastery: totalMastery / masteries.length,
            questionsAnswered: totalQuestions,
            accuracy: totalQuestions > 0 ? weightedAccuracy / totalQuestions : 0
        };
    }

    async getUserStreak(userId: number): Promise<any> {
        const streak = await prisma.streak.findFirst({
            where: { userId },
            orderBy: { lastActive: 'desc' }
        });

        if (!streak) {
            return { count: 0, lastActive: null };
        }

        // Check if streak is still active (within last 24 hours)
        const now = new Date();
        const lastActive = new Date(streak.lastActive);
        const hoursDiff = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

        return {
            count: hoursDiff <= 24 ? streak.count : 0,
            lastActive: streak.lastActive
        };
    }

    async getWeakAreas(userId: number, options: WeakAreasOptions = {}): Promise<any[]> {
        const { threshold = 0.7, limit = 10 } = options;

        const weakTopics = await prisma.topicMastery.findMany({
            where: {
                userId,
                mastery: { lt: threshold },
                questionsPracticed: { gte: 5 } // Only consider topics with sufficient attempts
            },
            include: {
                topic: {
                    include: {
                        subject: { select: { id: true, name: true } }
                    }
                }
            },
            orderBy: [
                { mastery: 'asc' },
                { questionsPracticed: 'desc' }
            ],
            take: limit
        });

        return weakTopics.map(wt => ({
            topicId: wt.topicId,
            topicName: wt.topic.name,
            subjectId: wt.topic.subject.id,
            subjectName: wt.topic.subject.name,
            mastery: wt.mastery,
            accuracy: wt.accuracy,
            questionsPracticed: wt.questionsPracticed,
            avgTime: wt.avgTime
        }));
    }

    isTopicUnlocked(topic: Topic, topicMap: Map<number, any>): boolean {
        // Simple prerequisite logic - can be enhanced
        if (!topic.parentTopicId) return true;
        
        const parent = topicMap.get(topic.parentTopicId);
        return parent && parent.mastery >= 0.7;
    }

    calculateSectionMastery(topics: Topic[], userId: number): number {
        const masteries = topics
            .filter(topic => topic.topicMasteries.length > 0)
            .map(topic => topic.topicMasteries[0].mastery);
        
        return masteries.length > 0 
            ? masteries.reduce((sum: number, m: number) => sum + m, 0) / masteries.length 
            : 0;
    }

    shuffleArray(array: any[]): any[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    calculateDifficultyBreakdown(attempts: any[]): any[] {
        const breakdown: { [key: string]: { correct: number, total: number } } = {
            EASY: { correct: 0, total: 0 },
            MEDIUM: { correct: 0, total: 0 },
            HARD: { correct: 0, total: 0 }
        };
        attempts.forEach(attempt => {
            const difficulty = attempt.question.difficulty;
            breakdown[difficulty].total += 1;
            if (attempt.isCorrect) breakdown[difficulty].correct += 1;
        });
        return Object.entries(breakdown).map(([difficulty, stats]) => ({
            difficulty,
            accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
            total: stats.total
        }));
    }

    calculateRecentPerformance(attempts: any[]): any {
        const recentAttempts = attempts.slice(0, 10);
        const correct = recentAttempts.filter((a: any) => a.isCorrect).length;
        const total = recentAttempts.length;
        return {
            accuracy: total > 0 ? correct / total : 0,
            avgTime: total > 0 ? recentAttempts.reduce((sum: number, a: any) => sum + a.timeTaken, 0) / total : 0
        };
    }

    async updateTopicMasteries(userId: number, questionAttempts: QuestionAttempt[]): Promise<void> {
        const topicGroups = questionAttempts.reduce((acc: { [key: number]: QuestionAttempt[] }, attempt) => {
            const topicId = attempt.question.topicId;
            if (!acc[topicId]) acc[topicId] = [];
            acc[topicId].push(attempt);
            return acc;
        }, {});

        for (const [topicId, attempts] of Object.entries(topicGroups)) {
            const correct = attempts.filter((a: QuestionAttempt) => a.isCorrect).length;
            const total = attempts.length;
            const avgTime = total > 0 ? attempts.reduce((sum: number, a: QuestionAttempt) => sum + a.timeTaken, 0) / total : 0;

            await prisma.topicMastery.upsert({
                where: { userId_topicId: { userId, topicId: parseInt(topicId) } },
                update: {
                    mastery: { increment: correct / total * 0.1 },
                    accuracy: correct / total,
                    questionsPracticed: { increment: total },
                    avgTime
                },
                create: {
                    userId,
                    topicId: parseInt(topicId),
                    mastery: correct / total * 0.1,
                    accuracy: correct / total,
                    questionsPracticed: total,
                    avgTime
                }
            });
        }
    }

    async updateSpacedRepetitionSchedules(userId: number, questionAttempts: any[]): Promise<void> {
        for (const attempt of questionAttempts) {
            const performance = attempt.isCorrect ? 0.8 : 0.2;
            const interval = this.calculateReviewInterval(performance);
            await prisma.reviewSchedule.upsert({
                where: { userId_questionId: { userId, questionId: attempt.questionId } },
                update: {
                    nextReview: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
                    performance
                },
                create: {
                    userId,
                    questionId: attempt.questionId,
                    nextReview: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
                    performance
                }
            });
        }
    }

    async generateSessionSummary(session: any, questionAttempts: any[]): Promise<any> {
        const correctCount = questionAttempts.filter((a: any) => a.isCorrect).length;
        const accuracy = questionAttempts.length > 0 ? correctCount / questionAttempts.length : 0;
        const avgTime = questionAttempts.length > 0 
            ? questionAttempts.reduce((sum: number, a: any) => sum + a.timeTaken, 0) / questionAttempts.length 
            : 0;

        return {
            sessionId: session.id,
            correctCount,
            totalQuestions: questionAttempts.length,
            accuracy,
            avgTime,
            completedAt: session.endTime
        };
    }

    async getReviewQuestions(userId: number, questionCount: number): Promise<any[]> {
        const reviewSchedules = await prisma.reviewSchedule.findMany({
            where: {
                userId,
                nextReview: { lte: new Date() }
            },
            include: {
                question: {
                    include: {
                        topic: { select: { name: true } },
                        options: true
                    }
                }
            },
            take: questionCount
        });

        return reviewSchedules.map((schedule: any) => schedule.question);
    }

    async getAdaptiveQuestions(userId: number, session: any): Promise<any[]> {
        const difficultyLevel = await this.getUserDifficultyLevel(userId, session.subjectId, session.topicId);
        const questions = await prisma.question.findMany({
            where: {
                subjectId: session.subjectId,
                topicId: session.topicId,
                difficulty: difficultyLevel
            },
            include: {
                topic: { select: { name: true } },
                options: true
            },
            take: session.questionCount
        });

        return questions;
    }

    async getDueReviewCount(userId: number): Promise<any> {
        const dueCount = await prisma.reviewSchedule.count({
            where: {
                userId,
                nextReview: { lte: new Date() }
            }
        });
        return { dueCount };
    }

    async getCurrentStudyPlan(userId: number): Promise<any> {
        return await prisma.studyPlan.findFirst({
            where: { userId },
            include: {
                tasks: {
                    where: { dueDate: { gte: new Date() } },
                    orderBy: { dueDate: 'asc' },
                    take: 1
                }
            }
        });
    }

    calculateReviewInterval(performance: number): number {
        if (performance >= 0.8) return 4; // 4 days for high performance
        if (performance >= 0.5) return 2; // 2 days for medium
        return 1; // 1 day for low performance
    }

    calculateEaseFactor(performance: number): number {
        return Math.max(1.3, 2.5 + (performance - 0.5) * 0.5); // Adjust based on performance
    }

async getNextQuestion(sessionId: string, userId: number): Promise<any> {
    const session = await prisma.practiceSession.findUnique({
        where: { id: sessionId },
        include: { questionAttempts: { select: { questionId: true } } }
    });
    if (!session) throw new NotFoundError('Practice session not found');

    const whereClause: any = {
        subjectId: session.subjectId,
        id: { notIn: session.questionAttempts.map(a => a.questionId) }
    };
    if (session.topicId) {
        whereClause.topicId = session.topicId;
    }

    const question = await prisma.question.findFirst({
        where: whereClause,
        include: { options: true }
    });
    if (!question) throw new NotFoundError('No more questions available');
    return question;
}

async getUserDifficultyLevel(
  userId: number,
  subjectId: number,
  topicId: number | null = null
): Promise<DifficultyLevel> {
  if (!topicId) return DifficultyLevel.EASY; // Default

  const mastery = await prisma.topicMastery.findFirst({
    where: { userId, topicId }
  });

  if (!mastery || mastery.mastery < 0.5) return DifficultyLevel.EASY;
  if (mastery.mastery < 0.8) return DifficultyLevel.MEDIUM;
  return DifficultyLevel.HARD;
}

    async getSpeedOptimizedQuestions(userId: number, subjects: any[], questionCount: number): Promise<any[]> {
        return await prisma.question.findMany({
            where: { subjectId: { in: subjects.map(s => s.id) } },
            include: { topic: { select: { name: true } } },
            take: questionCount
        });
    }

    async getDiagnosticQuestions(subjectId: number): Promise<any[]> {
        return await prisma.question.findMany({
            where: { subjectId, isDiagnostic: true },
            include: { topic: { select: { name: true } } },
            take: 25
        });
    }

    estimateQuestionTime(difficulty: string): number {
        const times: { [key: string]: number } = { EASY: 60, MEDIUM: 90, HARD: 120 };
        return times[difficulty] || 90; // Seconds
    }


async updateTopicMastery(userId: number, topicId: number, isCorrect: boolean, timeTaken: number, confidenceLevel: number): Promise<void> {
    const mastery = await prisma.topicMastery.findUnique({
        where: { userId_topicId: { userId, topicId } }
    });

    const updateData = {
        questionsPracticed: { increment: 1 },
        avgTime: mastery ? (mastery.avgTime * mastery.questionsPracticed + timeTaken) / (mastery.questionsPracticed + 1) : timeTaken,
        accuracy: mastery ? (mastery.accuracy * mastery.questionsPracticed + (isCorrect ? 1 : 0)) / (mastery.questionsPracticed + 1) : isCorrect ? 1 : 0,
        mastery: mastery ? mastery.mastery + (isCorrect ? 0.1 : -0.05) : isCorrect ? 0.1 : 0
    };

    await prisma.topicMastery.upsert({
        where: { userId_topicId: { userId, topicId } },
        update: updateData,
        create: {
            userId,
            topicId,
            questionsPracticed: 1, // Use plain number for create
            avgTime: updateData.avgTime,
            accuracy: updateData.accuracy,
            mastery: updateData.mastery
        }
    });
}

   async getSubjectMasteryOverview(userId: number): Promise<any[]> {
    const subjects = await prisma.subject.findMany({
        include: {
            topics: {
                include: {
                    topicMasteries: {
                        where: { userId }
                    }
                }
            },
            sections: true, // Include sections
            performanceSnapshots: true // Include performanceSnapshots
        }
    });

    return subjects.map(subject => {
        const masteries = subject.topics.flatMap(topic => topic.topicMasteries);
        const avgMastery = masteries.length > 0 
            ? masteries.reduce((sum, m) => sum + m.mastery, 0) / masteries.length
            : 0;
        return {
            id: subject.id,
            name: subject.name,
            mastery: avgMastery
        };
    });
}
    async getRecentPracticeSessions(userId: number, limit: number): Promise<any[]> {
        return await prisma.practiceSession.findMany({
            where: { userId, status: 'COMPLETED' },
            include: {
                subject: { select: { name: true } },
                topic: { select: { name: true } }
            },
            orderBy: { endTime: 'desc' },
            take: limit
        });
    }

    // Add these methods to your existing PracticeService class

// ==========================================
// MISSING SESSION MANAGEMENT METHODS
// ==========================================

async cancelPracticeSession(userId: number, sessionId: string): Promise<void> {
    const session = await prisma.practiceSession.findFirst({
        where: { id: sessionId, userId }
    });

    if (!session) {
        throw new NotFoundError('Practice session not found');
    }

    await prisma.practiceSession.update({
        where: { id: sessionId },
        data: {
            status: MockExamStatus.COMPLETED, // or add CANCELLED status to enum
            endTime: new Date()
        }
    });
}

async getSessionQuestions(userId: number, sessionId: string): Promise<any[]> {
    const session = await prisma.practiceSession.findFirst({
        where: { id: sessionId, userId },
        include: {
            questionAttempts: {
                include: {
                    question: {
                        include: {
                            options: true,
                            topic: { select: { name: true } },
                            passage: true,
                            image: true
                        }
                    }
                }
            }
        }
    });

    if (!session) {
        throw new NotFoundError('Practice session not found');
    }

    return session.questionAttempts.map(attempt => attempt.question);
}

async getCurrentQuestion(userId: number, sessionId: string, questionIndex: number): Promise<any> {
    const session = await prisma.practiceSession.findFirst({
        where: { id: sessionId, userId },
        include: {
            questionAttempts: {
                include: {
                    question: {
                        include: {
                            options: true,
                            topic: { select: { name: true } },
                            passage: true,
                            image: true
                        }
                    }
                }
            }
        }
    });

    if (!session) {
        throw new NotFoundError('Practice session not found');
    }

    if (questionIndex >= session.questionAttempts.length) {
        throw new NotFoundError('Question index out of bounds');
    }

    return session.questionAttempts[questionIndex].question;
}

// ==========================================
// SMART PRACTICE MODES
// ==========================================

async createSmartReviewSession(userId: number, limit: number = 15): Promise<any> {
    // Get questions that need review based on spaced repetition
    const reviewQuestions = await this.getReviewQuestions(userId, limit);
    
    if (reviewQuestions.length === 0) {
        throw new ValidationError('No questions available for review');
    }

    // Create a review session using the first available subject
    const subjectId = reviewQuestions[0].subjectId;
    
    return await this.createPracticeSession(userId, {
        subjectId,
        sessionType: PracticeSessionType.REVIEW,
        questionCount: reviewQuestions.length
    });
}

async createAdaptiveDrillSession(userId: number, options: {
    subjectId?: number;
    topicId?: number;
    targetDifficulty?: number;
}): Promise<any> {
    const { subjectId, topicId, targetDifficulty } = options;
    
    if (!subjectId) {
        throw new ValidationError('Subject ID is required for adaptive drill session');
    }

    // Determine appropriate difficulty based on user's mastery
    let difficulty: DifficultyLevel;
    if (targetDifficulty) {
        difficulty = targetDifficulty === 1 ? DifficultyLevel.EASY : 
                    targetDifficulty === 2 ? DifficultyLevel.MEDIUM : 
                    DifficultyLevel.HARD;
    } else {
        difficulty = await this.getUserDifficultyLevel(userId, subjectId, topicId);
    }

    return await this.createPracticeSession(userId, {
        subjectId,
        topicId,
        sessionType: PracticeSessionType.PRACTICE,
        difficulty,
        questionCount: 20
    });
}

async createTimedSprintSession(userId: number, options: {
    questionCount: number;
    timeLimit: number;
}): Promise<any> {
    const { questionCount, timeLimit } = options;
    
    // Get user's strongest subjects for sprint mode
    const subjects = await this.getSubjectsWithProgress(userId);
    const strongestSubject = subjects.reduce((prev, current) => 
        prev.mastery > current.mastery ? prev : current
    );

    return await this.createPracticeSession(userId, {
        subjectId: strongestSubject.id,
        sessionType: PracticeSessionType.TIMED,
        questionCount,
        timeLimit
    });
}

async createDiagnosticSession(userId: number, subjectId?: number): Promise<any> {
    if (!subjectId) {
        // Get first available subject if not specified
        const subjects = await prisma.subject.findFirst();
        if (!subjects) {
            throw new ValidationError('No subjects available for diagnostic session');
        }
        subjectId = subjects.id;
    }

    return await this.createPracticeSession(userId, {
        subjectId,
        sessionType: PracticeSessionType.DIAGNOSTIC,
        questionCount: 25 // Standard diagnostic question count
    });
}

// ==========================================
// SPACED REPETITION METHODS
// ==========================================

async getReviewQueue(userId: number, limit: number = 50): Promise<any> {
    const reviewSchedules = await prisma.reviewSchedule.findMany({
        where: {
            userId,
            nextReview: { lte: new Date() }
        },
        include: {
            question: {
                include: {
                    topic: { select: { name: true } },
                    subject: { select: { name: true } }
                }
            }
        },
        orderBy: { nextReview: 'asc' },
        take: limit
    });

    return {
        dueCount: reviewSchedules.length,
        questions: reviewSchedules.map(schedule => ({
            ...schedule.question,
            nextReview: schedule.nextReview,
            performance: schedule.performance
        }))
    };
}

async scheduleReview(userId: number, data: {
    questionId: number;
    difficulty: number;
    performance: any;
}): Promise<any> {
    const { questionId, difficulty, performance } = data;
    const interval = this.calculateReviewInterval(performance);

    return await prisma.reviewSchedule.upsert({
        where: { userId_questionId: { userId, questionId } },
        update: {
            nextReview: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
            performance: parseFloat(performance)
        },
        create: {
            userId,
            questionId,
            nextReview: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
            performance: parseFloat(performance)
        }
    });
}

async updateReviewSchedule(userId: number, reviewId: number, data: {
    performance: any;
    confidenceLevel: number;
}): Promise<any> {
    const { performance, confidenceLevel } = data;
    
    // Find the review schedule
    const schedule = await prisma.reviewSchedule.findFirst({
        where: { id: reviewId, userId }
    });

    if (!schedule) {
        throw new NotFoundError('Review schedule not found');
    }

    const interval = this.calculateReviewInterval(performance);

    return await prisma.reviewSchedule.update({
        where: { id: reviewId },
        data: {
            nextReview: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
            performance: parseFloat(performance)
        }
    });
}

// ==========================================
// PROGRESS & ANALYTICS METHODS
// ==========================================

async getUserProgress(userId: number): Promise<any> {
    const [overallMastery, subjectProgress, streakData, achievements] = await Promise.all([
        this.calculateOverallMastery(userId),
        this.getSubjectMasteryOverview(userId),
        this.getUserStreak(userId),
        prisma.achievement.count({ where: { userId } })
    ]);

    return {
        overallMastery,
        subjectProgress,
        streak: streakData,
        achievementCount: achievements,
        level: Math.floor(overallMastery.questionsAnswered / 100) + 1
    };
}

async getSubjectProgress(userId: number, subjectId: number): Promise<any> {
    const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: {
            topics: {
                include: {
                    topicMasteries: {
                        where: { userId }
                    }
                }
            }
        }
    });

    if (!subject) {
        throw new NotFoundError('Subject not found');
    }

    const masteries = subject.topics.flatMap(topic => topic.topicMasteries);
    const avgMastery = masteries.length > 0 
        ? masteries.reduce((sum, m) => sum + m.mastery, 0) / masteries.length 
        : 0;
    const avgAccuracy = masteries.length > 0
        ? masteries.reduce((sum, m) => sum + m.accuracy, 0) / masteries.length
        : 0;
    const totalQuestions = masteries.reduce((sum, m) => sum + m.questionsPracticed, 0);

    return {
        subjectName: subject.name,
        mastery: avgMastery,
        accuracy: avgAccuracy,
        questionsAnswered: totalQuestions,
        topicCount: subject.topics.length,
        masteredTopics: masteries.filter(m => m.mastery >= 0.8).length
    };
}

async getTopicProgress(userId: number, topicId: number): Promise<any> {
    const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: {
            subject: { select: { name: true } },
            topicMasteries: {
                where: { userId }
            },
            questions: {
                include: {
                    questionAttempts: {
                        where: { userId }
                    }
                }
            }
        }
    });

    if (!topic) {
        throw new NotFoundError('Topic not found');
    }

    const mastery = topic.topicMasteries[0];
    const attempts = topic.questions.flatMap(q => q.questionAttempts);

    return {
        topicName: topic.name,
        subjectName: topic.subject.name,
        mastery: mastery ? mastery.mastery : 0,
        accuracy: mastery ? mastery.accuracy : 0,
        questionsAnswered: mastery ? mastery.questionsPracticed : 0,
        avgTime: mastery ? mastery.avgTime : 0,
        totalQuestions: topic.questions.length,
        recentAttempts: attempts.slice(-10).map(a => ({
            isCorrect: a.isCorrect,
            timeTaken: a.timeTaken,
            attemptedAt: a.attemptedAt
        }))
    };
}

async getPerformanceAnalytics(userId: number, timeframe: string = '30d'): Promise<any> {
    const days = parseInt(timeframe.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await prisma.practiceSession.findMany({
        where: {
            userId,
            createdAt: { gte: startDate },
            status: MockExamStatus.COMPLETED
        },
        include: {
            questionAttempts: true,
            subject: { select: { name: true } }
        }
    });

    const totalSessions = sessions.length;
    const totalQuestions = sessions.reduce((sum, s) => sum + s.questionAttempts.length, 0);
    const correctAnswers = sessions.reduce((sum, s) => 
        sum + s.questionAttempts.filter(a => a.isCorrect).length, 0);
    const avgAccuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
    const avgSessionTime = sessions.length > 0 
        ? sessions.reduce((sum, s) => {
            if (s.endTime && s.startTime) {
                return sum + (s.endTime.getTime() - s.startTime.getTime());
            }
            return sum;
        }, 0) / sessions.length / 1000 / 60 // Convert to minutes
        : 0;

    return {
        timeframe,
        totalSessions,
        totalQuestions,
        avgAccuracy,
        avgSessionTime: Math.round(avgSessionTime),
        subjectBreakdown: this.calculateSubjectBreakdown(sessions)
    };
}

async getPerformanceTrends(userId: number, options: {
    subjectId: number | null;
    days: number;
}): Promise<any> {
    const { subjectId, days } = options;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const whereClause: any = {
        userId,
        createdAt: { gte: startDate },
        status: MockExamStatus.COMPLETED
    };
    if (subjectId) whereClause.subjectId = subjectId;

    const sessions = await prisma.practiceSession.findMany({
        where: whereClause,
        include: {
            questionAttempts: true
        },
        orderBy: { createdAt: 'asc' }
    });

    const dailyStats = this.groupSessionsByDay(sessions);
    
    return {
        period: `${days} days`,
        dailyAccuracy: dailyStats.map(day => ({
            date: day.date,
            accuracy: day.accuracy,
            questionsAnswered: day.questionsAnswered
        })),
        trend: this.calculateTrend(dailyStats.map(d => d.accuracy))
    };
}

// ==========================================
// SESSION HISTORY & REVIEW METHODS
// ==========================================

async getPracticeHistory(userId: number, options: {
    page: number;
    limit: number;
    subjectId: number | null;
}): Promise<any> {
    const { page, limit, subjectId } = options;
    const skip = (page - 1) * limit;

    const whereClause: any = {
        userId,
        status: MockExamStatus.COMPLETED
    };
    if (subjectId) whereClause.subjectId = subjectId;

    const [sessions, total] = await Promise.all([
        prisma.practiceSession.findMany({
            where: whereClause,
            include: {
                subject: { select: { name: true } },
                topic: { select: { name: true } },
                questionAttempts: { select: { isCorrect: true } }
            },
            orderBy: { endTime: 'desc' },
            skip,
            take: limit
        }),
        prisma.practiceSession.count({ where: whereClause })
    ]);

    return {
        sessions: sessions.map(session => ({
            id: session.id,
            subjectName: session.subject.name,
            topicName: session.topic?.name,
            sessionType: session.sessionType,
            questionCount: session.questionAttempts.length,
            correctCount: session.questionAttempts.filter(a => a.isCorrect).length,
            accuracy: session.questionAttempts.length > 0 
                ? session.questionAttempts.filter(a => a.isCorrect).length / session.questionAttempts.length 
                : 0,
            startTime: session.startTime,
            endTime: session.endTime
        })),
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

async getSessionSummary(userId: number, sessionId: string): Promise<any> {
    const session = await prisma.practiceSession.findFirst({
        where: { id: sessionId, userId },
        include: {
            subject: { select: { name: true } },
            topic: { select: { name: true } },
            questionAttempts: {
                include: {
                    question: {
                        include: {
                            topic: { select: { name: true } }
                        }
                    }
                }
            }
        }
    });

    if (!session) {
        throw new NotFoundError('Session not found');
    }

    const correctCount = session.questionAttempts.filter(a => a.isCorrect).length;
    const totalTime = session.questionAttempts.reduce((sum, a) => sum + a.timeTaken, 0);
    const topicPerformance = this.calculateTopicPerformance(session.questionAttempts);

    return {
        sessionId: session.id,
        subjectName: session.subject.name,
        topicName: session.topic?.name,
        sessionType: session.sessionType,
        totalQuestions: session.questionAttempts.length,
        correctAnswers: correctCount,
        accuracy: session.questionAttempts.length > 0 ? correctCount / session.questionAttempts.length : 0,
        totalTime: Math.round(totalTime / 1000), // Convert to seconds
        avgTimePerQuestion: session.questionAttempts.length > 0 
            ? Math.round(totalTime / session.questionAttempts.length / 1000) 
            : 0,
        topicPerformance,
        startTime: session.startTime,
        endTime: session.endTime
    };
}

async getSessionMistakes(userId: number, sessionId: string): Promise<any[]> {
    const session = await prisma.practiceSession.findFirst({
        where: { id: sessionId, userId },
        include: {
            questionAttempts: {
                where: { isCorrect: false },
                include: {
                    question: {
                        include: {
                            options: true,
                            topic: { select: { name: true } },
                            passage: true
                        }
                    }
                }
            }
        }
    });

    if (!session) {
        throw new NotFoundError('Session not found');
    }

    return session.questionAttempts.map(attempt => ({
        questionId: attempt.question.id,
        question: attempt.question.text,
        selectedAnswer: attempt.selectedOption,
        correctAnswer: attempt.question.options.find(opt => opt.isCorrect)?.text,
        explanation: attempt.question.explanation,
        topicName: attempt.question.topic.name,
        difficulty: attempt.question.difficulty,
        timeTaken: attempt.timeTaken
    }));
}

async createMistakeReviewSession(userId: number, originalSessionId: string): Promise<any> {
    const mistakes = await this.getSessionMistakes(userId, originalSessionId);
    
    if (mistakes.length === 0) {
        throw new ValidationError('No mistakes found in the original session');
    }

    // Get the original session to determine subject
    const originalSession = await prisma.practiceSession.findFirst({
        where: { id: originalSessionId, userId }
    });

    if (!originalSession) {
        throw new NotFoundError('Original session not found');
    }

    return await this.createPracticeSession(userId, {
        subjectId: originalSession.subjectId,
        sessionType: PracticeSessionType.REVIEW,
        questionCount: mistakes.length
    });
}

// ==========================================
// AI-DRIVEN FEATURES
// ==========================================

async calibrateDifficulty(userId: number, data: {
    subjectId: number;
    recentPerformance: any;
}): Promise<any> {
    const { subjectId, recentPerformance } = data;
    
    // Analyze recent performance to suggest difficulty adjustments
    const recentSessions = await prisma.practiceSession.findMany({
        where: {
            userId,
            subjectId,
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        },
        include: {
            questionAttempts: true
        }
    });

    const totalQuestions = recentSessions.reduce((sum, s) => sum + s.questionAttempts.length, 0);
    const correctAnswers = recentSessions.reduce((sum, s) => 
        sum + s.questionAttempts.filter(a => a.isCorrect).length, 0);
    const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;

    let recommendedDifficulty: DifficultyLevel;
    if (accuracy >= 0.8) {
        recommendedDifficulty = DifficultyLevel.HARD;
    } else if (accuracy >= 0.6) {
        recommendedDifficulty = DifficultyLevel.MEDIUM;
    } else {
        recommendedDifficulty = DifficultyLevel.EASY;
    }

    return {
        currentAccuracy: accuracy,
        recommendedDifficulty,
        confidence: accuracy >= 0.7 ? 'HIGH' : accuracy >= 0.5 ? 'MEDIUM' : 'LOW',
        sessionsAnalyzed: recentSessions.length,
        questionsAnalyzed: totalQuestions
    };
}

async getAdaptiveNextQuestions(userId: number, options: {
    sessionId?: string;
    count: number;
}): Promise<any[]> {
    const { sessionId, count } = options;
    
    if (sessionId) {
        const session = await prisma.practiceSession.findFirst({
            where: { id: sessionId, userId }
        });
        
        if (!session) {
            throw new NotFoundError('Session not found');
        }
        
        return await this.getAdaptiveQuestions(userId, session);
    }

    // Default adaptive questions based on user's weak areas
    const weakAreas = await this.getWeakAreas(userId, { limit: 3 });
    if (weakAreas.length === 0) {
        throw new ValidationError('No weak areas identified for adaptive questions');
    }

    const topicIds = weakAreas.map(area => area.topicId);
    
    return await prisma.question.findMany({
        where: {
            topicId: { in: topicIds }
        },
        include: {
            topic: { select: { name: true } },
            options: true
        },
        take: count
    });
}

async updateConfidenceScore(userId: number, data: {
    questionId: number;
    confidenceLevel: number;
}): Promise<any> {
    const { questionId, confidenceLevel } = data;
    
    // Find the most recent attempt for this question by this user
    const attempt = await prisma.questionAttempt.findFirst({
        where: { userId, questionId },
        orderBy: { attemptedAt: 'desc' }
    });

    if (!attempt) {
        throw new NotFoundError('No attempt found for this question');
    }

    // Update the confidence level (assuming you add this field to questionAttempt)
    // For now, we'll create a simple response
    return {
        questionId,
        confidenceLevel,
        updated: true,
        message: 'Confidence score recorded'
    };
}

// ==========================================
// PERFORMANCE PREDICTIONS & INSIGHTS
// ==========================================

async getPredictedScore(userId: number, options: {
    subjectId: number | null;
}): Promise<any> {
    const { subjectId } = options;
    
    let whereClause: any = { userId };
    if (subjectId) whereClause.subjectId = subjectId;

    const snapshots = await prisma.performanceSnapshot.findMany({
        where: whereClause,
        include: { subject: { select: { name: true } } },
        orderBy: { takenAt: 'desc' },
        take: 1
    });

    if (snapshots.length === 0) {
        return {
            predictedScore: 0,
            confidence: 'LOW',
            message: 'Not enough data for prediction'
        };
    }

    const snapshot = snapshots[0];
    return {
        predictedScore: Math.round(snapshot.predictedScore),
        confidenceRange: snapshot.confidenceRange,
        subjectName: snapshot.subject.name,
        confidence: snapshot.subjectConfidence == null 
        ? 'UNKNOWN'
        : snapshot.subjectConfidence >= 0.8 ? 'HIGH' 
        : snapshot.subjectConfidence >= 0.6 ? 'MEDIUM' 
        : 'LOW',
        lastUpdated: snapshot.takenAt
    };
}

async getJAMBInsights(userId: number): Promise<any> {
    const [subjectProgress, weakAreas, recommendations] = await Promise.all([
        this.getSubjectMasteryOverview(userId),
        this.getWeakAreas(userId, { threshold: 0.7, limit: 5 }),
        this.getPersonalizedRecommendations(userId)
    ]);

    const readinessScore = subjectProgress.reduce((sum, subject) => sum + subject.mastery, 0) / subjectProgress.length;
    
    return {
        readinessScore: Math.round(readinessScore * 100),
        subjectReadiness: subjectProgress.map(subject => ({
            name: subject.name,
            readiness: Math.round(subject.mastery * 100),
            status: subject.mastery >= 0.8 ? 'READY' : subject.mastery >= 0.6 ? 'ALMOST_READY' : 'NEEDS_WORK'
        })),
        priorityAreas: weakAreas.slice(0, 3),
        recommendations: recommendations.slice(0, 3),
        estimatedExamScore: Math.round(readinessScore * 400), // JAMB is out of 400
        timeToReady: this.estimateTimeToReadiness(weakAreas.length, readinessScore)
    };
}

async getLearningPatterns(userId: number): Promise<any> {
    const sessions = await prisma.practiceSession.findMany({
        where: { 
            userId,
            status: MockExamStatus.COMPLETED,
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        include: {
            questionAttempts: true
        }
    });

    const studyTimes = sessions.map(s => ({
        hour: s.startTime.getHours(),
        accuracy: s.questionAttempts.length > 0 
            ? s.questionAttempts.filter(a => a.isCorrect).length / s.questionAttempts.length 
            : 0
    }));

    const bestStudyHours = this.findBestStudyTimes(studyTimes);
    const sessionFrequency = this.calculateSessionFrequency(sessions);
    
    return {
        preferredStudyTimes: bestStudyHours,
        averageSessionLength: sessions.length > 0 
            ? sessions.reduce((sum, s) => {
                if (s.endTime && s.startTime) {
                    return sum + (s.endTime.getTime() - s.startTime.getTime());
                }
                return sum;
            }, 0) / sessions.length / 1000 / 60 // minutes
            : 0,
        sessionsPerWeek: sessionFrequency,
        consistencyScore: this.calculateConsistencyScore(sessions),
        learningVelocity: this.calculateLearningVelocity(userId)
    };
}

// ==========================================
// STUDY PLANNING INTEGRATION
// ==========================================

async integratePracticeWithStudyPlan(userId: number, data: {
    studyPlanId: number;
    practiceGoals: any;
}): Promise<any> {
    const { studyPlanId, practiceGoals } = data;
    
    const studyPlan = await prisma.studyPlan.findFirst({
        where: { id: studyPlanId, userId }
    });

    if (!studyPlan) {
        throw new NotFoundError('Study plan not found');
    }

    // Create practice tasks based on goals
    const tasks = [];
    if (practiceGoals.dailyQuestions) {
        tasks.push({
            studyPlanId,
            type: StudyTaskType.PRACTICE,
            title: `Daily Practice - ${practiceGoals.dailyQuestions} questions`,
            description: `Complete ${practiceGoals.dailyQuestions} practice questions daily`,
            status: StudyTaskStatus.PENDING,
            dueDate: new Date(),
            estimatedTime: practiceGoals.dailyQuestions * 2 // 2 minutes per question
        });
    }

    if (tasks.length > 0) {
        await prisma.studyTask.createMany({
            data: tasks
        });
    }

    return {
        studyPlanId,
        tasksCreated: tasks.length,
        message: 'Practice goals integrated with study plan'
    };
}

async getStudyPlanProgress(userId: number, options: {
    studyPlanId: number | null;
}): Promise<any> {
    const { studyPlanId } = options;
    
    let whereClause: any = { userId };
    if (studyPlanId) whereClause.id = studyPlanId;

    const studyPlans = await prisma.studyPlan.findMany({
        where: whereClause,
        include: {
            tasks: {
                include: {
                    topic: { select: { name: true } }
                }
            }
        }
    });

    return studyPlans.map(plan => {
        const totalTasks = plan.tasks.length;
        const completedTasks = plan.tasks.filter((t: { completed: boolean }) => t.completed).length;
        const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

        return {
            id: plan.id,
            title: plan.title,
            progress: Math.round(progress * 100),
            totalTasks,
            completedTasks,
            upcomingTasks: plan.tasks.filter((t: { completed: boolean, dueDate: Date }) =>
                !t.completed && t.dueDate > new Date()
            ).length,
            overdueTasks: plan.tasks.filter((t: { completed: boolean, dueDate: Date }) =>
                !t.completed && t.dueDate <= new Date()
            ).length
        };
    });
}

async calculateUserPercentile(userId: number, subjectId: number | null, metric: string): Promise<any> {
    // Calculate user's performance
    let userMastery: any;
    if (subjectId) {
        userMastery = await this.getSubjectProgress(userId, subjectId);
    } else {
        userMastery = await this.calculateOverallMastery(userId);
    }

    const userValue = userMastery[metric] || 0;

    // Get all users' performance for comparison
    const allMasteries = await prisma.topicMastery.findMany({
        where: subjectId ? {
            topic: { subjectId }
        } : {}
    });

    const allValues = allMasteries.map(m => m[metric as keyof typeof m] || 0);
    const lowerValues = allValues.filter(v => v < userValue).length;
    const percentile = allValues.length > 0 ? (lowerValues / allValues.length) * 100 : 50;

    return {
        percentile: Math.round(percentile),
        userValue,
        totalUsers: allValues.length,
        rank: allValues.length - lowerValues,
        metric
    };
}

// ==========================================
// HELPER METHODS FOR NEW FUNCTIONALITY
// ==========================================

private calculateSubjectBreakdown(sessions: any[]): any[] {
    const subjectMap = new Map();
    
    sessions.forEach(session => {
        const subjectName = session.subject.name;
        if (!subjectMap.has(subjectName)) {
            subjectMap.set(subjectName, {
                name: subjectName,
                sessions: 0,
                totalQuestions: 0,
                correctAnswers: 0
            });
        }
        
        const subject = subjectMap.get(subjectName);
        subject.sessions += 1;
        subject.totalQuestions += session.questionAttempts.length;
        subject.correctAnswers += session.questionAttempts.filter((a: any) => a.isCorrect).length;
    });

    return Array.from(subjectMap.values()).map(subject => ({
        ...subject,
        accuracy: subject.totalQuestions > 0 ? subject.correctAnswers / subject.totalQuestions : 0
    }));
}

private groupSessionsByDay(sessions: any[]): any[] {
    const dayMap = new Map();
    
    sessions.forEach(session => {
        const dateKey = session.createdAt.toISOString().split('T')[0];
        if (!dayMap.has(dateKey)) {
            dayMap.set(dateKey, {
                date: dateKey,
                sessions: [],
                totalQuestions: 0,
                correctAnswers: 0
            });
        }
        
        const day = dayMap.get(dateKey);
        day.sessions.push(session);
        day.totalQuestions += session.questionAttempts.length;
        day.correctAnswers += session.questionAttempts.filter((a: any) => a.isCorrect).length;
    });

    return Array.from(dayMap.values()).map(day => ({
        date: day.date,
        accuracy: day.totalQuestions > 0 ? day.correctAnswers / day.totalQuestions : 0,
        questionsAnswered: day.totalQuestions,
        sessionsCompleted: day.sessions.length
    }));
}

private calculateTrend(accuracyValues: number[]): number {
    if (accuracyValues.length < 2) return 0;
    
    const firstHalf = accuracyValues.slice(0, Math.floor(accuracyValues.length / 2));
    const secondHalf = accuracyValues.slice(Math.floor(accuracyValues.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
}

private calculateTopicPerformance(questionAttempts: any[]): any[] {
    const topicMap = new Map();
    
    questionAttempts.forEach(attempt => {
        const topicName = attempt.question.topic.name;
        if (!topicMap.has(topicName)) {
            topicMap.set(topicName, {
                name: topicName,
                totalQuestions: 0,
                correctAnswers: 0
            });
        }
        
        const topic = topicMap.get(topicName);
        topic.totalQuestions += 1;
        if (attempt.isCorrect) topic.correctAnswers += 1;
    });

    return Array.from(topicMap.values()).map(topic => ({
        ...topic,
        accuracy: topic.totalQuestions > 0 ? topic.correctAnswers / topic.totalQuestions : 0
    }));
}

private findBestStudyTimes(studyTimes: any[]): number[] {
    const hourMap = new Map();
    
    studyTimes.forEach(({ hour, accuracy }) => {
        if (!hourMap.has(hour)) {
            hourMap.set(hour, { totalAccuracy: 0, count: 0 });
        }
        const hourData = hourMap.get(hour);
        hourData.totalAccuracy += accuracy;
        hourData.count += 1;
    });

    const hourAverages = Array.from(hourMap.entries())
        .map(([hour, data]) => ({
            hour: parseInt(hour),
            avgAccuracy: data.totalAccuracy / data.count
        }))
        .sort((a, b) => b.avgAccuracy - a.avgAccuracy);

    return hourAverages.slice(0, 3).map(h => h.hour);
}

private calculateSessionFrequency(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    
    const dates = sessions.map(s => s.createdAt.toDateString());
    const uniqueDates = new Set(dates);
    const daysCovered = uniqueDates.size;
    const weeksInPeriod = daysCovered / 7;
    
    return weeksInPeriod > 0 ? sessions.length / weeksInPeriod : 0;
}

private calculateConsistencyScore(sessions: any[]): number {
    if (sessions.length < 7) return 0;
    
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        const dayHasSessions = sessions.some(s => s.createdAt.toDateString() === dateString);
        last7Days.push(dayHasSessions ? 1 : 0);
    }
    
    return last7Days.reduce((sum, day) => sum + day, 0) / 7;
}

private async calculateLearningVelocity(userId: number): Promise<number> {
    const masteries = await prisma.topicMastery.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 10
    });

    if (masteries.length < 2) return 0;
    
    const recent = masteries.slice(0, 5);
    const older = masteries.slice(5);
    
    const recentAvg = recent.reduce((sum, m) => sum + m.mastery, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.mastery, 0) / older.length;
    
    return recentAvg - olderAvg;
}

private estimateTimeToReadiness(weakAreasCount: number, currentReadiness: number): string {
    const hoursNeeded = weakAreasCount * 10 + (1 - currentReadiness) * 50;
    const daysNeeded = Math.ceil(hoursNeeded / 2); // 2 hours study per day
    
    if (daysNeeded <= 7) return `${daysNeeded} days`;
    if (daysNeeded <= 30) return `${Math.ceil(daysNeeded / 7)} weeks`;
    return `${Math.ceil(daysNeeded / 30)} months`;
}


    
    
}


