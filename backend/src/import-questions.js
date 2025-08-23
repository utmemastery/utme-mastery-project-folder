const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Utility function to chunk arrays
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Validate question data structure
function validateQuestion(question, index) {
  const errors = [];
  
  if (!question.text || question.text.trim() === '') {
    errors.push(`Question ${index + 1}: Missing question text`);
  }
  
  if (!question.options || !Array.isArray(question.options)) {
    errors.push(`Question ${index + 1}: Missing or invalid options array`);
  } else {
    if (question.options.length < 2) {
      errors.push(`Question ${index + 1}: Need at least 2 options`);
    }
    
    const correctOptions = question.options.filter(opt => opt.isCorrect);
    if (correctOptions.length !== 1) {
      errors.push(`Question ${index + 1}: Must have exactly 1 correct option`);
    }
    
    question.options.forEach((option, optIndex) => {
      if (!option.text || option.text.trim() === '') {
        errors.push(`Question ${index + 1}, Option ${optIndex + 1}: Missing option text`);
      }
      if (typeof option.isCorrect !== 'boolean') {
        errors.push(`Question ${index + 1}, Option ${optIndex + 1}: isCorrect must be boolean`);
      }
    });
  }
  
  if (!['EASY', 'MEDIUM', 'HARD'].includes(question.difficulty)) {
    errors.push(`Question ${index + 1}: Invalid difficulty level`);
  }
  
  return errors;
}

// Import questions from a single file
async function importQuestionsFromFile(filePath, options = {}) {
  console.log(`📚 Starting import from: ${filePath}`);
  
  try {
    // Read and parse JSON file
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Validate file structure
    if (!data.subjectId || !data.topicId || !Array.isArray(data.questions)) {
      throw new Error('Invalid file structure. Expected: { subjectId, topicId, questions[] }');
    }
    
    // Validate all questions first
    const validationErrors = [];
    data.questions.forEach((question, index) => {
      const errors = validateQuestion(question, index);
      validationErrors.push(...errors);
    });
    
    if (validationErrors.length > 0 && !options.skipValidation) {
      console.log('❌ Validation errors found:');
      validationErrors.forEach(error => console.log(`  - ${error}`));
      return { success: false, errors: validationErrors };
    }
    
    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId }
    });
    
    if (!subject) {
      throw new Error(`Subject with ID ${data.subjectId} not found. Please check your subject ID.`);
    }
    
    // Verify topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId }
    });
    
    if (!topic) {
      throw new Error(`Topic with ID ${data.topicId} not found. Please check your topic ID.`);
    }
    
    // Verify subtopic if specified
    let subtopic = null;
    if (data.subtopicId) {
      subtopic = await prisma.topic.findUnique({
        where: { id: data.subtopicId }
      });
      
      if (!subtopic) {
        console.log(`⚠️  Warning: Subtopic with ID ${data.subtopicId} not found. Continuing without subtopic.`);
      }
    }
    
    console.log(`📖 Subject: ${subject.name} (ID: ${data.subjectId})`);
    console.log(`📝 Topic: ${topic.name} (ID: ${data.topicId})`);
    if (subtopic) console.log(`📝 Subtopic: ${subtopic.name} (ID: ${data.subtopicId})`);
    console.log(`❓ Questions to import: ${data.questions.length}`);
    
    // Handle passages if any
    let passage = null;
    if (data.passage) {
      passage = await prisma.passage.create({
        data: {
          subjectId: data.subjectId,
          topicId: data.topicId,
          text: data.passage.text,
          passageType: data.passage.type || 'COMPREHENSION',
          discipline: data.passage.discipline,
          wordCount: data.passage.text.split(' ').length
        }
      });
      console.log(`📄 Created passage with ID: ${passage.id}`);
    }
    
    // Process questions in batches
    const batchSize = options.batchSize || 50;
    const questionChunks = chunkArray(data.questions, batchSize);
    
    let importedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < questionChunks.length; i++) {
      const chunk = questionChunks[i];
      console.log(`🔄 Processing batch ${i + 1}/${questionChunks.length} (${chunk.length} questions)`);
      
      const result = await processBatch(chunk, {
        subjectId: data.subjectId,
        topicId: data.topicId,
        subtopicId: data.subtopicId,
        passageId: passage?.id,
        skipDuplicates: options.skipDuplicates || false
      });
      
      importedCount += result.imported;
      skippedCount += result.skipped;
    }
    
    console.log(`✅ Import completed!`);
    console.log(`  - Imported: ${importedCount} questions`);
    console.log(`  - Skipped: ${skippedCount} questions`);
    
    return {
      success: true,
      imported: importedCount,
      skipped: skippedCount,
      total: data.questions.length
    };
    
  } catch (error) {
    console.error(`❌ Error importing from ${filePath}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Process a batch of questions
async function processBatch(questions, config) {
  let imported = 0;
  let skipped = 0;
  
  try {
    await prisma.$transaction(async (tx) => {
      for (const questionData of questions) {
        try {
          // Check for duplicates if requested
          if (config.skipDuplicates) {
            const existing = await tx.question.findFirst({
              where: {
                text: questionData.text,
                subjectId: config.subjectId,
                topicId: config.topicId
              }
            });
            
            if (existing) {
              skipped++;
              continue;
            }
          }
          
          // Extract options from question data
          const { options, ...questionFields } = questionData;
          
          // Create question
          const question = await tx.question.create({
            data: {
              ...questionFields,
              subjectId: config.subjectId,
              topicId: config.topicId,
              subtopicId: config.subtopicId,
              passageId: config.passageId,
              tags: questionData.tags || [],
              cognitiveLevel: questionData.cognitiveLevel || 'KNOWLEDGE',
              isDiagnostic: questionData.isDiagnostic || false,
              aiDifficultyScore: questionData.aiDifficultyScore
            }
          });
          
          // Create options
          await tx.option.createMany({
            data: options.map(option => ({
              questionId: question.id,
              text: option.text,
              isCorrect: option.isCorrect
            }))
          });
          
          imported++;
          
        } catch (error) {
          console.error(`Error processing question: ${questionData.text.substring(0, 50)}...`, error.message);
          throw error; // This will rollback the transaction
        }
      }
    });
  } catch (error) {
    throw new Error(`Batch processing failed: ${error.message}`);
  }
  
  return { imported, skipped };
}

// Import multiple files from a directory
async function importFromDirectory(directoryPath, options = {}) {
  console.log(`📁 Scanning directory: ${directoryPath}`);
  
  try {
    const files = await fs.readdir(directoryPath);
    const jsonFiles = files.filter(file => path.extname(file) === '.json');
    
    console.log(`📄 Found ${jsonFiles.length} JSON files`);
    
    const results = [];
    
    for (const file of jsonFiles) {
      const filePath = path.join(directoryPath, file);
      console.log(`\n${'='.repeat(50)}`);
      
      const result = await importQuestionsFromFile(filePath, options);
      results.push({ file, ...result });
    }
    
    // Summary
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 IMPORT SUMMARY`);
    console.log(`${'='.repeat(50)}`);
    
    let totalImported = 0;
    let totalSkipped = 0;
    let successfulFiles = 0;
    
    results.forEach(result => {
      if (result.success) {
        totalImported += result.imported || 0;
        totalSkipped += result.skipped || 0;
        successfulFiles++;
        console.log(`✅ ${result.file}: ${result.imported || 0} imported, ${result.skipped || 0} skipped`);
      } else {
        console.log(`❌ ${result.file}: Failed - ${result.error}`);
      }
    });
    
    console.log(`\nOverall: ${totalImported} questions imported from ${successfulFiles}/${jsonFiles.length} files`);
    
    return results;
    
  } catch (error) {
    console.error(`❌ Error reading directory: ${error.message}`);
    return [{ success: false, error: error.message }];
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📚 UTME Questions Import Script
Usage:
  node import-questions.js <file-or-directory> [options]

Options:
  --skip-duplicates    Skip questions that already exist
  --skip-validation    Skip validation checks
  --batch-size=N       Process N questions per batch (default: 50)

Examples:
  node import-questions.js questions.json
  node import-questions.js ./questions-folder --skip-duplicates
  node import-questions.js math-questions.json --batch-size=25
`);
    process.exit(1);
  }
  
  const inputPath = args[0];
  const options = {
    skipDuplicates: args.includes('--skip-duplicates'),
    skipValidation: args.includes('--skip-validation'),
    batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1]) || 50
  };
  
  console.log(`🚀 Starting UTME questions import...`);
  console.log(`Options:`, options);
  
  try {
    const stats = await fs.stat(inputPath);
    
    if (stats.isDirectory()) {
      await importFromDirectory(inputPath, options);
    } else {
      await importQuestionsFromFile(inputPath, options);
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Export functions for use as module
module.exports = {
  importQuestionsFromFile,
  importFromDirectory,
  validateQuestion
};

// Run CLI if script is executed directly
if (require.main === module) {
  main().catch(console.error);
}