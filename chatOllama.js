const axios = require('axios');

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

  return new Promise((resolve, reject) => {
    let fullAnswer = '';

    response.data.on('data', chunk => { 
      const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
      // console.log("Lines", lines);  // Debugging line to inspect chunks
      for (const line of lines) {
          try {
            const json = JSON.parse(line.replace(/^data:\s*/, ''));
            
            // Append the content to the fullAnswer variable
            if (json.message?.content) {
              fullAnswer += json.message.content;
            }
            
            // Check if the content is finished (done is true)
            if (json.done) {
              console.log("Final Answer:", fullAnswer);  // This is where you can print the final answer
            }
    
          } catch (err) {
            console.error('[DEBUG PARSE ERROR]', err.message, 'in', line);
          }
      }
    });
    

    response.data.on('end', () => {
      resolve(fullAnswer.trim());
    });

    response.data.on('error', reject);
  });
}

module.exports = askOllama;
