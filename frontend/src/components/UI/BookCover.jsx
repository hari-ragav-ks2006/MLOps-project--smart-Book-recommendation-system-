import React, { useState, useEffect, useRef } from 'react';
import {
  getCandidateCoverUrls,
  lookupCoverByMetadata,
  recordSuccessfulCover,
  recordFailedCoverUrl,
  getPaperwildPalette
} from '../../services/coverService';

function PatternBackground({ pattern, accent = '#FAED8F' }) {
  if (pattern === 'sunburst') {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 200 300">
        <circle cx="100" cy="150" r="80" stroke="currentColor" strokeWidth="1" fill="none" />
        <circle cx="100" cy="150" r="50" stroke="currentColor" strokeWidth="1" fill="none" />
        <line x1="100" y1="20" x2="100" y2="280" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="20" y1="150" x2="180" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      </svg>
    );
  }
  if (pattern === 'concentric') {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 200 300">
        <circle cx="100" cy="150" r="30" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="100" cy="150" r="60" stroke="currentColor" strokeWidth="1" fill="none" />
        <circle cx="100" cy="150" r="90" stroke="currentColor" strokeWidth="0.75" fill="none" />
      </svg>
    );
  }
  if (pattern === 'arch') {
    return (
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 200 300">
        <path d="M 40,240 L 40,110 A 60,60 0 0,1 160,110 L 160,240" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M 60,240 L 60,120 A 40,40 0 0,1 140,120 L 140,240" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
    );
  }
  // Default diamond lattice
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" viewBox="0 0 200 300">
      <polygon points="100,50 160,150 100,250 40,150" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <polygon points="100,80 140,150 100,220 60,150" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

/**
 * PaperwildFallbackCover — High-end editorial clothbound fallback
 * Used only when all remote cover sources are genuinely unavailable.
 */
function PaperwildFallbackCover({ title = 'Untitled Book', author = 'Unknown Author', isbn = '', className = '' }) {
  const pal = getPaperwildPalette(title, isbn);
  const initials = (title || 'Aa').slice(0, 2).toUpperCase();

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between p-4 overflow-hidden select-none border-2 border-[#141416] ${className}`}
      style={{
        background: pal.bg,
        color: pal.ink,
      }}
    >
      {/* Dynamic Abstract Geometry */}
      <PatternBackground pattern={pal.pattern} accent={pal.accent} />

      {/* Clothbound Paper Texture & Spine Crease */}
      <div className="absolute top-0 left-0 bottom-0 w-3 bg-black/20 border-r border-black/30 pointer-events-none" />
      <div className="absolute top-0 left-3 bottom-0 w-1 bg-white/10 pointer-events-none" />

      {/* Top Header Label */}
      <div className="relative z-10 flex items-center justify-between text-[9px] font-black uppercase tracking-widest pl-2">
        <span className="opacity-75">PAPERWILD ARCHIVE</span>
        <span className="opacity-90 font-mono text-[10px]">ED. {isbn ? isbn.slice(-4) : '2024'}</span>
      </div>

      {/* Center Typographic Art Stamp */}
      <div className="relative z-10 my-auto text-center pl-2">
        <div
          className="w-12 h-12 mx-auto rounded-2xl border-2 border-[#141416] flex items-center justify-center font-editorial font-black text-xl mb-3 shadow-[2px_2px_0px_#141416]"
          style={{ background: pal.paper, color: pal.ink }}
        >
          {initials}
        </div>

        <h3
          className="font-editorial font-black text-xs sm:text-sm leading-snug line-clamp-3 mb-1.5 px-1"
          style={{ textShadow: '0 1px 1px rgba(0,0,0,0.1)' }}
        >
          {title}
        </h3>

        <div className="w-8 h-0.5 mx-auto my-1.5 opacity-40 bg-current" />

        <p className="text-[10px] font-bold opacity-80 truncate px-1">
          {author || 'Literary Edition'}
        </p>

        <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[8px] font-mono tracking-wider opacity-60 uppercase bg-black/10">
          Curated Edition
        </span>
      </div>

      {/* Bottom Barcode / ISBN stamp */}
      <div className="relative z-10 flex items-end justify-between text-[8px] font-mono font-bold opacity-75 pl-2 pt-2 border-t border-black/15">
        <div className="flex items-center gap-0.5">
          <div className="w-0.5 h-3 bg-current" />
          <div className="w-1 h-3 bg-current" />
          <div className="w-0.5 h-3 bg-current" />
          <div className="w-1.5 h-3 bg-current" />
          <div className="w-0.5 h-3 bg-current" />
        </div>
        <span className="truncate max-w-[80px]">
          {isbn ? `ISBN ${isbn.slice(0, 8)}` : 'CLOTHBOUND'}
        </span>
      </div>
    </div>
  );
}

/**
 * BookCover — Universal high-resolution cover component with automated fallback chain
 * 
 * Sources Priority:
 * 1. Normalized dataset cover URL
 * 2. Open Library Large / Medium via Normalized ISBN (?default=false)
 * 3. Open Library alternative size
 * 4. Open Library Metadata Search via Title + Author
 * 5. Google Books API high-res image
 * 6. Handcrafted PAPERWILD editorial fallback
 */
export default function BookCover({
  book,
  isbn: propIsbn,
  title: propTitle,
  author: propAuthor,
  imgUrl: propImgUrl,
  size = 'M', // 'L' | 'M' | 'S'
  className = '',
  style = {},
  priority = false, // eager load for hero
  alt
}) {
  // Normalize book properties
  const title = propTitle || book?.['Book-Title'] || book?.title || 'Unknown Title';
  const author = propAuthor || book?.['Book-Author'] || book?.author || '';
  const isbn = propIsbn || book?.ISBN || book?.isbn || '';
  const initialBook = book || {
    'Book-Title': title,
    'Book-Author': author,
    ISBN: isbn,
    'Image-URL-L': propImgUrl,
    'Image-URL-M': propImgUrl,
    'Image-URL-S': propImgUrl,
  };

  const [candidates, setCandidates] = useState([]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [metadataSearched, setMetadataSearched] = useState(false);

  // Initialize candidates when book/size changes
  useEffect(() => {
    const list = getCandidateCoverUrls(initialBook, size);
    setCandidates(list);
    setCandidateIndex(0);
    setLoaded(false);
    setExhausted(list.length === 0);
    setMetadataSearched(false);
  }, [isbn, title, size]);

  const currentSrc = candidates[candidateIndex];

  // If candidate sources are exhausted, trigger metadata search
  useEffect(() => {
    if (exhausted && !metadataSearched) {
      setMetadataSearched(true);
      lookupCoverByMetadata(title, author, size).then(foundUrl => {
        if (foundUrl) {
          setCandidates(prev => [...prev, foundUrl]);
          setCandidateIndex(candidates.length);
          setExhausted(false);
        }
      });
    }
  }, [exhausted, metadataSearched, title, author, size, candidates.length]);

  const handleNextSource = () => {
    if (currentSrc) {
      recordFailedCoverUrl(currentSrc);
    }
    setLoaded(false);
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex(i => i + 1);
    } else {
      setExhausted(true);
    }
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    // CRITICAL: Reject 1x1 or 2x2 blank/transparent images returned by Open Library/Amazon
    if (img.naturalWidth <= 5 || img.naturalHeight <= 5) {
      handleNextSource();
      return;
    }
    setLoaded(true);
    if (currentSrc) {
      recordSuccessfulCover(initialBook, size, currentSrc);
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#F3EFE6] select-none ${className}`}
      style={style}
    >
      {/* 1. Underlying PAPERWILD editorial fallback (displayed while loading or if all sources fail) */}
      <PaperwildFallbackCover
        title={title}
        author={author}
        isbn={isbn}
        className={`absolute inset-0 transition-opacity duration-300 ${loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      />

      {/* 2. Real High-Res Cover Image */}
      {!exhausted && currentSrc && (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={alt || title}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleNextSource}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}
