/**
 * coverService.js — Centralized Book Cover Resolution & Caching Engine
 * 
 * Implements a multi-tier fallback chain for books across 271,000+ records:
 * 1. Normalized dataset cover URL (HTTPS upgraded, size matched)
 * 2. Open Library by Normalized ISBN (L / M sizes with ?default=false)
 * 3. Open Library Cover ID / OLID if present
 * 4. Open Library Search API by Title + Author (cached)
 * 5. Google Books API metadata lookup (cached)
 * 6. High-quality PAPERWILD generated editorial fallback
 */

const MEMORY_CACHE = new Map();
const PENDING_LOOKUPS = new Map();
const FAILED_URLS = new Set();
const LOCAL_STORAGE_KEY = 'paperwild_cover_cache_v2';

// Initialize cache from localStorage
try {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    Object.entries(parsed).forEach(([k, v]) => MEMORY_CACHE.set(k, v));
  }
} catch (e) {
  // Ignore localStorage errors
}

// Persist cache to localStorage (debounced)
let saveTimeout = null;
function persistCache() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const obj = {};
      // Save up to 500 most recent items to avoid quota issues
      let count = 0;
      for (const [k, v] of MEMORY_CACHE.entries()) {
        if (count++ > 500) break;
        obj[k] = v;
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      // Quota exceeded or private browsing
    }
  }, 1000);
}

/**
 * Normalizes raw ISBN into clean 10 or 13 character alphanumeric string.
 * Fixes leading zero loss from Excel numerical exports (e.g. '195153448' -> '0195153448').
 */
export function normalizeIsbn(rawIsbn) {
  if (!rawIsbn) return '';
  let str = String(rawIsbn).trim().toUpperCase();
  // Strip hyphens, spaces, slashes
  str = str.replace(/[-\s/\\]/g, '');

  // If ISBN-10 is missing leading zero (length 9 or less if numeric)
  if (str.length === 9) {
    str = '0' + str;
  } else if (str.length === 8 && /^\d+$/.test(str)) {
    str = '00' + str;
  } else if (str.length === 7 && /^\d+$/.test(str)) {
    str = '000' + str;
  }

  return str;
}

/**
 * Validates whether an ISBN has proper length and characters
 */
export function isValidIsbn(isbn) {
  const norm = normalizeIsbn(isbn);
  if (norm.length === 10) {
    return /^[0-9]{9}[0-9X]$/.test(norm);
  }
  if (norm.length === 13) {
    return /^[0-9]{13}$/.test(norm);
  }
  return false;
}

/**
 * Cleans dataset URL and enforces HTTPS
 */
export function cleanDatasetUrl(url) {
  if (!url || typeof url !== 'string') return null;
  let clean = url.trim();
  if (!clean.startsWith('http')) return null;

  // Upgrade http to https
  if (clean.startsWith('http://')) {
    clean = 'https://' + clean.slice(7);
  }

  // Filter known broken generic Amazon placeholder images
  if (clean.includes('01.THUMBZZZ.jpg') || clean.includes('01.MZZZZZZZ.jpg') || clean.includes('01.LZZZZZZZ.jpg')) {
    // These are often 403 or 1x1 on images.amazon.com today, but we can try them
  }

  return clean;
}

/**
 * Generates prioritized list of synchronous cover candidates for a book
 * @param {Object} book - Book object
 * @param {string} size - 'L' | 'M' | 'S'
 * @returns {string[]} List of candidate URLs to try in order
 */
export function getCandidateCoverUrls(book, size = 'M') {
  if (!book) return [];

  const candidates = [];
  const isbn = normalizeIsbn(book.ISBN || book.isbn || '');
  const olSize = size.toUpperCase(); // 'L', 'M', or 'S'

  // Check client-side resolved cache first
  const cacheKey = `${isbn || book['Book-Title']}_${olSize}`;
  if (MEMORY_CACHE.has(cacheKey)) {
    candidates.push(MEMORY_CACHE.get(cacheKey));
  }

  // 1. Open Library by normalized ISBN (Very high quality, covers millions of books)
  // Use ?default=false so Open Library returns 404 instead of a blank 1x1 GIF!
  if (isbn && isValidIsbn(isbn)) {
    candidates.push(`https://covers.openlibrary.org/b/isbn/${isbn}-${olSize}.jpg?default=false`);
    // Fallback to alternate size if L fails
    if (olSize === 'L') {
      candidates.push(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`);
    } else if (olSize === 'M') {
      candidates.push(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`);
    }
  }

  // 2. Open Library by Cover ID if present in book metadata
  const coverId = book.cover_id || book.cover_i;
  if (coverId) {
    candidates.push(`https://covers.openlibrary.org/b/id/${coverId}-${olSize}.jpg?default=false`);
  }

  // 3. Open Library by OLID if present
  const olid = book.olid || book.openlibrary_id;
  if (olid) {
    candidates.push(`https://covers.openlibrary.org/b/olid/${olid}-${olSize}.jpg?default=false`);
  }

  // 4. Dataset Cover URL (size prioritized)
  const urlL = cleanDatasetUrl(book['Image-URL-L'] || book.image_url_l);
  const urlM = cleanDatasetUrl(book['Image-URL-M'] || book.image_url_m);
  const urlS = cleanDatasetUrl(book['Image-URL-S'] || book.image_url_s);

  if (olSize === 'L') {
    if (urlL) candidates.push(urlL);
    if (urlM) candidates.push(urlM);
    if (urlS) candidates.push(urlS);
  } else if (olSize === 'M') {
    if (urlM) candidates.push(urlM);
    if (urlL) candidates.push(urlL);
    if (urlS) candidates.push(urlS);
  } else {
    if (urlS) candidates.push(urlS);
    if (urlM) candidates.push(urlM);
    if (urlL) candidates.push(urlL);
  }

  // Deduplicate and filter out known failed URLs
  const unique = [];
  for (const url of candidates) {
    if (url && !unique.includes(url) && !FAILED_URLS.has(url)) {
      unique.push(url);
    }
  }

  return unique;
}

/**
 * Performs asynchronous metadata lookup via Open Library Search API by Title + Author
 * Resolves with a high-resolution cover URL or null if not found.
 */
export async function lookupCoverByMetadata(title, author, size = 'L') {
  if (!title) return null;
  const olSize = size.toUpperCase();
  const searchKey = `meta_${title.trim().toLowerCase()}_${(author || '').trim().toLowerCase()}_${olSize}`;

  if (MEMORY_CACHE.has(searchKey)) {
    return MEMORY_CACHE.get(searchKey);
  }

  if (PENDING_LOOKUPS.has(searchKey)) {
    return PENDING_LOOKUPS.get(searchKey);
  }

  const promise = (async () => {
    try {
      // 1. Try Open Library Search API
      let query = `title=${encodeURIComponent(title.trim())}`;
      if (author && author !== 'Unknown') {
        // Strip initials and punctuation for cleaner query
        const cleanAuthor = author.replace(/[.,]/g, '').trim();
        query += `&author=${encodeURIComponent(cleanAuthor)}`;
      }

      const res = await fetch(`https://openlibrary.org/search.json?${query}&limit=1`, {
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        const doc = data?.docs?.[0];
        if (doc) {
          // Check cover_i (Open Library cover ID)
          if (doc.cover_i) {
            const coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-${olSize}.jpg?default=false`;
            MEMORY_CACHE.set(searchKey, coverUrl);
            persistCache();
            return coverUrl;
          }
          // Check if doc has valid ISBN
          if (doc.isbn && doc.isbn.length > 0) {
            const foundIsbn = normalizeIsbn(doc.isbn[0]);
            const coverUrl = `https://covers.openlibrary.org/b/isbn/${foundIsbn}-${olSize}.jpg?default=false`;
            MEMORY_CACHE.set(searchKey, coverUrl);
            persistCache();
            return coverUrl;
          }
        }
      }

      // 2. Secondary fallback: Google Books Volume API (no API key needed)
      let gbQuery = `intitle:${encodeURIComponent(title.trim())}`;
      if (author && author !== 'Unknown') {
        gbQuery += `+inauthor:${encodeURIComponent(author.trim())}`;
      }
      const gbRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${gbQuery}&maxResults=1`);
      if (gbRes.ok) {
        const gbData = await gbRes.json();
        const item = gbData?.items?.[0];
        const images = item?.volumeInfo?.imageLinks;
        if (images) {
          let bestGbUrl = images.large || images.medium || images.thumbnail || images.smallThumbnail;
          if (bestGbUrl) {
            if (bestGbUrl.startsWith('http://')) bestGbUrl = 'https://' + bestGbUrl.slice(7);
            // Replace zoom=1 with zoom=2 or zoom=3 for higher resolution
            if (olSize === 'L') {
              bestGbUrl = bestGbUrl.replace('zoom=1', 'zoom=2');
            }
            MEMORY_CACHE.set(searchKey, bestGbUrl);
            persistCache();
            return bestGbUrl;
          }
        }
      }

      return null;
    } catch (err) {
      return null;
    } finally {
      PENDING_LOOKUPS.delete(searchKey);
    }
  })();

  PENDING_LOOKUPS.set(searchKey, promise);
  return promise;
}

/**
 * Records a successful cover resolution in cache
 */
export function recordSuccessfulCover(book, size, url) {
  const isbn = normalizeIsbn(book?.ISBN || book?.isbn || '');
  const title = book?.['Book-Title'] || book?.title || '';
  const olSize = (size || 'M').toUpperCase();

  if (isbn) {
    MEMORY_CACHE.set(`${isbn}_${olSize}`, url);
  }
  if (title) {
    MEMORY_CACHE.set(`${title}_${olSize}`, url);
  }
  persistCache();
}

/**
 * Records a failed cover URL to prevent querying it again
 */
export function recordFailedCoverUrl(url) {
  if (url) {
    FAILED_URLS.add(url);
  }
}

/**
 * Deterministic color palettes for the PAPERWILD generated editorial fallback
 */
export const PAPERWILD_PALETTES = [
  {
    name: 'terracotta',
    bg: '#D97757',
    border: '#141416',
    ink: '#141416',
    paper: '#FFF4EE',
    accent: '#FAED8F',
    pattern: 'diamond'
  },
  {
    name: 'midnight-slate',
    bg: '#252F3E',
    border: '#141416',
    ink: '#FFFFFF',
    paper: '#10151C',
    accent: '#FAED8F',
    pattern: 'sunburst'
  },
  {
    name: 'vintage-sage',
    bg: '#3F6152',
    border: '#141416',
    ink: '#FAED8F',
    paper: '#1F342B',
    accent: '#FAED8F',
    pattern: 'crosshatch'
  },
  {
    name: 'antique-gold',
    bg: '#D4A348',
    border: '#141416',
    ink: '#141416',
    paper: '#FCF7E8',
    accent: '#141416',
    pattern: 'concentric'
  },
  {
    name: 'dusty-plum',
    bg: '#5C3857',
    border: '#141416',
    ink: '#FFFFFF',
    paper: '#2D172A',
    accent: '#FAED8F',
    pattern: 'arch'
  },
  {
    name: 'butter-cream',
    bg: '#FAED8F',
    border: '#141416',
    ink: '#141416',
    paper: '#FDFCEB',
    accent: '#1F3DF5',
    pattern: 'diamond'
  }
];

/**
 * Selects deterministic PAPERWILD palette based on book title or ISBN
 */
export function getPaperwildPalette(title = '', isbn = '') {
  const seed = (title || 'Book') + (isbn || '');
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PAPERWILD_PALETTES.length;
  return PAPERWILD_PALETTES[index];
}

/**
 * Returns Open Library cover URL for a book if ISBN, cover_id, or olid is present
 * @param {Object} book 
 * @param {string} size - 'L' | 'M' | 'S'
 * @returns {string|null}
 */
export function getOpenLibraryCover(book, size = 'M') {
  if (!book) return null;
  const olSize = (size || 'M').toUpperCase();
  const isbn = normalizeIsbn(book.ISBN || book.isbn || '');
  if (isbn && isValidIsbn(isbn)) {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-${olSize}.jpg?default=false`;
  }
  const coverId = book.cover_id || book.cover_i;
  if (coverId) {
    return `https://covers.openlibrary.org/b/id/${coverId}-${olSize}.jpg?default=false`;
  }
  const olid = book.olid || book.openlibrary_id;
  if (olid) {
    return `https://covers.openlibrary.org/b/olid/${olid}-${olSize}.jpg?default=false`;
  }
  return null;
}

/**
 * Validates whether a cover URL is structurally valid and not blacklisted
 * @param {string} url 
 * @returns {boolean}
 */
export function isValidCover(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('data:image')) {
    return false;
  }
  if (FAILED_URLS.has(clean)) return false;
  return true;
}

/**
 * Synchronously returns the highest priority available candidate URL for a book
 * @param {Object} book 
 * @param {string} size - 'L' | 'M' | 'S'
 * @returns {string|null}
 */
export function getBestCover(book, size = 'M') {
  if (!book) return null;
  const candidates = getCandidateCoverUrls(book, size);
  return candidates.length > 0 ? candidates[0] : null;
}

/**
 * Returns deterministic fallback cover configuration for a book
 * @param {Object} book 
 * @returns {Object}
 */
export function getFallbackCover(book) {
  const title = book?.['Book-Title'] || book?.title || 'Unknown Title';
  const author = book?.['Book-Author'] || book?.author || 'Unknown Author';
  const isbn = normalizeIsbn(book?.ISBN || book?.isbn || '');
  const palette = getPaperwildPalette(title, isbn);
  return {
    title,
    author,
    isbn,
    palette,
    isFallback: true
  };
}

/**
 * Asynchronously resolves the best working cover image for a book,
 * trying dataset URLs, Open Library, and metadata lookups, testing for image viability.
 * @param {Object} book 
 * @param {string} size - 'L' | 'M' | 'S'
 * @returns {Promise<string|null>} Resolved working image URL or null
 */
export async function resolveCover(book, size = 'M') {
  if (!book) return null;
  const olSize = (size || 'M').toUpperCase();
  const isbn = normalizeIsbn(book.ISBN || book.isbn || '');
  const title = book['Book-Title'] || book.title || '';
  const author = book['Book-Author'] || book.author || '';

  const cacheKey = `${isbn || title}_${olSize}`;
  if (MEMORY_CACHE.has(cacheKey)) {
    return MEMORY_CACHE.get(cacheKey);
  }

  const candidates = getCandidateCoverUrls(book, size);

  // Helper to test if image loads and is not a 1x1 blank gif
  const testUrl = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 5 && img.naturalHeight > 5) {
          resolve(true);
        } else {
          FAILED_URLS.add(url);
          resolve(false);
        }
      };
      img.onerror = () => {
        FAILED_URLS.add(url);
        resolve(false);
      };
      img.src = url;
    });
  };

  // 1. Try synchronous candidates in sequence
  for (const url of candidates) {
    if (!FAILED_URLS.has(url)) {
      const ok = await testUrl(url);
      if (ok) {
        recordSuccessfulCover(book, size, url);
        return url;
      }
    }
  }

  // 2. Try metadata lookup if candidates failed
  if (title) {
    const metaUrl = await lookupCoverByMetadata(title, author, size);
    if (metaUrl && !FAILED_URLS.has(metaUrl)) {
      const ok = await testUrl(metaUrl);
      if (ok) {
        recordSuccessfulCover(book, size, metaUrl);
        return metaUrl;
      }
    }
  }

  return null;
}

