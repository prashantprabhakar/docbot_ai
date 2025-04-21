// index.js
require('dotenv').config();
const readline = require('readline');
const fetchTextFromURL = require('./fetchContent');
const askAi = require('./chat');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.log('Usage: node index.js <url>');
    process.exit(1);
  }

  console.log(`Fetching content from ${url}...`);
  const context = await fetchTextFromURL(url);
  console.log('📄 Context size (chars):', context.length);

  rl.setPrompt('Ask a question (or "exit"): ');
  rl.prompt();

  rl.on('line', async (line) => {
    if (line.toLowerCase() === 'exit') {
      rl.close();
      return;
    }
  
    const start = Date.now();
    const answer = await askAi(context, line);
    const duration = ((Date.now() - start) / 1000).toFixed(2);
  
    console.log("******** Generating result")
    console.log('\n🔎 Answer:', answer);
    console.log(`⏱️ Answer generated in ${duration} seconds`);
    rl.prompt();
  });
}

main();
