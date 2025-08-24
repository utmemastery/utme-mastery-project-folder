import express from 'express';
import { authenticate } from '../middleware/auth';
import PracticeController from '../controllers/practiceController';
import { PracticeService } from '../services/practiceService';
import { successResponse, errorResponse } from '../utils/errors/response';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

const router = express.Router();

const practiceService = new PracticeService();



// Apply authentication middleware to all routes
router.use(authenticate);

// Practice Home Screen Data
router.get('/dashboard', PracticeController.getPracticeDashboard);
router.get('/performance-snapshot', PracticeController.getPerformanceSnapshot);
router.get('/recommendations', PracticeController.getPersonalizedRecommendations);

// Subject & Topic Management
router.get('/subjects', PracticeController.getSubjects);
router.get('/subjects/:subjectId', PracticeController.getSubjectDetails);
router.get('/subjects/:subjectId/sections', PracticeController.getSubjectSections);
router.get('/sections/:sectionId/topics', PracticeController.getSectionTopics);
router.get('/topics/:topicId', PracticeController.getTopicDetails);
router.get('/topics/:topicId/mastery', PracticeController.getTopicMastery);

// Practice Session Management
router.post('/sessions', PracticeController.createPracticeSession);
router.get('/sessions/:sessionId', PracticeController.getPracticeSession);
router.put('/sessions/:sessionId', PracticeController.updatePracticeSession);
router.post('/sessions/:sessionId/complete', PracticeController.completePracticeSession);
router.delete('/sessions/:sessionId', PracticeController.cancelPracticeSession);

// Question Management
router.get('/sessions/:sessionId/questions', PracticeController.getSessionQuestions);
router.get('/sessions/:sessionId/questions/:questionIndex', PracticeController.getCurrentQuestion);
router.post('/sessions/:sessionId/questions/:questionId/attempt', PracticeController.submitQuestionAttempt);

// Smart Practice Modes
router.post('/sessions/smart-review', PracticeController.createSmartReviewSession);
router.post('/sessions/adaptive-drill', PracticeController.createAdaptiveDrillSession);
router.post('/sessions/timed-sprint', PracticeController.createTimedSprintSession);
router.post('/sessions/diagnostic', PracticeController.createDiagnosticSession);

// Spaced Repetition
router.get('/review-queue', PracticeController.getReviewQueue);
router.post('/review-queue/schedule', PracticeController.scheduleReview);
router.put('/review-queue/:reviewId', PracticeController.updateReviewSchedule);

// Progress & Analytics
router.get('/progress', PracticeController.getUserProgress);
router.get('/progress/subjects/:subjectId', PracticeController.getSubjectProgress);
router.get('/progress/topics/:topicId', PracticeController.getTopicProgress);
router.get('/analytics/performance', PracticeController.getPerformanceAnalytics);
router.get('/analytics/trends', PracticeController.getPerformanceTrends);
router.get('/analytics/weak-areas', PracticeController.getWeakAreas);

// Session History & Review
router.get('/history', PracticeController.getPracticeHistory);
router.get('/history/:sessionId/summary', PracticeController.getSessionSummary);
router.get('/history/:sessionId/mistakes', PracticeController.getSessionMistakes);
router.post('/sessions/:sessionId/review', PracticeController.reviewMistakes);

// AI-Driven Features
router.post('/difficulty/calibrate', PracticeController.calibrateDifficulty);
router.get('/next-questions', PracticeController.getAdaptiveNextQuestions);
router.post('/confidence/update', PracticeController.updateConfidenceScore);

// Performance Predictions & Insights
router.get('/predictions/score', PracticeController.getPredictedScore);
router.get('/insights/jamb-specific', PracticeController.getJAMBInsights);
router.get('/insights/learning-patterns', PracticeController.getLearningPatterns);

// Study Planning Integration
router.post('/integrate-study-plan', PracticeController.integratePracticeWithStudyPlan);
router.get('/study-plan-progress', PracticeController.getStudyPlanProgress);

// Percentile Rankings
router.get('/analytics/percentile', async (req, res) => {
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
        return successResponse(res, percentile, 'User percentile retrieved successfully');
    } catch (error: any) {
        return errorResponse(res, error.message, 500);
    }
});

// Leaderboards
router.get('/leaderboard', async (req, res) => {
    try {
        const { period = 'weekly', limit = '100' } = req.query as { period?: string; limit?: string };
        const leaderboard = await practiceService.getLeaderboard(period, parseInt(limit));
        return successResponse(res, leaderboard, 'Leaderboard retrieved successfully');
    } catch (error: any) {
        return errorResponse(res, error.message, 500);
    }
});

router.get('/leaderboard/rank', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
        const userId = req.user.id;
        const { period = 'weekly' } = req.query as { period?: string };
        const rank = await practiceService.getUserRank(userId, period);
        const score = await practiceService.getUserScore(userId, period);
        return successResponse(res, { rank, score, period }, 'User rank retrieved successfully');
    } catch (error: any) {
        return errorResponse(res, error.message, 500);
    }
});

// Sharing
router.post('/share-progress', async (req, res) => {
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
        const sharedProgress = await practiceService.shareProgress(userId, achievementId, message, privacy);
        return successResponse(res, sharedProgress, 'Progress shared successfully', 201);
    } catch (error: any) {
        return errorResponse(res, error.message, 500);
    }
});

// Gamification Enhancements
router.get('/gamification/summary', async (req, res) => {
    try {
                if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
        const userId = req.user.id;
        const summary = await practiceService.getGamificationSummary(userId);
        return successResponse(res, summary, 'Gamification summary retrieved successfully');
    } catch (error: any) {
        return errorResponse(res, error.message, 500);
    }
});

router.get('/achievements', async (req, res) => {
    try {
                if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
        const userId = req.user.id;
        const achievements = await prisma.achievement.findMany({
            where: { userId },
            orderBy: { earnedAt: 'desc' }
        });
        return successResponse(res, achievements, 'Achievements retrieved successfully');
    } catch (error: any) {
        return errorResponse(res, error.message, 500);
    }
});

router.get('/badges', async (req, res) => {
    try {
                if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
        const userId = req.user.id;
        const badges = await practiceService.getUserBadges(userId);
        return successResponse(res, badges, 'Badges retrieved successfully');
    } catch (error: any) {
        return errorResponse(res, error.message, 500);
    }
});

router.get('/streak/current', async (req, res) => {
    try {
                if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
        const userId = req.user.id;
        const streak = await practiceService.getCurrentStreak(userId);
        return successResponse(res, { count: streak }, 'Current streak retrieved successfully');
    } catch (error: any) {
        return errorResponse(res, error.message, 500);
    }
});

router.post('/streak/update', async (req, res) => {
    try {
                if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
            }
        const userId = req.user.id;
        const streak = await practiceService.updateStreak(userId);
        return successResponse(res, streak, 'Streak updated successfully');
    } catch (error: any) {
        return errorResponse(res, error.message, 500);
    }
});

// Preload next questions for a session
router.get('/sessions/:sessionId/preload', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { sessionId } = req.params;
    const { currentIndex = '0', count = '5' } = req.query as { currentIndex?: string; count?: string };

    const questions = await practiceService.preloadQuestions(
      sessionId,
      parseInt(currentIndex),
      parseInt(count)
    );

    return successResponse(res, questions, 'Questions preloaded successfully');
  } catch (error: any) {
    return errorResponse(res, error.message, 500);
  }
});


export default router;