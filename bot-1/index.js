const readline = require('readline');
const streamModelResponse = require('./chat');
const extractContextFromURL = require('./fetchContent');

// Init readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Store context once
let context = '';

async function main(url) {
  console.log(`Fetching content from ${url}...`);
  const fullContext = await extractContextFromURL(url);  // however you're fetching it
  context = fullContext.slice(0, 3000)
  console.log('📚 Context size (chars):', context.length);
  promptQuestion();  // only start asking after context is ready
}

function promptQuestion() {
  rl.question('\nAsk a question (or "exit"): ', async (question) => {
    if (question.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    const prompt = `Context: ${context}\n\nQuestion: ${question}`;
    const stream = await streamModelResponse(prompt);

    console.log(); // newline before streaming
    const start = Date.now();

    stream.on('data', chunk => {
      const { type, content } = JSON.parse(chunk.toString());

      if (type === 'message') {
        process.stdout.write(content);
      } else if (type === 'done') {
        const timeTaken = ((Date.now() - start) / 1000).toFixed(2);
        console.log(`\n\n[Complete] ⏱️ Answer generated in ${timeTaken} seconds`);
        promptQuestion(); // back to question loop
      }
    });

    stream.on('error', err => {
      console.error('❌ Stream error:', err);
      promptQuestion(); // try again
    });
  });
}


const url = process.argv[2];
if (!url) {
  console.log('Usage: node index.js <url>');
  process.exit(1);
}
main(url);
