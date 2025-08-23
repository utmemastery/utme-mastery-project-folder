import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Backfilling sectionId for questions...");

  // 1. Fetch all questions with their topic + sectionId
  const questions = await prisma.question.findMany({
    include: {
      topic: { select: { sectionId: true } },
    },
  });

  // 2. Collect updates
  const updates = questions
    .filter((q) => q.topic?.sectionId && q.sectionId === null) // only update missing sectionIds
    .map((q) =>
      prisma.question.update({
        where: { id: q.id },
        data: { sectionId: q.topic!.sectionId },
      })
    );

  console.log(`📌 Found ${updates.length} questions needing updates.`);

  // 3. Run in batches (to avoid overwhelming DB)
  const batchSize = 100;
  for (let i = 0; i < updates.length; i += batchSize) {
    await prisma.$transaction(updates.slice(i, i + batchSize));
    console.log(`✅ Updated batch ${i / batchSize + 1}`);
  }

  console.log("🎉 Backfill complete!");
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
