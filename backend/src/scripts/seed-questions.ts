// scripts/seed-questions.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync('questions.json', 'utf8'));

  for (const q of data) {
    // Log the question being processed for debugging
    //console.log(`Processing question: ${q.text}`);

    // Validate options
    if (!q.options || !Array.isArray(q.options)) {
      console.warn(`Skipping question with text "${q.text}" due to invalid or missing options`);
      continue; // Skip this question
    }

    // Validate other required fields (optional, for robustness)
    if (!q.tags || !Array.isArray(q.tags)) {
      console.warn(`Skipping question with text "${q.text}" due to invalid or missing tags`);
      continue;
    }

    await prisma.question.create({
      data: {
        topicId: q.topicId,
        subjectId: q.subjectId,
        passageId: q.passageId, // Optional, can be null
        text: q.text,
        difficulty: q.difficulty,
        aiDifficultyScore: q.aiDifficultyScore,
        explanation: q.explanation,
        cognitiveLevel: q.cognitiveLevel,
        tags: {
          set: q.tags,
        },
        options: {
          create: q.options.map((opt: any) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        },
      },
    });
  }
}

main()
  .then(() => {
    console.log('✅ Questions inserted');
  })
  .catch((err) => {
    console.error('❌ Error inserting questions:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });