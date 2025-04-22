import minimist from 'minimist';
import { bfsCrawl } from './crawler.js';
import { savePage } from './storage.js';

const args = minimist(process.argv.slice(2));


const websiteUrl = args.url;
if (!websiteUrl) {
  console.error('❌ Provide a URL to crawl.');
  process.exit(1);
}

(async () => {
  try {
    console.time('⏱️ Total crawl time');
  console.log("crawl started")
  const pages = await bfsCrawl(websiteUrl);
  pages.forEach(savePage);
  console.timeEnd('⏱️ Total crawl time');
  } catch(error) {
    console.log(error)
  }
})();