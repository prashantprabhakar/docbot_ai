require('dotenv').config();

const askOpenAI = require('./chatOpenAi');
const askOllama = require('./chatOllama');



module.exports = process.env.USE_LOCAL_MODEL ? askOllama : askOpenAI
