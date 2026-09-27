import React, { useState, useEffect } from 'react';
import { Bookmark, BookOpen, Trash2, ArrowRight, Sparkles, Heart } from 'lucide-react';
import BookCover from '../components/UI/BookCover';

export default function FavoritesPage({ setActiveTab, setSelectedIsbn }) {
  const [shelf, setShelf] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('smartbook_reading_list') || localStorage.getItem('smartbook_favorites') || localStorage.getItem('aardvark_shelf') || '[]');
    setShelf(saved);
  }, []);

  const remove = (isbn) => {
    const updated = shelf.filter(f => String(f.ISBN) !== String(isbn));
    setShelf(updated);
    localStorage.setItem('smartbook_reading_list', JSON.stringify(updated));
    localStorage.setItem('smartbook_favorites', JSON.stringify(updated));
  };

  const clearAll = () => {
    setShelf([]);
    localStorage.removeItem('smartbook_reading_list');
    localStorage.removeItem('smartbook_favorites');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">

      {/* Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white border-2 border-[#141416] shadow-[6px_6px_0px_#141416] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAED8F] border border-[#141416] text-[10px] font-black uppercase mb-1">
            <Bookmark className="w-3 h-3" />
            <span>Personal Collection</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-editorial font-extrabold text-[#141416]">
            My Reading List
          </h2>
          <p className="text-xs text-[#5E5E68] font-medium mt-1">
            {shelf.length} {shelf.length === 1 ? 'title' : 'titles'} saved across your exploration sessions.
          </p>
        </div>

        {shelf.length > 0 && (
          <button
            onClick={clearAll}
            className="btn-secondary text-xs py-2 px-4 gap-1.5 text-rose-600 border-rose-300 hover:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear List</span>
          </button>
        )}
      </div>

      {/* Empty List State */}
      {shelf.length === 0 ? (
        <div className="rounded-3xl py-20 text-center bg-white border-2 border-[#141416] shadow-[6px_6px_0px_#141416] max-w-lg mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-[#FAED8F] border-2 border-[#141416] mx-auto flex items-center justify-center mb-4 shadow-[3px_3px_0px_#141416]">
            <Heart className="w-8 h-8 text-[#141416]" />
          </div>
          <h3 className="font-editorial font-bold text-xl text-[#141416] mb-2">
            Your Reading List is Empty
          </h3>
          <p className="text-[#5E5E68] text-xs font-medium mb-6 leading-relaxed">
            Browse the 271,000+ title catalog or generate AI recommendations to build your personal reading list!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => setActiveTab('discover')} className="btn-primary text-xs py-2.5 px-6 cursor-pointer">
              <BookOpen className="w-4 h-4" />
              <span>Browse All Books</span>
            </button>
            <button onClick={() => setActiveTab('recommendations')} className="btn-secondary text-xs py-2.5 px-6 bg-[#E3D9FF] cursor-pointer">
              <Sparkles className="w-4 h-4" />
              <span>Get AI Recommendations</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {shelf.map((book, idx) => {
            return (
              <div
                key={idx}
                className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-white border-2 border-[#141416] shadow-[4px_4px_0px_#141416] hover:shadow-[6px_6px_0px_#141416] transition-all"
              >
                {/* Thumbnail */}
                <div className="w-16 h-22 rounded-xl overflow-hidden flex-shrink-0 border border-[#141416]">
                  <BookCover book={book} size="M" className="w-full h-full" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-editorial font-bold text-base text-[#141416] truncate leading-snug">
                    {book['Book-Title']}
                  </h4>
                  <p className="text-xs text-[#5E5E68] font-bold mt-0.5">
                    {book['Book-Author'] || 'Unknown Author'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge badge-yellow text-[10px]">
                      {book['Year-Of-Publication'] || '2024'}
                    </span>
                    <span className="text-[10px] text-[#5E5E68] font-mono">
                      {book['Publisher'] || ''}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedIsbn && setSelectedIsbn(book['ISBN'] || book['Book-Title']);
                      setActiveTab && setActiveTab('details');
                    }}
                    className="btn-primary text-xs py-2 px-4 gap-1.5 shadow-[2px_2px_0px_#141416] cursor-pointer"
                  >
                    <span>Inspect 3D</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => remove(book.ISBN)}
                    className="p-2 rounded-full border border-gray-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                    title="Remove from List"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
