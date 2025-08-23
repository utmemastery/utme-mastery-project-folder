// AI Question Converter - requires OpenAI API key
const OpenAI = require('openai');
const fs = require('fs').promises;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Set this in your environment
});

// Convert raw text questions to structured JSON
async function convertQuestionsToJSON(rawText, subjectId, topicId, options = {}) {
  const systemPrompt = `
You are a UTME/JAMB question formatter. Convert the given raw text into structured JSON format.

Required JSON structure:
{
  "subjectId": ${subjectId},
  "topicId": ${topicId},
  "questions": [
    {
      "text": "Question text here",
      "difficulty": "EASY|MEDIUM|HARD",
      "explanation": "Brief explanation of correct answer",
      "cognitiveLevel": "KNOWLEDGE|COMPREHENSION|APPLICATION|ANALYSIS|SYNTHESIS|EVALUATION",
      "tags": ["relevant", "tags"],
      "options": [
        {"text": "Option A", "isCorrect": true},
        {"text": "Option B", "isCorrect": false},
        {"text": "Option C", "isCorrect": false},
        {"text": "Option D", "isCorrect": false}
      ]
    }
  ]
}

Rules:
1. Extract each question with its options
2. Identify the correct answer (usually marked with asterisk *, or stated as "Answer: X")
3. Set difficulty based on question complexity (default to MEDIUM if unsure)
4. Add brief explanation for the correct answer
5. Use appropriate cognitive level based on what the question tests
6. Add relevant tags based on the topic/concept being tested
7. Clean up formatting, remove extra spaces/newlines
8. If multiple correct answers exist, choose the most appropriate one
9. Ensure exactly 4 options per question (A, B, C, D format)

Return only valid JSON, no additional text.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Convert these questions:\n\n${rawText}` }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    const jsonContent = response.choices[0].message.content;
    
    // Validate JSON
    const parsedData = JSON.parse(jsonContent);
    
    console.log(`✅ Successfully converted ${parsedData.questions.length} questions`);
    return parsedData;
    
  } catch (error) {
    console.error('❌ AI conversion error:', error.message);
    throw error;
  }
}

// Convert multiple batches of questions
async function processBatchedQuestions(textBatches, subjectId, topicId, outputDir = './converted') {
  await fs.mkdir(outputDir, { recursive: true });
  
  const results = [];
  
  for (let i = 0; i < textBatches.length; i++) {
    const batch = textBatches[i];
    console.log(`🔄 Processing batch ${i + 1}/${textBatches.length}`);
    
    try {
      const convertedData = await convertQuestionsToJSON(batch, subjectId, topicId);
      
      // Save to file
      const filename = `batch_${i + 1}_subject_${subjectId}_topic_${topicId}.json`;
      const filepath = `${outputDir}/${filename}`;
      
      await fs.writeFile(filepath, JSON.stringify(convertedData, null, 2));
      
      console.log(`💾 Saved: ${filename} (${convertedData.questions.length} questions)`);
      results.push({ filename, count: convertedData.questions.length, success: true });
      
      // Rate limiting - wait between requests
      if (i < textBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`❌ Failed to process batch ${i + 1}:`, error.message);
      results.push({ batch: i + 1, success: false, error: error.message });
    }
  }
  
  return results;
}

// Split large text into manageable chunks
function splitTextIntoChunks(text, maxQuestionsPerChunk = 10) {
  // Split by common question patterns
  const questionPatterns = [
    /\d+\.\s+/g,  // "1. ", "2. ", etc.
    /Question\s+\d+/gi,  // "Question 1", "Question 2", etc.
    /\n\s*\n(?=\S)/g  // Double newlines followed by content
  ];
  
  let chunks = [text];
  
  // Try different splitting patterns
  for (const pattern of questionPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > maxQuestionsPerChunk) {
      chunks = text.split(pattern).filter(chunk => chunk.trim().length > 50);
      break;
    }
  }
  
  // If chunks are still too large, split by length
  const maxChunkLength = 8000; // characters
  const finalChunks = [];
  
  for (const chunk of chunks) {
    if (chunk.length <= maxChunkLength) {
      finalChunks.push(chunk);
    } else {
      // Split large chunks
      const subChunks = chunk.match(new RegExp('.{1,' + maxChunkLength + '}', 'g'));
      finalChunks.push(...subChunks);
    }
  }
  
  return finalChunks.filter(chunk => chunk.trim().length > 100);
}

// Main conversion function
async function convertFromFile(inputFile, subjectId, topicId, options = {}) {
  console.log(`📖 Reading file: ${inputFile}`);
  
  try {
    const rawText = await fs.readFile(inputFile, 'utf8');
    
    if (!rawText || rawText.trim().length < 100) {
      throw new Error('File appears to be empty or too short');
    }
    
    console.log(`📝 File size: ${rawText.length} characters`);
    
    // Split into manageable chunks
    const chunks = splitTextIntoChunks(rawText, options.questionsPerChunk || 10);
    console.log(`📊 Split into ${chunks.length} chunks`);
    
    // Process chunks
    const results = await processBatchedQuestions(chunks, subjectId, topicId, options.outputDir);
    
    // Summary
    const successful = results.filter(r => r.success);
    const totalQuestions = successful.reduce((sum, r) => sum + (r.count || 0), 0);
    
    console.log(`\n📊 CONVERSION SUMMARY:`);
    console.log(`✅ Successful batches: ${successful.length}/${results.length}`);
    console.log(`❓ Total questions converted: ${totalQuestions}`);
    
    if (results.some(r => !r.success)) {
      console.log(`❌ Failed batches:`);
      results.filter(r => !r.success).forEach(r => {
        console.log(`   Batch ${r.batch}: ${r.error}`);
      });
    }
    
    return results;
    
  } catch (error) {
    console.error(`❌ Error processing file: ${error.message}`);
    throw error;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log(`
🤖 AI Question Converter

Prerequisites:
  - Set OPENAI_API_KEY environment variable
  - npm install openai

Usage:
  node convert-questions.js <input-file> <subjectId> <topicId> [options]

Options:
  --output-dir=<dir>           Output directory (default: ./converted)
  --questions-per-chunk=<n>    Questions per batch (default: 10)

Examples:
  node convert-questions.js math_questions.txt 1 15
  node convert-questions.js physics.txt 3 72 --output-dir=./physics_converted
  
Note: Input file should contain plain text with questions and options.
`);
    process.exit(1);
  }
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Please set OPENAI_API_KEY environment variable');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const subjectId = parseInt(args[1]);
  const topicId = parseInt(args[2]);
  
  const options = {
    outputDir: args.find(arg => arg.startsWith('--output-dir='))?.split('=')[1] || './converted',
    questionsPerChunk: parseInt(args.find(arg => arg.startsWith('--questions-per-chunk='))?.split('=')[1]) || 10
  };
  
  console.log(`🚀 Starting AI conversion...`);
  console.log(`Input: ${inputFile}`);
  console.log(`Subject ID: ${subjectId}, Topic ID: ${topicId}`);
  console.log(`Options:`, options);
  
  try {
    await convertFromFile(inputFile, subjectId, topicId, options);
    console.log(`🎉 Conversion completed!`);
  } catch (error) {
    console.error(`❌ Conversion failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  convertQuestionsToJSON,
  convertFromFile,
  splitTextIntoChunks
};

if (require.main === module) {
  main().catch(console.error);
}