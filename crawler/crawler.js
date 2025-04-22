// webCrawler.js
import { URL } from 'url';
import pLimit from 'p-limit';
import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'fs';

import {
    isValidUrl,
    isSameDomain,
    cleanText,
    shouldIgnore,
    ignoreHash,
  } from './utils.js';

const config = {
  crawlDepth: 1,
  maxLinksPerPage: 20,
  maxPagesTotal: 21,
  baseDomainOnly: true,
  concurrencyLimit: 5,
};

let pageCount = 0;
const limit = pLimit(config.concurrencyLimit);



export async function crawlPageDfs(url, { depth = config.crawlDepth, maxLinksPerPage = config.maxLinksPerPage, visited = new Set(), baseDomain = new URL(url).hostname } = {}) {
    if (depth < 0 || visited.has(url) || pageCount >= config.maxPagesTotal) {
      return [];
    }
    visited.add(url);
    pageCount++;
  
    try {
      const { data: html } = await axios.get(url, { timeout: 8000 });

      const $ = cheerio.load(html);
      const content = parseHTMLContent(html, url);
      const title = cleanText($('title').text());
  
      const links = Array.from($('a'))
        .map(a => $(a).attr('href'))
        .filter(href => href && !shouldIgnore(href))
        .map(href => new URL(ignoreHash(href), url).href)
        .filter(href => isValidUrl(href) && isSameDomain(url, href))
        .slice(0, maxLinksPerPage);
  
      console.log(`🔗 Found ${links.length} links on ${url}`);

      const pageData = [{ url, title, content }];
  
      // const childPagesPromise = await Promise.allSettled(
      //   links.map(link => limit(() => crawlPage(link, { depth: depth - 1, maxLinksPerPage, visited, baseDomain })))
      // );

      const childPagesPromise = await Promise.allSettled(
        links.map(link => crawlPage(link, { depth: depth - 1, maxLinksPerPage, visited, baseDomain }))
      );


      const childPages = childPagesPromise.filter(p => p.status === 'fulfilled').map(p => p.value)
      childPages.flat().forEach(p => pageData.push(p));
  
      return pageData;
    } catch (err) {
      console.error(`Error crawling ${url}:`, err.message);
      return [];
    }
}

export async function bfsCrawl(startUrl) {
  const visited = new Set();
  const queue = [{ url: startUrl, depth: 0 }];
  const baseDomain = new URL(startUrl).hostname;
  const results = [];

  while (queue.length > 0 && pageCount < config.maxPagesTotal) {
    const batch = queue.splice(0, config.concurrencyLimit); // Process in chunks for concurrency
    const promises = batch.map(({ url, depth }) => limit(() =>
      crawlSinglePage(url, depth, visited, baseDomain, queue)
    ));
    
    const settled = await Promise.allSettled(promises);
    for (const result of settled) {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    }
  }

  return results;
}

async function crawlSinglePage(
  url, depth, visited, baseDomain, queue
) {
  if (depth > config.crawlDepth || visited.has(url) || pageCount >= config.maxPagesTotal) return null;

  visited.add(url);
  pageCount++;

  try {
    const { data: html } = await axios.get(url, { timeout: 8000 });
    const $ = cheerio.load(html);
    const title = cleanText($('title').text());
    const content = parseHTMLContent(html, url);

    // Extract valid links
    // const links = Array.from($('a'))
    //   .map(a => $(a).attr('href'))
    //   .filter(href => href && !shouldIgnore(href))
    //   .map(href => new URL(ignoreHash(href), url).href)
    //   .filter(href => shoudldVisitUrl(href, url, visited) )
    //   .slice(0, config.maxLinksPerPage);

    const allLinks = Array.from($('a'))
      .map(a => $(a).attr('href'))
      .filter(href => href && !shouldIgnore(href))
      .map(href => new URL(ignoreHash(href), url).href)
      .filter(href => !href.includes('Nikola_Tesla'))

    fs.writeFileSync('urls', JSON.stringify(allLinks, null, 2))

    console.log(`🔗 Found ${allLinks.length} links on ${url}`);
    // console.log(`All links`, allLinks)
    const links = allLinks
      .filter(href => shoudldVisitUrl(href, url, visited) )
      .slice(0, config.maxLinksPerPage);

    console.log(`🔗 Found ${links.length} links on ${url}`);
    // Enqueue new links
    for (const link of links) {
      if (!visited.has(link) && pageCount < config.maxPagesTotal) {
        queue.push({ url: link, depth: depth + 1 });
      }
    }

    return { url, title, content };
  } catch (err) {
    console.error(`❌ Error crawling ${url}: ${err.message}`);
    return null;
  }
}

function shoudldVisitUrl(href, url, visited) {
  const isWikiInternalUrl = href.includes('wikipedia.org/wiki/Special:') || href.includes('wikipedia.org/wiki/Help:') || href.includes('wikipedia.org/wiki/Wikipedia:');
  
  // Make sure we're not matching links to the same page, internal wiki pages, or language versions
  return (
    isValidUrl(href) &&
    isSameDomain(url, href) &&
    href !== url && // Prevent self-link
    !isWikiInternalUrl && // Ignore internal wiki pages (Special:*, Help:*, etc.)
    !visited.has(href) // // Avoid revisiting
  );
}

function getArticleTitle(url) {
  const match = url.match(/wikipedia\.org\/wiki\/([^:\/?#&]+)/); // Improved regex to capture more cases
  return match ? match[1] : null;
}
  

// for wikkipedia
function parseHTMLContent(html, url) {
  const $ = cheerio.load(html);
  const article = $('#mw-content-text');
  // Extract only semantic text elements
  let textParts= [];
  article.find('p, h1, h2, h3, h4, li').each((_, elem) => {
    $(elem).find('sup.reference').remove(); // clean refs
    let text = $(elem).text().trim();
    text = text.replace(/\[\d+\]/g, ''); // strip [1], [2], etc.

    if (text.length > 50) { // avoid short junk like nav links
      textParts.push(text);
    }
  });
  const content = textParts.join('\n\n');
  return cleanText(content)
}