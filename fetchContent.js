// // fetchWebsiteContent.js
// const axios = require('axios');
// const cheerio = require('cheerio');

// async function fetchTextFromURL(url) {
//   const { data } = await axios.get(url);
//   const $ = cheerio.load(data);
// //   return $('body').text().replace(/\s+/g, ' ').trim();// when using openai
//   return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 3000); // Limit to fit local model context

// }

// module.exports = fetchTextFromURL;


const axios = require('axios');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

async function fetchCleanArticle(url) {
  try {
    const { data: html } = await axios.get(url);
    const dom = new JSDOM(html, { url }); // set base URL for proper resource resolution
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    return article?.textContent?.trim().slice(0, 3000) || 'No content found.';
  } catch (err) {
    console.error('[fetchContent] Failed to extract:', err.message);
    return 'Error fetching or parsing article.';
  }
}

module.exports = fetchCleanArticle;
