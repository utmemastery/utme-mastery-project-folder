import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { MockExamController } from '../controllers/mockExamController';
import { validateMockExamStart } from '../middleware/validation';

const router = express.Router();

// Get available mock exams
router.get('/', authenticateToken, MockExamController.getMockExams);

// Get recent mock exam scores
router.get('/recent-scores', authenticateToken, MockExamController.getRecentScores);

// Start a new mock exam
router.post('/start', authenticateToken, validateMockExamStart, MockExamController.startMockExam);

// Submit mock exam answers
router.post('/submit', authenticateToken, MockExamController.submitMockExam);

// Get mock exam results
router.get('/results/:examId', authenticateToken, MockExamController.getMockExamResults);

// Get mock exam history
router.get('/history', authenticateToken, MockExamController.getMockExamHistory);

// Resume incomplete mock exam
router.get('/resume/:examId', authenticateToken, MockExamController.resumeMockExam);

export default router;