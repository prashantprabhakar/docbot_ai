// chatWithOpenAI.js
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askOpenAI(context, question) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: `Answer questions based on this content: ${context}` },
      { role: 'user', content: question },
    ],
  });

  return response.choices[0].message.content;
}

module.exports = askOpenAI;
