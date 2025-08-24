import { PrismaClient, DifficultyLevel, CognitiveLevel } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration
const TOTAL_PER_TOPIC = 10; // Target diagnostic questions per topic
const DIFFICULTY_DISTRIBUTION: Record<DifficultyLevel, number> = {
  EASY: 0.4,
  MEDIUM: 0.4,
  HARD: 0.2
};

// Bloom’s taxonomy mapping
const LOWER_ORDER: CognitiveLevel[] = ["REMEMBER", "UNDERSTAND", "APPLY"];
const HIGHER_ORDER: CognitiveLevel[] = ["ANALYZE", "EVALUATE", "CREATE"];

// Random sampling helper
function sampleArray<T>(arr: T[], n: number): T[] {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

async function main() {
  const subjects = await prisma.subject.findMany();
  const subjectSummary: Record<string, number> = {};

  for (const subject of subjects) {
    let subjectTotal = 0;

    const topics = await prisma.topic.findMany({ where: { subjectId: subject.id } });

    for (const topic of topics) {
      const allCandidates = await prisma.question.findMany({
        where: { topicId: topic.id, isDiagnostic: false }
      });

      const totalAvailable = allCandidates.length;
      if (totalAvailable === 0) continue;

      const totalToSelect = Math.min(TOTAL_PER_TOPIC, totalAvailable);
      const selectedQuestions: number[] = [];

      for (const [difficulty, diffRatio] of Object.entries(DIFFICULTY_DISTRIBUTION)) {
        const cognitiveGroups = [
          { levels: LOWER_ORDER, ratio: 0.8 },
          { levels: HIGHER_ORDER, ratio: 0.2 }
        ];

        for (const group of cognitiveGroups) {
          let numToSelect = Math.round(totalToSelect * diffRatio * group.ratio);

          // Filter candidates in this difficulty + cognitive group
const candidates = allCandidates.filter(
  q =>
    q.difficulty === difficulty &&
    q.cognitiveLevel !== null &&
    group.levels.includes(q.cognitiveLevel)
);


          if (candidates.length === 0) continue;

          numToSelect = Math.min(numToSelect, candidates.length);
          const sampled = sampleArray(candidates, numToSelect);
          selectedQuestions.push(...sampled.map(q => q.id));
        }
      }

      // Ensure at least one question per topic
      if (selectedQuestions.length === 0 && totalAvailable > 0) {
        selectedQuestions.push(allCandidates[0].id);
      }

      // Update selected questions
      await prisma.question.updateMany({
        where: { id: { in: selectedQuestions } },
        data: { isDiagnostic: true }
      });

      subjectTotal += selectedQuestions.length;

      console.log(
        `Topic "${topic.name}" (${subject.name}): Set ${selectedQuestions.length} diagnostic questions`
      );
    }

    subjectSummary[subject.name] = subjectTotal;
  }

  console.log('\n--- Diagnostic Questions Summary by Subject ---');
  for (const [subjectName, count] of Object.entries(subjectSummary)) {
    console.log(`${subjectName}: ${count} questions`);
  }

  console.log('\nDiagnostic questions selection completed!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
