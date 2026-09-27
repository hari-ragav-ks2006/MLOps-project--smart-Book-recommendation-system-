import React, { useState, useEffect } from 'react';
import {
  BookOpen, Bookmark, Sparkles, ArrowLeft, Check, Calendar, Hash,
  Building2, User, Orbit, Box, Layers, Eye, Package, Share2, Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import HoloBookViewer3D from '../components/Three/HoloBookViewer3D';
import TiltCard3D from '../components/UI/TiltCard3D';

import BookCover from '../components/UI/BookCover';

function MetaChip({ icon: Icon, label, value, bg = '#FAED8F' }) {
  return (
    <div
      className="flex flex-col gap-1 p-3.5 rounded-2xl border-2 border-[#141416] shadow-[2px_2px_0px_#141416]"
      style={{ background: bg }}
    >
      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#141416]">
        <Icon className="w-3.5 h-3.5" /> {label}
      </span>
      <span className="text-sm font-bold text-[#141416] truncate font-mono">
        {value || '—'}
      </span>
    </div>
  );
}

function SimilarCard({ book, onClick, onAddToBox, inBox }) {
  return (
    <TiltCard3D
      maxTilt={12}
      scale={1.03}
      onClick={onClick}
      className="card rounded-2xl p-3 flex flex-col gap-2 cursor-pointer h-full bg-white border-2 border-[#141416] shadow-[3px_3px_0px_#141416]"
    >
      <BookCover
        book={book}
        size="M"
        className="h-36 rounded-xl border border-[#141416]/20"
      />
      <div className="flex-1">
        <h4 className="font-editorial font-bold text-xs text-[#141416] truncate-1 leading-snug">
          {book['Book-Title']}
        </h4>
        <p className="text-[10px] text-[#5E5E68] font-bold truncate mt-0.5">
          {book['Book-Author']}
        </p>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-[#141416]/10 mt-auto">
        {book.similarity_score !== undefined ? (
          <span className="badge badge-yellow text-[9px] font-black">
            {(book.similarity_score * 100).toFixed(0)}% match
          </span>
        ) : <span />}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToBox && onAddToBox(book);
          }}
          className={`text-[10px] font-black py-1 px-2.5 rounded-full border border-[#141416] ${inBox ? 'bg-[#D2F5E3]' : 'bg-[#FAED8F] hover:bg-[#F5DE5D]'
            }`}
        >
          {inBox ? 'In Box' : '+ Box'}
        </button>
      </div>
    </TiltCard3D>
  );
}

export default function BookDetailsPage({
  selectedIsbn,
  setSelectedIsbn,
  setActiveTab,
  onAddToBox,
  boxBooks = []
}) {
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d'
  const targetIsbn = selectedIsbn || '0195153448';

  useEffect(() => {
    setLoading(true);
    setBookData(null);
    fetch(`/api/books/${encodeURIComponent(targetIsbn)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setBookData(data);
          const s = JSON.parse(localStorage.getItem('aardvark_shelf') || '[]');
          setIsSaved(s.some(x => String(x.ISBN) === String(data.book?.ISBN)));
        }
      })
      .finally(() => setLoading(false));
  }, [targetIsbn]);

  const toggleFav = (e) => {
    if (!bookData?.book) return;
    const s = JSON.parse(localStorage.getItem('aardvark_shelf') || '[]');
    const isNowSaved = !isSaved;
    const u = isSaved
      ? s.filter(x => String(x.ISBN) !== String(bookData.book.ISBN))
      : [...s, bookData.book];
    localStorage.setItem('aardvark_shelf', JSON.stringify(u));
    setIsSaved(isNowSaved);

    if (isNowSaved) {
      const rect = e.currentTarget.getBoundingClientRect();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
        colors: ['#FAED8F', '#1F3DF5', '#FF4A32', '#141416']
      });
    }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-3xl p-8 bg-white border-2 border-[#141416] shadow-[6px_6px_0px_#141416] flex gap-8">
        <div className="skeleton w-56 h-80 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-4 py-2">
          <div className="skeleton h-5 rounded w-1/4" />
          <div className="skeleton h-10 rounded w-3/4" />
          <div className="skeleton h-6 rounded w-1/2" />
        </div>
      </div>
    </div>
  );

  const book = bookData?.book;
  if (!book) return (
    <div className="py-24 text-center bg-white rounded-3xl border-2 border-[#141416] max-w-md mx-auto p-8 shadow-[6px_6px_0px_#141416]">
      <BookOpen className="w-12 h-12 mx-auto text-[#141416] mb-4" />
      <h3 className="font-editorial font-bold text-xl text-[#141416]">Book Not Found</h3>
      <p className="text-xs text-[#5E5E68] mt-1">This title might not be present in the active catalog.</p>
      <button onClick={() => setActiveTab('discover')} className="btn-primary mt-5 text-xs">
        Back to All Books
      </button>
    </div>
  );

  const inBox = boxBooks.some(b => String(b.ISBN) === String(book['ISBN']));

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top action row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={() => setActiveTab('discover')}
          className="btn-secondary text-xs py-2 px-4 gap-2 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Books</span>
        </button>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 bg-white rounded-full border-2 border-[#141416] shadow-[2px_2px_0px_#141416] gap-1">
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewMode === '3d'
                ? 'bg-[#FAED8F] text-[#141416] shadow-[1px_1px_0px_#141416]'
                : 'text-[#5E5E68] hover:text-[#141416]'
              }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Hologram Inspector</span>
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all ${viewMode === '2d'
                ? 'bg-[#FAED8F] text-[#141416] shadow-[1px_1px_0px_#141416]'
                : 'text-[#5E5E68] hover:text-[#141416]'
              }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>2D Cover</span>
          </button>
        </div>
      </div>

      {/* ─── Main Details Card ─── */}
      {viewMode === '3d' ? (
        <div className="space-y-6">
          <HoloBookViewer3D book={book} />

          {/* Book Info Panel */}
          <div className="rounded-3xl p-6 sm:p-8 bg-white border-2 border-[#141416] shadow-[6px_6px_0px_#141416] space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-yellow text-xs">
                    ✦ Featured Recommendation
                  </span>
                  <span className="badge badge-lilac text-xs">
                    Published {book['Year-Of-Publication'] || '2024'}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-editorial font-extrabold text-[#141416] leading-tight">
                  {book['Book-Title']}
                </h1>
                <p className="text-sm text-[#5E5E68] font-bold mt-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#141416]" />
                  <span>By <strong className="text-[#141416] ml-1">{book['Book-Author'] || 'Unknown Author'}</strong></span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onAddToBox && onAddToBox(book)}
                  className={`btn-primary py-2.5 px-6 text-sm flex items-center gap-2 cursor-pointer ${inBox ? 'bg-[#D2F5E3]' : 'bg-[#FAED8F]'
                    }`}
                >
                  {inBox ? <Check className="w-4 h-4 text-emerald-700" /> : <Bookmark className="w-4 h-4" />}
                  <span>{inBox ? 'Saved to List' : '+ Save to List'}</span>
                </button>

                <button
                  onClick={toggleFav}
                  className="btn-secondary py-2.5 px-5 text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{isSaved ? 'In Reading List' : 'Add to Reading List'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('recommendations')}
                  className="btn-secondary py-2.5 px-5 text-sm bg-[#E3D9FF] hover:bg-[#d8caff] flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Recommendations</span>
                </button>
              </div>
            </div>

            {/* Metadata Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <MetaChip icon={Hash} label="ISBN Number" value={book['ISBN']} bg="#FAED8F" />
              <MetaChip icon={Building2} label="Publisher" value={book['Publisher']} bg="#E3D9FF" />
              <MetaChip icon={Calendar} label="Year Printed" value={book['Year-Of-Publication']} bg="#FFD6CE" />
            </div>
          </div>
        </div>
      ) : (
        /* 2D View */
        <div className="rounded-3xl p-6 sm:p-8 bg-white border-2 border-[#141416] shadow-[6px_6px_0px_#141416]">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <TiltCard3D maxTilt={10}>
                <BookCover
                  book={book}
                  size="L"
                  priority={true}
                  className="w-64 sm:w-72 h-[380px] sm:h-[430px] rounded-2xl border-2 border-[#141416] shadow-[5px_5px_0px_#141416]"
                />
              </TiltCard3D>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <span className="badge badge-yellow text-xs mb-2">
                  ✦ Featured Recommendation
                </span>
                <h1 className="text-3xl sm:text-4xl font-editorial font-extrabold text-[#141416] leading-tight">
                  {book['Book-Title']}
                </h1>
                <p className="text-sm text-[#5E5E68] font-bold mt-2">
                  By <strong className="text-[#141416]">{book['Book-Author'] || 'Unknown'}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onAddToBox && onAddToBox(book)}
                  className={`btn-primary py-2.5 px-6 text-sm flex items-center gap-2 cursor-pointer ${inBox ? 'bg-[#D2F5E3]' : 'bg-[#FAED8F]'
                    }`}
                >
                  {inBox ? <Check className="w-4 h-4 text-emerald-700" /> : <Bookmark className="w-4 h-4" />}
                  <span>{inBox ? 'Saved to List' : '+ Save to List'}</span>
                </button>

                <button
                  onClick={toggleFav}
                  className="btn-secondary py-2.5 px-5 text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{isSaved ? 'In Reading List' : 'Add to Reading List'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('recommendations')}
                  className="btn-secondary py-2.5 px-5 text-sm bg-[#E3D9FF] hover:bg-[#d8caff] flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Recommendations</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <MetaChip icon={Hash} label="ISBN Number" value={book['ISBN']} bg="#FAED8F" />
                <MetaChip icon={Building2} label="Publisher" value={book['Publisher']} bg="#E3D9FF" />
                <MetaChip icon={Calendar} label="Year Printed" value={book['Year-Of-Publication']} bg="#FFD6CE" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Similar Books (AI Recommendations) ─── */}
      {bookData?.similar_books?.length > 0 && (
        <div className="rounded-3xl p-6 sm:p-8 bg-white border-2 border-[#141416] shadow-[6px_6px_0px_#141416]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAED8F] border border-[#141416] text-[10px] font-black uppercase mb-1">
                <Sparkles className="w-3 h-3" />
                <span>AI Vector Recommendations</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-editorial font-extrabold text-[#141416]">
                Similar Books to "{book['Book-Title']}"
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {bookData.similar_books.map((rec, idx) => {
              const recInBox = boxBooks.some(b => String(b.ISBN) === String(rec['ISBN']));
              return (
                <SimilarCard
                  key={idx}
                  book={rec}
                  onClick={() => setSelectedIsbn(rec['ISBN'] || rec['Book-Title'])}
                  onAddToBox={onAddToBox}
                  inBox={recInBox}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
