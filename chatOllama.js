const axios = require('axios');
const { Readable } = require('stream');

async function askOllama(context, question) {
  const messages = [
    {
      role: 'system',
      content: `You are a helpful assistant answering questions about this article: ${context}`
    },
    {
      role: 'user',
      content: question
    }
  ];

  // Return a readable stream that emits unified events
  const output = new Readable({
    read() { }
  });

  const response = await axios({
    method: 'POST',
    url: 'http://localhost:11434/api/chat',
    data: {
      model: 'mistral',
      messages,
      stream: true,
    },
    responseType: 'stream',
  });


  response.data.on('data', chunk => {
    const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
    for (const line of lines) {
      try {
        const json = JSON.parse(line.replace(/^data:\s*/, ''));

        // Append the content to the fullAnswer variable
        if (json.message?.content) {
          output.push(JSON.stringify({
            type: 'message',
            content: json.message.content
          }) + '\n');
        }

        // Check if the content is finished (done is true)
        if (json.done) {
          if (json.done) {
            output.push(JSON.stringify({ type: 'done' }) + '\n');
            output.push(null); // End the stream
          }
        }

      } catch (err) {
        console.error('[DEBUG PARSE ERROR]', err.message, 'in', line);
      }
    }
  });

  return output;

}

module.exports = askOllama;
