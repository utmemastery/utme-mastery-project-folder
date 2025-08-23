const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all subjects with their IDs
async function getAllSubjects() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true }
    });
    
    console.log('\n📚 SUBJECTS:');
    console.log('=' .repeat(50));
    subjects.forEach(subject => {
      console.log(`ID: ${subject.id.toString().padStart(3)} | ${subject.name}`);
      if (subject.description) {
        console.log(`     ${subject.description}`);
      }
      console.log('');
    });
    
    return subjects;
  } catch (error) {
    console.error('Error fetching subjects:', error.message);
    return [];
  }
}

// Get topics for a specific subject
async function getTopicsBySubject(subjectId) {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        topics: {
          orderBy: { name: 'asc' },
          select: { 
            id: true, 
            name: true, 
            description: true,
            parentTopicId: true,
            sectionId: true
          }
        }
      }
    });
    
    if (!subject) {
      console.log(`❌ Subject with ID ${subjectId} not found`);
      return [];
    }
    
    console.log(`\n📝 TOPICS for ${subject.name.toUpperCase()}:`);
    console.log('=' .repeat(60));
    
    // Separate main topics and subtopics
    const mainTopics = subject.topics.filter(topic => !topic.parentTopicId);
    const subtopics = subject.topics.filter(topic => topic.parentTopicId);
    
    mainTopics.forEach(topic => {
      console.log(`ID: ${topic.id.toString().padStart(3)} | ${topic.name}`);
      if (topic.description) {
        console.log(`     ${topic.description}`);
      }
      
      // Show subtopics
      const relatedSubtopics = subtopics.filter(st => st.parentTopicId === topic.id);
      if (relatedSubtopics.length > 0) {
        console.log('     Subtopics:');
        relatedSubtopics.forEach(subtopic => {
          console.log(`       ID: ${subtopic.id.toString().padStart(3)} | ${subtopic.name}`);
        });
      }
      console.log('');
    });
    
    return subject.topics;
  } catch (error) {
    console.error('Error fetching topics:', error.message);
    return [];
  }
}

// Search for topics by name (partial match)
async function searchTopics(searchTerm) {
  try {
    const topics = await prisma.topic.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      include: {
        subject: {
          select: { name: true }
        }
      },
      orderBy: [
        { subject: { name: 'asc' } },
        { name: 'asc' }
      ]
    });
    
    console.log(`\n🔍 SEARCH RESULTS for "${searchTerm}":`);
    console.log('=' .repeat(60));
    
    if (topics.length === 0) {
      console.log('No topics found matching your search.');
      return [];
    }
    
    topics.forEach(topic => {
      console.log(`ID: ${topic.id.toString().padStart(3)} | ${topic.name} (${topic.subject.name})`);
      if (topic.description) {
        console.log(`     ${topic.description}`);
      }
      console.log('');
    });
    
    return topics;
  } catch (error) {
    console.error('Error searching topics:', error.message);
    return [];
  }
}

// Get sections for a subject
async function getSectionsBySubject(subjectId) {
  try {
    const sections = await prisma.section.findMany({
      where: { subjectId },
      orderBy: { name: 'asc' },
      select: { 
        id: true, 
        name: true, 
        description: true,
        topics: {
          select: { id: true, name: true }
        }
      }
    });
    
    console.log(`\n📑 SECTIONS for Subject ID ${subjectId}:`);
    console.log('=' .repeat(50));
    
    sections.forEach(section => {
      console.log(`ID: ${section.id.toString().padStart(3)} | ${section.name}`);
      if (section.description) {
        console.log(`     ${section.description}`);
      }
      if (section.topics.length > 0) {
        console.log('     Topics:');
        section.topics.forEach(topic => {
          console.log(`       ID: ${topic.id.toString().padStart(3)} | ${topic.name}`);
        });
      }
      console.log('');
    });
    
    return sections;
  } catch (error) {
    console.error('Error fetching sections:', error.message);
    return [];
  }
}

// Generate template JSON file
async function generateTemplate(subjectId, topicId, subtopicId = null) {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { name: true }
    });
    
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { name: true }
    });
    
    let subtopic = null;
    if (subtopicId) {
      subtopic = await prisma.topic.findUnique({
        where: { id: subtopicId },
        select: { name: true }
      });
    }
    
    if (!subject || !topic) {
      console.log('❌ Invalid subject or topic ID');
      return;
    }
    
    const template = {
      subjectId,
      topicId,
      ...(subtopicId && { subtopicId }),
      questions: [
        {
          text: "Your question text here",
          difficulty: "MEDIUM",
          explanation: "Explanation of the correct answer",
          cognitiveLevel: "APPLICATION",
          tags: ["tag1", "tag2"],
          aiDifficultyScore: 0.65,
          isDiagnostic: false,
          options: [
            {
              text: "Option A",
              isCorrect: true
            },
            {
              text: "Option B", 
              isCorrect: false
            },
            {
              text: "Option C",
              isCorrect: false
            },
            {
              text: "Option D",
              isCorrect: false
            }
          ]
        }
      ]
    };
    
    const filename = `questions_${subject.name.toLowerCase().replace(/\s+/g, '_')}_${topic.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    
    console.log(`\n📄 TEMPLATE for ${subject.name} > ${topic.name}:`);
    console.log('=' .repeat(60));
    console.log(JSON.stringify(template, null, 2));
    
    // Optionally save to file
    const fs = require('fs').promises;
    await fs.writeFile(filename, JSON.stringify(template, null, 2));
    console.log(`\n✅ Template saved to: ${filename}`);
    
  } catch (error) {
    console.error('Error generating template:', error.message);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔍 UTME Database ID Helper

Usage:
  node get-ids.js subjects              # List all subjects
  node get-ids.js topics <subjectId>    # List topics for a subject  
  node get-ids.js search <searchTerm>   # Search topics by name
  node get-ids.js sections <subjectId>  # List sections for a subject
  node get-ids.js template <subjectId> <topicId> [subtopicId]  # Generate template

Examples:
  node get-ids.js subjects
  node get-ids.js topics 1
  node get-ids.js search "quadratic"
  node get-ids.js template 1 15
  node get-ids.js template 1 15 25
`);
    process.exit(1);
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case 'subjects':
        await getAllSubjects();
        break;
        
      case 'topics':
        if (!args[1]) {
          console.log('❌ Please provide subject ID');
          process.exit(1);
        }
        await getTopicsBySubject(parseInt(args[1]));
        break;
        
      case 'search':
        if (!args[1]) {
          console.log('❌ Please provide search term');
          process.exit(1);
        }
        await searchTopics(args[1]);
        break;
        
      case 'sections':
        if (!args[1]) {
          console.log('❌ Please provide subject ID');
          process.exit(1);
        }
        await getSectionsBySubject(parseInt(args[1]));
        break;
        
      case 'template':
        if (!args[1] || !args[2]) {
          console.log('❌ Please provide subject ID and topic ID');
          process.exit(1);
        }
        const subtopicId = args[3] ? parseInt(args[3]) : null;
        await generateTemplate(parseInt(args[1]), parseInt(args[2]), subtopicId);
        break;
        
      default:
        console.log(`❌ Unknown command: ${command}`);
        process.exit(1);
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
  getAllSubjects,
  getTopicsBySubject,
  searchTopics,
  getSectionsBySubject,
  generateTemplate
};

// Run CLI if script is executed directly
if (require.main === module) {
  main().catch(console.error);
}