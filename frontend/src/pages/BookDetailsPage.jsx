import React, { useState, useEffect } from 'react';
import {
  BookOpen, Bookmark, Sparkles, ArrowLeft,
  Check, Loader2, Calendar, Hash, Building2, User
} from 'lucide-react';

function MetaChip({ icon: Icon, label, value, color }) {
  return (
    <div
      className="flex flex-col gap-1 p-3.5 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${color}`}>
        <Icon className="w-3 h-3" /> {label}
      </span>
      <span className="text-[13px] font-bold text-white leading-snug">{value || '—'}</span>
    </div>
  );
}

function SimilarCard({ book, onClick }) {
  const img = book['Image-URL-M'] || book['Image-URL-L'] || book['Image-URL-S'];
  return (
    <div className="book-card p-3 flex flex-col gap-2 cursor-pointer" onClick={onClick}>
      <div className="h-28 rounded-xl overflow-hidden bg-surface-2 flex items-center justify-center">
        {img && img.startsWith('http') ? (
          <img src={img} alt={book['Book-Title']} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
        ) : (
          <BookOpen className="w-8 h-8 text-slate-700" />
        )}
      </div>
      <div>
        <p className="text-[12px] font-bold text-white truncate-1 leading-snug">{book['Book-Title']}</p>
        <p className="text-[10px] text-slate-500 truncate">{book['Book-Author']}</p>
      </div>
      {book.similarity_score !== undefined && (
        <span className="badge badge-emerald text-[9px]">{(book.similarity_score * 100).toFixed(0)}% match</span>
      )}
    </div>
  );
}

export default function BookDetailsPage({ selectedIsbn, setSelectedIsbn, setActiveTab }) {
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const targetIsbn = selectedIsbn || '0195153448';

  useEffect(() => {
    setLoading(true);
    setBookData(null);
    fetch(`/api/books/${encodeURIComponent(targetIsbn)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setBookData(data);
          const saved = JSON.parse(localStorage.getItem('smartbook_favorites') || '[]');
          setIsSaved(saved.some(s => String(s.ISBN) === String(data.book?.ISBN)));
        }
      })
      .finally(() => setLoading(false));
  }, [targetIsbn]);

  const toggleFavorite = () => {
    if (!bookData?.book) return;
    const saved = JSON.parse(localStorage.getItem('smartbook_favorites') || '[]');
    const updated = isSaved
      ? saved.filter(s => String(s.ISBN) !== String(bookData.book.ISBN))
      : [...saved, bookData.book];
    localStorage.setItem('smartbook_favorites', JSON.stringify(updated));
    setIsSaved(!isSaved);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cover + meta skeleton */}
        <div
          className="rounded-3xl p-8 flex gap-8"
          style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="skeleton w-52 h-72 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-4 py-2">
            <div className="skeleton h-4 rounded w-1/4" />
            <div className="skeleton h-8 rounded w-3/4" />
            <div className="skeleton h-5 rounded w-1/2" />
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const book = bookData?.book;
  if (!book) {
    return (
      <div className="py-24 text-center">
        <BookOpen className="w-12 h-12 mx-auto text-slate-700 mb-4" />
        <p className="text-slate-500">Book not found.</p>
        <button onClick={() => setActiveTab('discover')} className="btn-secondary mt-4">Back to Catalog</button>
      </div>
    );
  }

  const imgUrl = book['Image-URL-L'] || book['Image-URL-M'] || book['Image-URL-S'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ─── Back button ─── */}
      <button
        onClick={() => setActiveTab('discover')}
        className="btn-ghost gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </button>

      {/* ─── Main card ─── */}
      <div
        className="rounded-3xl p-6 md:p-8 reveal"
        style={{
          background: 'rgba(13,17,23,0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        {imgUrl && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url(${imgUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(40px)',
            }}
          />
        )}
        <div className="relative z-10 flex flex-col md:flex-row gap-8">

          {/* Cover */}
          <div className="flex-shrink-0">
            <div
              className="w-48 md:w-52 h-72 rounded-2xl overflow-hidden flex items-center justify-center shadow-book-hover"
              style={{ background: 'rgba(13,17,23,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {imgUrl && imgUrl.startsWith('http') ? (
                <img src={imgUrl} alt={book['Book-Title']} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-16 h-16 text-slate-700" />
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex-1 space-y-5">
            <div>
              <span className="badge badge-purple mb-3">
                <Calendar className="w-2.5 h-2.5" />
                {book['Year-Of-Publication'] || '—'} Published
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mt-2">
                {book['Book-Title']}
              </h1>
              <p className="text-slate-400 mt-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-500" />
                <span>By <strong className="text-white">{book['Book-Author'] || 'Unknown'}</strong></span>
              </p>
            </div>

            {/* Meta chips */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <MetaChip icon={Hash} label="ISBN" value={book['ISBN']} color="text-brand-400" />
              <MetaChip icon={Building2} label="Publisher" value={book['Publisher']} color="text-rose-400" />
              <MetaChip icon={Calendar} label="Year" value={book['Year-Of-Publication']} color="text-amber-400" />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={toggleFavorite}
                className={isSaved ? 'btn-primary' : 'btn-secondary'}
                style={isSaved ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : {}}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {isSaved ? 'Saved to Favorites' : 'Add to Favorites'}
              </button>

              <button
                onClick={() => setActiveTab('recommendations')}
                className="btn-primary"
              >
                <Sparkles className="w-4 h-4" />
                AI Similarity Match
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Similar Books ─── */}
      {bookData?.similar_books?.length > 0 && (
        <div
          className="rounded-3xl p-6 reveal"
          style={{
            background: 'rgba(13,17,23,0.75)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <h3 className="font-bold text-lg text-white flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            More Books Like This
            <span className="badge badge-amber ml-2">{bookData.similar_books.length} results</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {bookData.similar_books.map((rec, idx) => (
              <SimilarCard
                key={idx}
                book={rec}
                onClick={() => setSelectedIsbn(rec['ISBN'] || rec['Book-Title'])}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
