// backend/src/services/flashcardService.ts
export interface Flashcard {
  id: number;
  front: string;
  back: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mediaUrl?: string;
  tags: string[];
  createdBy: 'system' | 'user';
}

export interface FlashcardAttempt {
  id: number;
  flashcardId: number;
  userId: number;
  response: 'again' | 'hard' | 'good' | 'easy';
  timeSpent: number;
  createdAt: Date;
}

export class FlashcardService {
  static async getFlashcardsForReview(userId: number, limit: number = 20) {
    const prisma = new PrismaClient();
    
    // Get user's subjects
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { selectedSubjects: true }
    });

    if (!user) throw new Error('User not found');

    // Get flashcards due for review using spaced repetition algorithm
    const flashcards = await prisma.$queryRaw`
      SELECT 
        f.*,
        fa.response as last_response,
        fa.created_at as last_review,
        COALESCE(fa.interval, 1) as current_interval,
        COALESCE(fa.ease_factor, 2.5) as ease_factor
      FROM flashcards f
      LEFT JOIN LATERAL (
        SELECT * FROM flashcard_attempts fa2 
        WHERE fa2.flashcard_id = f.id AND fa2.user_id = ${userId}
        ORDER BY fa2.created_at DESC 
        LIMIT 1
      ) fa ON true
      WHERE f.subject = ANY(${user.selectedSubjects})
        AND (
          fa.created_at IS NULL OR 
          fa.created_at + INTERVAL '1 day' * COALESCE(fa.interval, 1) <= NOW()
        )
      ORDER BY 
        CASE WHEN fa.created_at IS NULL THEN 0 ELSE 1 END,
        fa.created_at ASC NULLS FIRST
      LIMIT ${limit}
    `;

    return flashcards;
  }

  static async submitFlashcardAttempt(attemptData: {
    userId: number;
    flashcardId: number;
    response: 'again' | 'hard' | 'good' | 'easy';
    timeSpent: number;
  }) {
    const prisma = new PrismaClient();
    const { userId, flashcardId, response, timeSpent } = attemptData;

    // Get last attempt to calculate new interval
    const lastAttempt = await prisma.flashcardAttempt.findFirst({
      where: { userId, flashcardId },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate new interval and ease factor using SuperMemo algorithm
    const { newInterval, newEaseFactor } = this.calculateSpacedRepetition(
      lastAttempt?.interval || 1,
      lastAttempt?.easeFactor || 2.5,
      response
    );

    // Create new attempt
    const attempt = await prisma.flashcardAttempt.create({
      data: {
        userId,
        flashcardId,
        response,
        timeSpent,
        interval: newInterval,
        easeFactor: newEaseFactor
      }
    });

    return attempt;
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
    front: string;
    back: string;
    subject: string;
    topic: string;
    tags?: string[];
  }) {
    const prisma = new PrismaClient();
    
    const flashcard = await prisma.flashcard.create({
      data: {
        ...cardData,
        tags: cardData.tags || [],
        createdBy: 'user',
        createdByUserId: userId
      }
    });

    return flashcard;
  }
}
