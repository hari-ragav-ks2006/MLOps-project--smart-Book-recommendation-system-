import React, { useState } from 'react';
import { Bookmark, X, Sparkles, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import TiltCard3D from '../UI/TiltCard3D';
import BookCover from '../UI/BookCover';

export default function BoxModal({
  isOpen,
  onClose,
  boxBooks = [],
  onRemoveBook,
  onClearBox,
  onViewDetails
}) {
  const [celebrated, setCelebrated] = useState(false);

  if (!isOpen) return null;

  const handleCelebrate = (e) => {
    setCelebrated(true);
    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      },
      colors: ['#FAED8F', '#1F3DF5', '#FF4A32', '#E3D9FF', '#141416']
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#FCFAF6] border-2 border-[#141416] p-6 sm:p-8 shadow-[8px_8px_0px_#141416] max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white border-1.5 border-[#141416] flex items-center justify-center shadow-[2px_2px_0px_#141416] hover:bg-gray-100 transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
        >
          <X className="w-4 h-4 text-[#141416]" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAED8F] border-1.5 border-[#141416] shadow-[2px_2px_0px_#141416] text-xs font-black uppercase tracking-wider mb-2">
            <Bookmark className="w-3.5 h-3.5" />
            <span>SmartBook Reading List ({boxBooks.length})</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-editorial font-extrabold text-[#141416] tracking-tight">
            My Reading List
          </h2>
          <p className="text-sm text-[#5E5E68] mt-1 font-medium">
            Saved books discovered through SmartBook AI recommendations and catalog search.
          </p>
        </div>

        {/* Books Grid */}
        {boxBooks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#141416]/30 p-8 text-center bg-[#F3EFE6]/40 mb-6">
            <Bookmark className="w-8 h-8 text-[#92929D] mx-auto mb-2" />
            <p className="font-editorial font-bold text-base text-[#141416]">No Books Saved Yet</p>
            <p className="text-xs text-[#5E5E68] mt-1">Click "+ Save" on any book card to add it to your personal list.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {boxBooks.map((b, idx) => {
              return (
                <TiltCard3D
                  key={b.ISBN || idx}
                  maxTilt={10}
                  className="relative rounded-2xl bg-white border-2 border-[#141416] p-3 shadow-[3px_3px_0px_#141416] flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 rounded-xl overflow-hidden mb-2 border border-[#141416]/20">
                      <BookCover book={b} size="M" className="w-full h-full" />
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#141416] text-white text-[10px] font-black">
                        #{idx + 1}
                      </span>
                      <button
                        onClick={() => onRemoveBook(b.ISBN)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-white/90 border border-[#141416] text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Remove from Reading List"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <h4 className="font-editorial font-bold text-xs text-[#141416] truncate-2 leading-tight">
                      {b['Book-Title']}
                    </h4>
                    <p className="text-[10px] text-[#5E5E68] truncate mt-0.5 font-bold">
                      {b['Book-Author']}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#141416] bg-[#FAED8F] px-2 py-0.5 rounded-full border border-[#141416]">
                      {b['Year-Of-Publication'] || 'Book'}
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onViewDetails && onViewDetails(b);
                      }}
                      className="text-[9px] text-[#1F3DF5] font-black hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>3D Inspect</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </TiltCard3D>
              );
            })}
          </div>
        )}

        {/* Celebrated Banner */}
        {celebrated && (
          <div className="mb-6 p-4 rounded-2xl bg-[#E3D9FF] border-2 border-[#141416] shadow-[3px_3px_0px_#141416] animate-slide-up flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#141416] flex-shrink-0 animate-bounce" />
            <div>
              <p className="font-editorial font-bold text-sm text-[#141416]">
                📚 Reading List Ready!
              </p>
              <p className="text-xs text-[#141416]/80">
                You've curated {boxBooks.length} books. You can inspect any of them in 3D or generate AI recommendations from them!
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-[#141416]/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5E5E68]">
            <Sparkles className="w-3.5 h-3.5 text-[#1F3DF5]" />
            <span>Synced across your browser session</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {boxBooks.length > 0 && (
              <button
                onClick={onClearBox}
                className="btn-secondary text-xs py-2 px-4 cursor-pointer"
              >
                Clear List
              </button>
            )}
            <button
              onClick={handleCelebrate}
              disabled={boxBooks.length === 0}
              className="btn-primary flex-1 sm:flex-initial text-xs py-2 px-6 gap-2 disabled:opacity-50 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Confirm List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
