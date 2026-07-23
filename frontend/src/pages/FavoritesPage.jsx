import React, { useState, useEffect } from 'react';
import { Bookmark, BookOpen, Trash2, ArrowRight, Star, Heart } from 'lucide-react';

export default function FavoritesPage({ setActiveTab, setSelectedIsbn }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('smartbook_favorites') || '[]');
    setFavorites(saved);
  }, []);

  const remove = (isbn) => {
    const updated = favorites.filter(f => String(f.ISBN) !== String(isbn));
    setFavorites(updated);
    localStorage.setItem('smartbook_favorites', JSON.stringify(updated));
  };

  const clearAll = () => {
    setFavorites([]);
    localStorage.removeItem('smartbook_favorites');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div
        className="rounded-3xl p-6 md:p-8 reveal"
        style={{
          background: 'rgba(13,17,23,0.8)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(236,72,153,0.12)' }}>
              <Bookmark className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-white">Favorites</h2>
              <p className="text-slate-500 text-xs">{favorites.length} books saved to your reading list</p>
            </div>
          </div>
          {favorites.length > 0 && (
            <button onClick={clearAll} className="btn-ghost text-rose-400 hover:text-rose-300 gap-1.5">
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {favorites.length === 0 ? (
        <div
          className="rounded-3xl py-24 text-center reveal"
          style={{ background: 'rgba(13,17,23,0.5)', border: '1px dashed rgba(255,255,255,0.07)' }}
        >
          <Heart className="w-14 h-14 mx-auto text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No favorites yet</h3>
          <p className="text-slate-500 text-sm mb-5">Start exploring books and save the ones you love</p>
          <button onClick={() => setActiveTab('discover')} className="btn-primary">
            <BookOpen className="w-4 h-4" />
            Explore Books
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((book, idx) => {
            const img = book['Image-URL-M'] || book['Image-URL-L'] || book['Image-URL-S'];
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl p-4 flex items-center gap-4 reveal"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Thumbnail */}
                <div
                  className="w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  {img && img.startsWith('http') ? (
                    <img src={img} alt={book['Book-Title']} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
                  ) : (
                    <BookOpen className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[14px] text-white truncate">{book['Book-Title']}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{book['Book-Author'] || 'Unknown'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge badge-purple">{book['Year-Of-Publication'] || '—'}</span>
                    <span className="text-[10px] text-slate-600">{book['Publisher'] || ''}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedIsbn && setSelectedIsbn(book['ISBN'] || book['Book-Title']);
                      setActiveTab && setActiveTab('details');
                    }}
                    className="btn-secondary text-xs py-1.5 px-3 gap-1"
                    style={{ borderRadius: '10px' }}
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => remove(book.ISBN)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
