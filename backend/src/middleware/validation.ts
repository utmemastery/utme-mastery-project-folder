import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateProfileUpdate = [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phoneNumber').optional().isMobilePhone('en-NG').withMessage('Invalid Nigerian phone number'),
  body('avatarUrl').optional().isURL().withMessage('Invalid avatar URL'),
  body('selectedSubjects').optional().isArray().withMessage('Selected subjects must be an array'),
  body('selectedSubjects.*').optional().isString().withMessage('Each subject must be a string'),
  body('aspiringCourse').optional().isString().withMessage('Aspiring course must be a string'),
  body('goalScore').optional().isInt({ min: 0, max: 400 }).withMessage('Goal score must be between 0 and 400'),
  body('learningStyle').optional().isIn(['visual', 'auditory', 'kinesthetic']).withMessage('Invalid learning style'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateOnboardingCompletion = [
  body('selectedSubjects').isArray({ min: 4, max: 4 }).withMessage('Please select exactly 4 subjects'),
  body('selectedSubjects.*').isString().withMessage('Each subject must be a string'),
  body('aspiringCourse').isString().withMessage('Aspiring course must be a string'),
  body('goalScore').isInt({ min: 0, max: 400 }).withMessage('Goal score must be between 0 and 400'),
  body('learningStyle').isIn(['visual', 'auditory', 'kinesthetic']).withMessage('Invalid learning style'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateMockExamStart = [
  body('type')
    .isIn(['full_utme', 'subject_specific', 'quick'])
    .withMessage('Invalid exam type'),
  body('subjects')
    .isArray({ min: 1 })
    .withMessage('At least one subject is required'),
  body('timeLimit')
    .isInt({ min: 1, max: 300 })
    .withMessage('Time limit must be between 1 and 300 minutes'),
  body('questionCount')
    .isInt({ min: 1, max: 200 })
    .withMessage('Question count must be between 1 and 200'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];