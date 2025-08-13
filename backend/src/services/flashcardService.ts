import { PrismaClient, DifficultyLevel } from '@prisma/client';

const prisma = new PrismaClient();

export interface Flashcard {
  id: number;
  prompt: string;
  answer: string;
  subjectId: number;
  topicId: number;
  difficulty?: DifficultyLevel;
  mediaUrl?: string;
  tags: string[];
  createdByUserId?: number;
  subject?: { name: string }; // Added for frontend compatibility
  topic?: { name: string };   // Added for frontend compatibility
}

export interface FlashcardReview {
  id: number;
  flashcardId: number;
  userId: number;
  recallSuccess: boolean;
  responseTimeMs?: number;
  reviewDate: Date;
  interval: number;
  easeFactor: number;
  nextReview?: Date;
  createdAt: Date;
  response?: 'again' | 'hard' | 'good' | 'easy'; // for app logic, not in schema
}

export class FlashcardService {
  static async getFlashcardsForReview(userId: number, limit: number = 20) {
    // Get user's subjects
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { selectedSubjects: true }
    });

    if (!user) throw new Error('User not found');

    // Get subject IDs
    const subjects = await prisma.subject.findMany({
      where: { name: { in: user.selectedSubjects } },
      select: { id: true }
    });
    const subjectIds = subjects.map(s => s.id);

    // Get flashcards due for review using spaced repetition algorithm
    const flashcards = await prisma.flashcard.findMany({
      where: {
        subjectId: { in: subjectIds }
      },
      include: {
        FlashcardReview: {
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        subject: { select: { name: true } }, // Include subject name
        topic: { select: { name: true } }    // Include topic name
      },
      take: limit
    });

    // Filter for due flashcards (spaced repetition)
    const now = new Date();
    const dueFlashcards = flashcards.filter(f => {
      const lastReview = f.FlashcardReview[0];
      if (!lastReview) return true;
      if (!lastReview.nextReview) return true;
      return lastReview.nextReview <= now;
    });

    // Calculate review stats
    const reviews = await prisma.flashcardReview.findMany({
      where: { userId },
      include: { flashcard: true }
    });
    const reviewStats = {
      newCards: flashcards.filter(f => !f.FlashcardReview.length).length,
      masteredCards: reviews.filter(r => r.easeFactor > 2.5 && r.recallSuccess).length,
      learningCards: reviews.filter(r => r.easeFactor <= 2.5 || !r.recallSuccess).length,
      recentSessions: [] // Placeholder; implement session grouping if needed
    };

    return { flashcards: dueFlashcards, reviewStats };
  }

  static async submitFlashcardReview(attemptData: {
    userId: number;
    flashcardId: number;
    response: 'again' | 'hard' | 'good' | 'easy';
    timeSpent: number;
  }) {
    const { userId, flashcardId, response, timeSpent } = attemptData;

    // Get last review to calculate new interval
    const lastReview = await prisma.flashcardReview.findFirst({
      where: { userId, flashcardId },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate new interval and ease factor using SuperMemo algorithm
    const { newInterval, newEaseFactor } = this.calculateSpacedRepetition(
      lastReview?.interval || 1,
      lastReview?.easeFactor || 2.5,
      response
    );

    // Determine recallSuccess for schema
    const recallSuccess = response === 'good' || response === 'easy';

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    // Create new review
    const review = await prisma.flashcardReview.create({
      data: {
        userId,
        flashcardId,
        recallSuccess,
        responseTimeMs: timeSpent,
        interval: newInterval,
        easeFactor: newEaseFactor,
        nextReview
      }
    });

    return review;
  }

  private static calculateSpacedRepetition(
    currentInterval: number,
    currentEaseFactor: number,
    response: 'again' | 'hard' | 'good' | 'easy'
  ) {
    let newInterval = currentInterval;
    let newEaseFactor = currentEaseFactor;

    switch (response) {
      case 'again':
        newInterval = 1;
        newEaseFactor = Math.max(1.3, currentEaseFactor - 0.2);
        break;
      case 'hard':
        newInterval = Math.max(1, Math.round(currentInterval * 1.2));
        newEaseFactor = Math.max(1.3, currentEaseFactor - 0.15);
        break;
      case 'good':
        newInterval = Math.round(currentInterval * currentEaseFactor);
        break;
      case 'easy':
        newInterval = Math.round(currentInterval * currentEaseFactor * 1.3);
        newEaseFactor = currentEaseFactor + 0.15;
        break;
    }

    return { newInterval, newEaseFactor };
  }

  static async createCustomFlashcard(userId: number, cardData: {
    prompt: string;
    answer: string;
    subject: string;
    topic: string;
    tags?: string[];
    difficulty?: DifficultyLevel;
    mediaUrl?: string;
  }) {
    // Find subject and topic IDs
    const subject = await prisma.subject.findUnique({ where: { name: cardData.subject } });
    const topic = await prisma.topic.findUnique({ where: { name: cardData.topic } });

    if (!subject || !topic) throw new Error('Invalid subject or topic');

    const flashcard = await prisma.flashcard.create({
      data: {
        prompt: cardData.prompt,
        answer: cardData.answer,
        subjectId: subject.id,
        topicId: topic.id,
        tags: cardData.tags || [],
        difficulty: cardData.difficulty,
        mediaUrl: cardData.mediaUrl,
        createdByUserId: userId
      }
    });

    return flashcard;
  }
}