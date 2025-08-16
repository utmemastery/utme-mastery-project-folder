import express from 'express';
import { authenticate } from '../middleware/auth';
import { MockExamController } from '../controllers/mockExamController';
import { validateMockExamStart } from '../middleware/validation';

const router = express.Router();

// Get available mock exams
router.get('/', authenticate, MockExamController.getMockExams);

// Get recent mock exam scores
router.get('/recent-scores', authenticate, MockExamController.getRecentScores);

// Start a new mock exam
router.post('/start', authenticate, validateMockExamStart, MockExamController.startMockExam);

// Submit mock exam answers
router.post('/submit', authenticate, MockExamController.submitMockExam);

// Get mock exam results
router.get('/results/:examId', authenticate, MockExamController.getMockExamResults);

// Get mock exam history
router.get('/history', authenticate, MockExamController.getMockExamHistory);

// Resume incomplete mock exam
router.get('/resume/:examId', authenticate, MockExamController.resumeMockExam);

export default router;