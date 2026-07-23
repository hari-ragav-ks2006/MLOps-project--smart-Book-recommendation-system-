import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Search, TrendingUp, Users, Building2, ArrowRight, Cpu, Zap } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="book-card p-4 flex flex-col gap-3">
      <div className="skeleton rounded-xl h-44" />
      <div className="space-y-2">
        <div className="skeleton h-3.5 rounded w-4/5" />
        <div className="skeleton h-3 rounded w-3/5" />
      </div>
    </div>
  );
}

// Smart cover: tries dataset URL → Open Library by ISBN → gradient fallback
function BookCover({ imgUrl, isbn, title, className = '' }) {
  const sources = [];
  if (imgUrl && imgUrl.startsWith('http')) sources.push(imgUrl);
  if (isbn) {
    sources.push(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`);
    sources.push(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`);
  }
  const [srcIndex, setSrcIndex] = useState(0);
  const [loaded, setLoaded]     = useState(false);
  const currentSrc              = sources[srcIndex];
  const exhausted               = srcIndex >= sources.length;
  const gradients = [
    'linear-gradient(135deg,#7c3aed,#4f46e5)','linear-gradient(135deg,#059669,#0d9488)',
    'linear-gradient(135deg,#d97706,#dc2626)','linear-gradient(135deg,#e11d48,#9333ea)',
    'linear-gradient(135deg,#0284c7,#7c3aed)','linear-gradient(135deg,#f59e0b,#ef4444)',
  ];
  const gradient = gradients[(title?.charCodeAt(0) || 0) % gradients.length];
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3" style={{ background: gradient }}>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-extrabold text-sm">
          {(title||'?').slice(0,2).toUpperCase()}
        </div>
        <p className="text-white text-[10px] font-bold text-center line-clamp-2 leading-snug" style={{ textShadow:'0 1px 3px rgba(0,0,0,0.3)' }}>{title}</p>
        <div className="absolute top-0 left-2 bottom-0 w-0.5 bg-white/10 rounded"/>
      </div>
      {!exhausted && (
        <img key={currentSrc} src={currentSrc} alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded?'opacity-100':'opacity-0'}`}
          onLoad={()=>setLoaded(true)}
          onError={()=>{ setLoaded(false); setSrcIndex(i=>i+1); }}/>
      )}
    </div>
  );
}

function BookCard({ book, index, onClick }) {
  const imgUrl = book['Image-URL-M'] || book['Image-URL-L'] || book['Image-URL-S'];
  const isbn   = book['ISBN'];
  return (
    <div
      className="book-card p-3 flex flex-col gap-3 reveal"
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={onClick}
    >
      <div className="relative rounded-xl overflow-hidden h-44">
        <BookCover imgUrl={imgUrl} isbn={isbn} title={book['Book-Title']} className="w-full h-full" />
        <span className="absolute top-2 right-2 badge badge-purple text-[9px]">{book['Year-Of-Publication'] || '—'}</span>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="btn-primary text-xs py-1.5 px-3 gap-1" style={{ borderRadius: '8px' }}>
            <ArrowRight className="w-3 h-3" /> View
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 flex-1">
        <h4 className="font-bold text-[13px] text-gray-900 truncate-1 leading-snug">{book['Book-Title']}</h4>
        <p className="text-[11px] text-gray-400 truncate">{book['Book-Author'] || 'Unknown'}</p>
      </div>
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
        <span className="text-[10px] font-mono text-gray-300">{(book['ISBN'] || '').slice(0, 10)}</span>
        <span className="text-[11px] font-semibold text-violet-600 flex items-center gap-0.5">Details <ArrowRight className="w-3 h-3" /></span>
      </div>
    </div>
  );
}

const STATS = [
  { value: '271,360', label: 'Books Indexed',    icon: BookOpen,  bg: '#f5f3ff', icon_c: 'text-violet-600',  border: 'rgba(124,58,237,0.12)', delay: 'reveal-delay-1' },
  { value: '100K+',   label: 'Unique Authors',   icon: Users,     bg: '#ecfdf5', icon_c: 'text-emerald-600', border: 'rgba(5,150,105,0.12)',  delay: 'reveal-delay-2' },
  { value: '16,000+', label: 'Publishers',       icon: Building2, bg: '#fff1f2', icon_c: 'text-rose-600',    border: 'rgba(225,29,72,0.12)',  delay: 'reveal-delay-3' },
  { value: '98.0%',   label: 'Precision@5',      icon: Cpu,       bg: '#fffbeb', icon_c: 'text-amber-600',   border: 'rgba(217,119,6,0.12)',  delay: 'reveal-delay-4' },
];

export default function HomePage({ setActiveTab, setSelectedIsbn }) {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/books?limit=8')
      .then(r => r.json())
      .then(d => { setFeaturedBooks(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ─── Hero ─── */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 md:p-12 reveal shine-card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 60%, #faf5ff)',
          border: '1px solid rgba(124,58,237,0.1)',
          boxShadow: '0 8px 40px rgba(124,58,237,0.08), 0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* Decorative background shapes */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent)' }} />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.2), transparent)' }} />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, #7c3aed 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-5 badge badge-purple">
            <Sparkles className="w-3 h-3" />
            AI-Powered Book Discovery
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.08] mb-4">
            Find Your Next
            <br />
            <span className="gradient-text">Favorite Book</span>
          </h1>

          <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
            Explore 271,000+ titles powered by TF-IDF content-based filtering and cosine similarity matching.
          </p>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => setActiveTab('discover')} className="btn-primary">
              <Search className="w-4 h-4" /> Explore 271K Books
            </button>
            <button onClick={() => setActiveTab('recommendations')} className="btn-secondary">
              <Sparkles className="w-4 h-4 text-violet-500" /> Get AI Recommendations <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-5">
            {['TF-IDF Engine', 'Cosine Similarity', 'Real-time ML', 'DVC Versioning', 'MLflow Tracking'].map(t => (
              <span key={t} className="badge badge-indigo text-[10px]">
                <Zap className="w-2.5 h-2.5" /> {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`stat-card ${s.delay}`} style={{ border: `1px solid ${s.border}` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">{s.label}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                  <Icon className={`w-5 h-5 ${s.icon_c}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Featured Books ─── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              Featured Catalog
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Trending titles from the Book Finder dataset</p>
          </div>
          <button onClick={() => setActiveTab('discover')} className="btn-ghost text-[13px] gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredBooks.map((book, idx) => (
              <BookCard key={idx} book={book} index={idx} onClick={() => {
                setSelectedIsbn && setSelectedIsbn(book['ISBN'] || book['Book-Title']);
                setActiveTab('details');
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
