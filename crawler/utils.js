export function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  export function isSameDomain(origin, target) {
    try {
      const originHost = new URL(origin).hostname;
      const targetHost = new URL(target).hostname;
      return originHost === targetHost;
    } catch {
      return false;
    }
  }
  
  export function cleanText(text) {
    return text.replace(/\s+/g, ' ').trim();
  }
  
  export function shouldIgnore(link) {
    return link.startsWith('mailto:') || link.startsWith('tel:') || link.endsWith('.pdf');
  }
  
  export function ignoreHash(href) {
    return href.split('#')[0];
  }