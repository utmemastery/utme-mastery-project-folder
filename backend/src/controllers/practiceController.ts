import { Request, Response } from 'express';
import { PracticeService } from '../services/practiceService';
import { successResponse, errorResponse } from '../utils/errors/response';
import { ValidationError } from '../utils/errors/ValidationError';
import { NotFoundError } from '../utils/errors/NotFoundError';

import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

const practiceService = new PracticeService();


class PracticeController {
    // Practice Home Screen Data
    async getPracticeDashboard(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const dashboard = await practiceService.getPracticeDashboard(userId);
            return successResponse(res, dashboard, 'Practice dashboard retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getPerformanceSnapshot(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const snapshot = await practiceService.getPerformanceSnapshot(userId);
            return successResponse(res, snapshot, 'Performance snapshot retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getPersonalizedRecommendations(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const recommendations = await practiceService.getPersonalizedRecommendations(userId);
            return successResponse(res, recommendations, 'Personalized recommendations retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    // Subject & Topic Management
    async getSubjects(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const subjects = await practiceService.getSubjectsWithProgress(userId);
            return successResponse(res, subjects, 'Subjects retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getSubjectDetails(req: Request, res: Response): Promise<Response> {
        try {
            const { subjectId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const subject = await practiceService.getSubjectDetails(userId, parseInt(subjectId));
            return successResponse(res, subject, 'Subject details retrieved successfully');
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                return errorResponse(res, error.message, 404);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    async getSubjectSections(req: Request, res: Response): Promise<Response> {
        try {
            const { subjectId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const sections = await practiceService.getSubjectSections(userId, parseInt(subjectId));
            return successResponse(res, sections, 'Subject sections retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getSectionTopics(req: Request, res: Response): Promise<Response> {
        try {
            const { sectionId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const topics = await practiceService.getSectionTopics(userId, parseInt(sectionId));
            return successResponse(res, topics, 'Section topics retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getTopicDetails(req: Request, res: Response): Promise<Response> {
        try {
            const { topicId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const topic = await practiceService.getTopicDetails(userId, parseInt(topicId));
            return successResponse(res, topic, 'Topic details retrieved successfully');
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                return errorResponse(res, error.message, 404);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    async getTopicMastery(req: Request, res: Response): Promise<Response> {
        try {
            const { topicId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const mastery = await practiceService.getTopicMastery(userId, parseInt(topicId));
            return successResponse(res, mastery, 'Topic mastery retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    // Practice Session Management
    async createPracticeSession(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const sessionData = req.body;
            console.log('Creating practice session with data:', sessionData);
            const session = await practiceService.createPracticeSession(userId, sessionData);
            console.log('Practice session created:', session);
            return successResponse(res, session, 'Practice session created successfully', 201);
        } catch (error: any) {
            if (error instanceof ValidationError) {
                return errorResponse(res, error.message, 400);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    async getPracticeSession(req: Request, res: Response): Promise<Response> {
        try {
            const { sessionId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const session = await practiceService.getPracticeSession(userId, sessionId);
            return successResponse(res, session, 'Practice session retrieved successfully');
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                return errorResponse(res, error.message, 404);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    async updatePracticeSession(req: Request, res: Response): Promise<Response> {
        try {
            const { sessionId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const updateData = req.body;
            const session = await practiceService.updatePracticeSession(userId, sessionId, updateData);
            return successResponse(res, session, 'Practice session updated successfully');
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                return errorResponse(res, error.message, 404);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    async completePracticeSession(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { sessionId } = req.params;


            const session = await practiceService.completePracticeSession(userId, sessionId);
            const accuracy = session.questionCount > 0 ? session.correctCount / session.questionCount : 0;
            const score = accuracy * 100;
            const streak = await practiceService.getCurrentStreak(userId);
            const topicMastery = await practiceService.getTopicMastery(userId, Number(session.topicId));


            // Award achievements
            await practiceService.checkAndAwardAchievements(userId, {
                sessionId,
                score,
                accuracy,
                streak,
                topicMastery: topicMastery?.mastery || 0,
                questionsAnswered: session.questionCount
            });

            // Update leaderboard
            const points = await practiceService.calculateSessionPoints({
                correctCount: session.correctCount,
                totalQuestions: session.questionCount,
                accuracy,
                timeTaken: session.questionAttempts.reduce((sum: number, a: any) => sum + a.timeTaken, 0),
                averageTime: 90 // Default average time per question in seconds
            });
            await practiceService.updateLeaderboard(userId, points);

            return successResponse(res, session, 'Practice session completed successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, error.statusCode || 500);
        }
    }

    async cancelPracticeSession(req: Request, res: Response): Promise<Response> {
        try {
            const { sessionId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            await practiceService.cancelPracticeSession(userId, sessionId);
            return successResponse(res, null, 'Practice session cancelled successfully');
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                return errorResponse(res, error.message, 404);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    // Question Management
    async getSessionQuestions(req: Request, res: Response): Promise<Response> {
        try {
            const { sessionId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const questions = await practiceService.getSessionQuestions(userId, sessionId);
            return successResponse(res, questions, 'Session questions retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getCurrentQuestion(req: Request, res: Response): Promise<Response> {
        try {
            const { sessionId, questionIndex } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const question = await practiceService.getCurrentQuestion(userId, sessionId, parseInt(questionIndex));
            return successResponse(res, question, 'Current question retrieved successfully');
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                return errorResponse(res, error.message, 404);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    async submitQuestionAttempt(req: Request, res: Response): Promise<Response> {
        try {
            const { sessionId, questionId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const attemptData = req.body;
            const result = await practiceService.submitQuestionAttempt(userId, sessionId, parseInt(questionId), attemptData);
            return successResponse(res, result, 'Question attempt submitted successfully');
        } catch (error: any) {
            if (error instanceof ValidationError) {
                return errorResponse(res, error.message, 400);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    // Smart Practice Modes
    async createSmartReviewSession(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { limit = 15 } = req.body as { limit?: number };
            const session = await practiceService.createSmartReviewSession(userId, limit);
            return successResponse(res, session, 'Smart review session created successfully', 201);
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async createAdaptiveDrillSession(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { subjectId, topicId, targetDifficulty } = req.body as {
                subjectId?: number;
                topicId?: number;
                targetDifficulty?: number;
            };
            const session = await practiceService.createAdaptiveDrillSession(userId, {
                subjectId,
                topicId,
                targetDifficulty
            });
            return successResponse(res, session, 'Adaptive drill session created successfully', 201);
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async createTimedSprintSession(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { questionCount = 10, timeLimit = 12 } = req.body as { questionCount?: number; timeLimit?: number };
            const session = await practiceService.createTimedSprintSession(userId, {
                questionCount,
                timeLimit: timeLimit * 60 // Convert minutes to seconds
            });
            return successResponse(res, session, 'Timed sprint session created successfully', 201);
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

async createDiagnosticSession(req: Request, res: Response): Promise<Response> {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const userId = req.user.id;
        const { subjectId } = req.body as { subjectId?: number };

        const session = await practiceService.createDiagnosticSession(userId, subjectId);
        return successResponse(res, session, 'Diagnostic session created successfully', 201);
    } catch (error: any) {
        if (error instanceof ValidationError) {
            return errorResponse(res, error.message, 400);
        }
        console.error('Error creating diagnostic session:', error);
        return errorResponse(res, 'Internal Server Error', 500);
    }
}


    // Spaced Repetition
    async getReviewQueue(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { limit = '50' } = req.query as { limit?: string };
            const queue = await practiceService.getReviewQueue(userId, parseInt(limit));
            return successResponse(res, queue, 'Review queue retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async scheduleReview(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { questionId, difficulty, performance } = req.body as {
                questionId: number;
                difficulty: number;
                performance: any;
            };
            const schedule = await practiceService.scheduleReview(userId, {
                questionId: parseInt(String(questionId)),
                difficulty,
                performance
            });
            return successResponse(res, schedule, 'Review scheduled successfully', 201);
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async updateReviewSchedule(req: Request, res: Response): Promise<Response> {
        try {
            const { reviewId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { performance, confidenceLevel } = req.body as { performance: any; confidenceLevel: number };
            const updatedSchedule = await practiceService.updateReviewSchedule(userId, parseInt(reviewId), {
                performance,
                confidenceLevel
            });
            return successResponse(res, updatedSchedule, 'Review schedule updated successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    // Progress & Analytics
    async getUserProgress(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const progress = await practiceService.getUserProgress(userId);
            return successResponse(res, progress, 'User progress retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getSubjectProgress(req: Request, res: Response): Promise<Response> {
        try {
            const { subjectId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const progress = await practiceService.getSubjectProgress(userId, parseInt(subjectId));
            return successResponse(res, progress, 'Subject progress retrieved successfully');

        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getTopicProgress(req: Request, res: Response): Promise<Response> {
        try {
            const { topicId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const progress = await practiceService.getTopicProgress(userId, parseInt(topicId));
            return successResponse(res, progress, 'Topic progress retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getPerformanceAnalytics(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { timeframe = '30d' } = req.query as { timeframe?: string };
            const analytics = await practiceService.getPerformanceAnalytics(userId, timeframe);
            return successResponse(res, analytics, 'Performance analytics retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getPerformanceTrends(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { subjectId, days = '30' } = req.query as { subjectId?: string; days?: string };
            const trends = await practiceService.getPerformanceTrends(userId, {
                subjectId: subjectId ? parseInt(subjectId) : null,
                days: parseInt(days)
            });
            return successResponse(res, trends, 'Performance trends retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getWeakAreas(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { threshold = '0.7', limit = '10' } = req.query as { threshold?: string; limit?: string };
            const weakAreas = await practiceService.getWeakAreas(userId, {
                threshold: parseFloat(threshold),
                limit: parseInt(limit)
            });
            return successResponse(res, weakAreas, 'Weak areas retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    // Session History & Review
    async getPracticeHistory(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { page = '1', limit = '20', subjectId } = req.query as { page?: string; limit?: string; subjectId?: string };
            const history = await practiceService.getPracticeHistory(userId, {
                page: parseInt(page),
                limit: parseInt(limit),
                subjectId: subjectId ? parseInt(subjectId) : null
            });
            return successResponse(res, history, 'Practice history retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getSessionSummary(req: Request, res: Response): Promise<Response> {
        try {
            const { sessionId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const summary = await practiceService.getSessionSummary(userId, sessionId);
            return successResponse(res, summary, 'Session summary retrieved successfully');
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                return errorResponse(res, error.message, 404);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    async getSessionMistakes(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const { sessionId } = req.params;
            const userId = req.user.id;
            const mistakes = await practiceService.getSessionMistakes(userId, sessionId);
            return successResponse(res, mistakes, 'Session mistakes retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async reviewMistakes(req: Request, res: Response): Promise<Response> {
        try {
            const { sessionId } = req.params;
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const reviewSession = await practiceService.createMistakeReviewSession(userId, sessionId);
            return successResponse(res, reviewSession, 'Mistake review session created successfully', 201);
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    // AI-Driven Features
    async calibrateDifficulty(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { subjectId, recentPerformance } = req.body as { subjectId: number; recentPerformance: any };
            const calibration = await practiceService.calibrateDifficulty(userId, {
                subjectId: parseInt(String(subjectId)),
                recentPerformance
            });
            return successResponse(res, calibration, 'Difficulty calibrated successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getAdaptiveNextQuestions(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { sessionId, count = '5' } = req.query as { sessionId?: string; count?: string };
            const questions = await practiceService.getAdaptiveNextQuestions(userId, {
                sessionId,
                count: parseInt(count)
            });
            return successResponse(res, questions, 'Adaptive next questions retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async updateConfidenceScore(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { questionId, confidenceLevel } = req.body as { questionId: number; confidenceLevel: number };
            const result = await practiceService.updateConfidenceScore(userId, {
                questionId: parseInt(String(questionId)),
                confidenceLevel: parseInt(String(confidenceLevel))
            });
            return successResponse(res, result, 'Confidence score updated successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    // Performance Predictions & Insights
    async getPredictedScore(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { subjectId } = req.query as { subjectId?: string };
            const prediction = await practiceService.getPredictedScore(userId, {
                subjectId: subjectId ? parseInt(subjectId) : null
            });
            return successResponse(res, prediction, 'Predicted score retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getJAMBInsights(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const insights = await practiceService.getJAMBInsights(userId);
            return successResponse(res, insights, 'JAMB-specific insights retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getLearningPatterns(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const patterns = await practiceService.getLearningPatterns(userId);
            return successResponse(res, patterns, 'Learning patterns retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    // Study Planning Integration
    async integratePracticeWithStudyPlan(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { studyPlanId, practiceGoals } = req.body as { studyPlanId: number; practiceGoals: any };
            const integration = await practiceService.integratePracticeWithStudyPlan(userId, {
                studyPlanId: parseInt(String(studyPlanId)),
                practiceGoals
            });
            return successResponse(res, integration, 'Practice integrated with study plan successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getStudyPlanProgress(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { studyPlanId } = req.query as { studyPlanId?: string };
            const progress = await practiceService.getStudyPlanProgress(userId, {
                studyPlanId: studyPlanId ? parseInt(studyPlanId) : null
            });
            return successResponse(res, progress, 'Study plan progress retrieved successfully');
        } catch (error: any) {
            return errorResponse(res, error.message, 500);
        }
    }

    async getUserPercentile(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { subjectId, metric = 'accuracy' } = req.query as { subjectId?: string; metric?: string };
            const percentile = await practiceService.calculateUserPercentile(
                userId,
                subjectId ? parseInt(subjectId) : null,
                metric
            );
            return res.status(200).json({
                success: true,
                data: percentile,
                message: 'User percentile retrieved successfully'
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getLeaderboard(req: Request, res: Response): Promise<Response> {
        try {
            const { period = 'weekly', limit = '100' } = req.query as { period?: string; limit?: string };
            const leaderboard = await practiceService.getLeaderboard(period, parseInt(limit));
            return res.status(200).json({
                success: true,
                data: leaderboard,
                message: 'Leaderboard retrieved successfully'
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getUserRank(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { period = 'weekly' } = req.query as { period?: string };
            const rank = await practiceService.getUserRank(userId, period);
            const score = await practiceService.getUserScore(userId, period);
            return res.status(200).json({
                success: true,
                data: { rank, score, period },
                message: 'User rank retrieved successfully'
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message
            });
        }
    }

    async shareProgress(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const { achievementId, message, privacy = 'PUBLIC' } = req.body as {
                achievementId: number;
                message: string;
                privacy?: string;
            };
            if (!achievementId || !message) {
                throw new ValidationError('Achievement ID and message are required');
            }
            const sharedProgress = await practiceService.shareProgress(userId, parseInt(String(achievementId)), message, privacy);
            return res.status(201).json({
                success: true,
                data: sharedProgress,
                message: 'Progress shared successfully'
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getGamificationSummary(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const summary = await practiceService.getGamificationSummary(userId);
            return res.status(200).json({
                success: true,
                data: summary,
                message: 'Gamification summary retrieved successfully'
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAchievements(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const achievements = await prisma.achievement.findMany({
                where: { userId },
                orderBy: { earnedAt: 'desc' }
            });
            return res.status(200).json({
                success: true,
                data: achievements,
                message: 'Achievements retrieved successfully'
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getBadges(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const badges = await practiceService.getUserBadges(userId);
            return res.status(200).json({
                success: true,
                data: badges,
                message: 'Badges retrieved successfully'
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getCurrentStreak(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const streak = await practiceService.getCurrentStreak(userId);
            return res.status(200).json({
                success: true,
                data: { count: streak },
                message: 'Current streak retrieved successfully'
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateStreak(req: Request, res: Response): Promise<Response> {
        try {
                    if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
            const userId = req.user.id;
            const streak = await practiceService.updateStreak(userId);
            return res.status(200).json({
                success: true,
                data: streak,
                message: 'Streak updated successfully'
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default new PracticeController();