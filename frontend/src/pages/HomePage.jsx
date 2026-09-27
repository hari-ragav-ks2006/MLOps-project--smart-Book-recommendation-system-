import React, { useState, useEffect } from 'react';
import {
  BookOpen, Sparkles, Search, TrendingUp, Users, Building2,
  ArrowRight, Cpu, Zap, Bookmark, Check, HelpCircle, ChevronDown, ChevronUp, Star, Heart
} from 'lucide-react';
import Hero3DBookCanvas from '../components/Three/Hero3DBookCanvas';
import TiltCard3D from '../components/UI/TiltCard3D';
import BookCover from '../components/UI/BookCover';
import RecentCatalogActivity from '../components/RecentCatalogActivity';

function SkeletonCard() {
  return (
    <div className="card p-4 flex flex-col gap-3 bg-white border-2 border-[#141416]">
      <div className="skeleton rounded-xl h-52" />
      <div className="space-y-2">
        <div className="skeleton h-4 rounded w-4/5" />
        <div className="skeleton h-3 rounded w-3/5" />
      </div>
    </div>
  );
}

function FeaturedBookCard({ book, index, onClick, onAddToBox, inBox }) {
  const genres = ['Literary Fiction', 'Sci-Fi & Fantasy', 'Mystery & Thriller', 'Historical Fiction', 'Contemporary', 'Non-Fiction'];
  const genre = genres[index % genres.length];

  return (
    <TiltCard3D
      maxTilt={10}
      scale={1.02}
      className="card rounded-3xl p-4 flex flex-col gap-3 bg-white border-2 border-[#141416] shadow-[4px_4px_0px_#141416] hover:shadow-[6px_6px_0px_#141416] transition-all h-full"
    >
      {/* Cover with 3D unboxing feel */}
      <div
        onClick={onClick}
        className="relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer border-2 border-[#141416] group bg-[#F4EFE6] shadow-[2px_2px_0px_#141416]"
      >
        <BookCover book={book} size="L" priority={index < 3} className="w-full h-full" />

        {/* Genre Pill Tag */}
        <span className="absolute top-2.5 left-2.5 badge badge-yellow text-[10px] shadow-[2px_2px_0px_#141416] z-10">
          {genre}
        </span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#141416]/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20">
          <span className="btn-primary text-xs py-1.5 px-4 shadow-[2px_2px_0px_#141416]">
            Inspect in 3D →
          </span>
        </div>
      </div>

      {/* Book details */}
      <div className="flex-1 flex flex-col justify-between pt-1">
        <div>
          <h4
            onClick={onClick}
            className="font-editorial font-bold text-base text-[#141416] truncate-2 leading-tight cursor-pointer hover:underline"
          >
            {book['Book-Title']}
          </h4>
          <p className="text-xs text-[#5E5E68] font-bold mt-1 truncate">
            By {book['Book-Author'] || 'Unknown Author'}
          </p>
        </div>

        {/* Action button: Save */}
        <div className="pt-3 mt-3 border-t-2 border-[#141416]/10 flex items-center justify-between gap-2">
          <span className="text-[10px] font-black text-[#5E5E68] uppercase tracking-wider font-mono">
            {book['Year-Of-Publication'] || '2024'}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToBox(book);
            }}
            className={`text-xs font-black py-1.5 px-3.5 rounded-full border-1.5 border-[#141416] shadow-[2px_2px_0px_#141416] transition-transform active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer ${inBox
                ? 'bg-[#D2F5E3] text-[#141416]'
                : 'bg-[#FAED8F] hover:bg-[#F5DE5D] text-[#141416]'
              }`}
          >
            {inBox ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>+ Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </TiltCard3D>
  );
}

const FAQS = [
  {
    q: "How does SmartBook AI generate recommendations?",
    a: "Our machine learning pipeline uses TF-IDF vector embeddings trained over 271,000+ indexed books and 105,000+ authors. When you enter a book title or author, the engine computes real-time Cosine Similarity in high-dimensional vector space to find the closest thematic and stylistic matches."
  },
  {
    q: "What dataset powers SmartBook AI?",
    a: "The engine indexes over 271,379 unique books, 105,283 authors, and millions of community ratings. Data preprocessing, schema validation, and model artifacts are tracked with DVC (Data Version Control) for reproducibility."
  },
  {
    q: "How does the interactive 3D Hardcover Inspector work?",
    a: "Every book can be inspected using our Three.js 3D viewer. It dynamically composites realistic book jackets, spine typography, and page textures onto physical 3D geometry with dynamic lighting, orbital drag rotation, and foil reflections."
  },
  {
    q: "How does SmartBook AI resolve high-resolution book covers?",
    a: "We implement an automatic multi-tier cover cascade: high-res Open Library covers via ISBN and cover IDs, metadata-based lookup APIs, and dynamic generated typographic fallback covers when images are unavailable."
  }
];

export default function HomePage({ setActiveTab, setSelectedIsbn, onAddToBox, boxBooks = [] }) {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    fetch('/api/books?limit=6')
      .then(r => r.json())
      .then(d => { setFeaturedBooks(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-16">

      {/* ─── HERO SECTION ─── */}
      <div className="rounded-3xl bg-[#FAED8F] border-2 border-[#141416] p-8 sm:p-12 shadow-[6px_6px_0px_#141416] relative overflow-hidden">
        {/* Subtle halftone dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #141416 1.5px, transparent 1.5px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border-2 border-[#141416] shadow-[2px_2px_0px_#141416] text-xs font-black text-[#141416] tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#141416]" />
              <span>SmartBook AI · MLOps Recommendation Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-editorial font-extrabold text-[#141416] leading-[1.05] tracking-tight">
              Find books matched to your taste with{' '}
              <span className="underline decoration-[#FF4A32] decoration-4">Machine Learning.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#141416]/85 font-medium leading-relaxed max-w-xl">
              Powered by TF-IDF vector embeddings and cosine similarity across 271,000+ indexed books and 105,000+ authors. Discover your next favorite read in milliseconds with interactive 3D hardcover inspection.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveTab('discover')}
                className="btn-primary py-3 px-7 text-sm bg-white hover:bg-[#F3EFE6] text-[#141416] border-2 border-[#141416] shadow-[4px_4px_0px_#141416] cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Explore All 271K Books</span>
              </button>

              <button
                onClick={() => setActiveTab('recommendations')}
                className="btn-secondary py-3 px-6 text-sm bg-[#1F3DF5] hover:bg-[#1831c9] text-white border-2 border-[#141416] shadow-[4px_4px_0px_#141416] cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#FAED8F]" />
                <span>AI Recommendations</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['271,000+ Titles', 'TF-IDF Embeddings', 'Cosine Similarity', '3D Hardcover Inspector', 'Instant Inference'].map(t => (
                <span key={t} className="badge bg-white text-[11px] font-black border-1.5 border-[#141416]">
                  ✦ {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right Hero: Real Three.js 3D Hardcover with Silk Ribbon */}
          <div className="lg:col-span-5 h-[400px] sm:h-[450px] rounded-3xl bg-white border-2 border-[#141416] shadow-[6px_6px_0px_#141416] overflow-hidden relative">
            <Hero3DBookCanvas
              title="THE FELLOWSHIP"
              author="J.R.R. Tolkien"
            />
          </div>
        </div>
      </div>

      {/* ─── CURATED SPOTLIGHT BOOKS ─── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3D9FF] border border-[#141416] text-[11px] font-black text-[#141416] uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Algorithmic Spotlight</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-editorial font-extrabold text-[#141416] tracking-tight">
              Featured Picks & Top-Rated Titles
            </h2>
            <p className="text-sm text-[#5E5E68] font-medium mt-1">
              Curated highlights from our dataset of over 271,000 indexed titles.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('discover')}
            className="btn-ghost text-xs font-black text-[#141416] gap-1 hover:underline cursor-pointer"
          >
            <span>View All 271,000 Titles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredBooks.map((book, idx) => {
              const inBox = boxBooks.some(b => String(b.ISBN) === String(book['ISBN']));
              return (
                <FeaturedBookCard
                  key={idx}
                  book={book}
                  index={idx}
                  onClick={() => {
                    setSelectedIsbn && setSelectedIsbn(book['ISBN'] || book['Book-Title']);
                    setActiveTab('details');
                  }}
                  onAddToBox={onAddToBox}
                  inBox={inBox}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 4-STEP HOW IT WORKS ─── */}
      <div className="rounded-3xl bg-white border-2 border-[#141416] p-8 sm:p-10 shadow-[6px_6px_0px_#141416]">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="badge badge-yellow text-xs uppercase font-black mb-2">
            The Recommendation Pipeline
          </span>
          <h3 className="text-2xl sm:text-3xl font-editorial font-extrabold text-[#141416] tracking-tight">
            How SmartBook AI Works
          </h3>
          <p className="text-sm text-[#5E5E68] mt-2 font-medium">
            Production-grade machine learning pipeline connecting 271,000+ books with real-time vector inference.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Ingest & Version',
              desc: 'Clean and validate 271K titles, 105K authors, and user ratings tracked with DVC and automated CI/CD pipelines.',
              bg: '#FAED8F',
              tag: 'DVC & MLOps'
            },
            {
              step: '02',
              title: 'TF-IDF Vectors',
              desc: 'Transform book metadata, author styles, and genres into high-dimensional numerical feature embeddings.',
              bg: '#E3D9FF',
              tag: 'Vector Space'
            },
            {
              step: '03',
              title: 'Cosine Distance',
              desc: 'Calculate instantaneous similarity distances to retrieve the mathematically closest book recommendations.',
              bg: '#FFD6CE',
              tag: 'Real-Time Inference'
            },
            {
              step: '04',
              title: 'Multi-Tier Covers',
              desc: 'Dynamic resolution cascading through Open Library IDs, ISBNs, and title APIs for crystal-clear book art.',
              bg: '#D2F5E3',
              tag: 'Cover Resolution'
            }
          ].map((item, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border-2 border-[#141416] shadow-[3px_3px_0px_#141416] flex flex-col justify-between"
              style={{ background: item.bg }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#141416] text-white font-mono">
                    {item.step}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#141416]/70">
                    {item.tag}
                  </span>
                </div>
                <h4 className="font-editorial font-bold text-lg text-[#141416] mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-[#141416]/80 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── GENRES WE LOVE TICKER ─── */}
      <div className="py-6 px-4 bg-[#F4EFE6] rounded-3xl border-2 border-[#141416] shadow-[4px_4px_0px_#141416]">
        <div className="text-center mb-4">
          <p className="text-xs font-black uppercase tracking-widest text-[#5E5E68]">
            Browse books by popular literary genres
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          {[
            'Horror & Thrillers', 'Dark Fantasy', 'Literary Fiction', 'Gothic Fiction',
            'Cyberpunk & Sci-Fi', 'Magical Realism', 'Mystery', 'Contemporary', 'Memoir'
          ].map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveTab('discover')}
              className="px-4 py-2 rounded-full bg-white border-1.5 border-[#141416] shadow-[2px_2px_0px_#141416] text-xs font-black text-[#141416] hover:bg-[#FAED8F] transition-all cursor-pointer"
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* ─── RECENT CATALOG ACTIVITY ─── */}
      <RecentCatalogActivity onViewBook={(isbn) => {
        if (setActiveTab) setActiveTab('details');
        if (setSelectedIsbn) setSelectedIsbn(isbn);
      }} />

      {/* ─── FAQ ACCORDION ─── */}
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="text-center mb-6">
          <span className="badge badge-lilac text-xs uppercase font-black mb-2">Technical Overview</span>
          <h3 className="text-2xl sm:text-3xl font-editorial font-extrabold text-[#141416]">
            Frequently Asked Questions
          </h3>
        </div>

        {FAQS.map((faq, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white border-2 border-[#141416] shadow-[3px_3px_0px_#141416] overflow-hidden"
          >
            <button
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="w-full p-5 flex items-center justify-between text-left font-editorial font-bold text-base text-[#141416] hover:bg-gray-50 cursor-pointer"
            >
              <span>{faq.q}</span>
              {openFaq === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {openFaq === idx && (
              <div className="px-5 pb-5 text-sm text-[#5E5E68] font-medium leading-relaxed border-t border-gray-100 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
