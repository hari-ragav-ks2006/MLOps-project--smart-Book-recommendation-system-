/**
 * RecentCatalogActivity.jsx
 * Shows newly added and recently updated books on the main site.
 * Fetches from /api/admin/recent-activity.
 */
import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Edit2, RefreshCw, ArrowRight, Clock } from 'lucide-react';

// ── Cover image with Open Library fallback ────
function BookCover({ book, size = 'sm' }) {
  const [src, setSrc] = useState(() => {
    const isbn = book?.ISBN || '';
    if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
    return book?.['Image-URL-M'] || book?.['Image-URL-L'] || book?.['Image-URL-S'] || '';
  });
  const [failed, setFailed] = useState(false);

  const w = size === 'sm' ? 'w-12 h-16' : 'w-16 h-22';

  if (failed || !src) {
    const title = book?.['Book-Title'] || '?';
    const initials = title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    return (
      <div className={`${w} flex-shrink-0 rounded-lg bg-[#FAED8F] border-2 border-[#141416] shadow-[2px_2px_0px_#141416] flex items-center justify-center overflow-hidden`}>
        <span className="text-sm font-editorial font-black text-[#141416]">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={book?.['Book-Title'] || ''}
      className={`${w} flex-shrink-0 rounded-lg border-2 border-[#141416] shadow-[2px_2px_0px_#141416] object-cover object-top bg-[#F4EFE6]`}
      onError={() => {
        const m = book?.['Image-URL-M'];
        const l = book?.['Image-URL-L'];
        if (m && src !== m) { setSrc(m); return; }
        if (l && src !== l) { setSrc(l); return; }
        setFailed(true);
      }}
    />
  );
}

// ── Activity Card ─────────────────────────────
function ActivityCard({ entry, onViewBook }) {
  const isNew = entry.operation === 'NEW';
  const book = entry.book || {};

  const formatDate = (ts) => {
    try {
      const d = new Date(ts);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
    } catch { return ts; }
  };

  return (
    <div className={`group relative flex items-start gap-3 p-4 rounded-2xl border-2 border-[#141416] shadow-[3px_3px_0px_#141416] hover:shadow-[5px_5px_0px_#141416] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer ${
      isNew ? 'bg-[#D2F5E3]' : 'bg-[#FFF8E1]'
    }`}
      onClick={() => book?.ISBN && onViewBook?.(book.ISBN)}
    >
      {/* Operation badge */}
      <div className={`absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
        isNew ? 'bg-[#FAED8F] border-[#141416] text-[#141416]' : 'bg-[#E3D9FF] border-[#141416] text-[#141416]'
      }`}>
        {isNew ? <Plus className="w-2.5 h-2.5" /> : <Edit2 className="w-2.5 h-2.5" />}
        {isNew ? 'New' : 'Updated'}
      </div>

      <BookCover book={book} size="sm" />

      <div className="flex-1 min-w-0 pr-10">
        <p className="text-sm font-editorial font-extrabold text-[#141416] leading-tight line-clamp-2">
          {book['Book-Title'] || 'Untitled'}
        </p>
        <p className="text-xs text-[#5E5E68] mt-0.5 truncate">{book['Book-Author'] || 'Unknown Author'}</p>
        {book['Year-Of-Publication'] && (
          <p className="text-[10px] text-[#5E5E68] mt-0.5">{book['Year-Of-Publication']}</p>
        )}

        {/* Changed fields (for updates) */}
        {!isNew && entry.changed_fields?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {entry.changed_fields.slice(0, 3).map((f, i) => (
              <span key={i} className="text-[9px] font-black bg-[#141416] text-[#FAED8F] px-1.5 py-0.5 rounded">
                {f}
              </span>
            ))}
            {entry.changed_fields.length > 3 && (
              <span className="text-[9px] font-bold text-[#5E5E68]">+{entry.changed_fields.length - 3} more</span>
            )}
          </div>
        )}

        <div className="mt-2 flex items-center gap-1 text-[10px] text-[#5E5E68]">
          <Clock className="w-2.5 h-2.5" />
          {formatDate(entry.timestamp)}
        </div>
      </div>
    </div>
  );
}

// ── Main Section ──────────────────────────────
export default function RecentCatalogActivity({ onViewBook }) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'new' | 'updated'
  const [refreshKey, setRefreshKey] = useState(0);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await window.fetch('/api/admin/recent-activity?limit=20');
      const data = await res.json();
      setActivity(data.activity || []);
    } catch {
      setActivity([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [refreshKey]);

  const filtered = activity.filter(a => {
    if (filter === 'new') return a.operation === 'NEW';
    if (filter === 'updated') return a.operation === 'UPDATED';
    return true;
  });

  if (!loading && activity.length === 0) return null; // hide if nothing

  return (
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FAED8F] border-2 border-[#141416] shadow-[2px_2px_0px_#141416] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#141416]" />
          </div>
          <div>
            <h2 className="font-editorial font-extrabold text-xl text-[#141416] tracking-tight leading-none">
              Recent Catalog Activity
            </h2>
            <p className="text-xs text-[#5E5E68] mt-0.5">Newly added & recently updated books</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex bg-[#F4EFE6] border-2 border-[#141416] rounded-full p-0.5 gap-0.5">
            {[['all', 'All'], ['new', 'New'], ['updated', 'Updated']].map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)}
                className={`text-[10px] font-black px-3 py-1 rounded-full transition-all cursor-pointer ${
                  filter === id ? 'bg-[#FAED8F] text-[#141416] shadow-[1px_1px_0px_#141416]' : 'text-[#5E5E68] hover:text-[#141416]'
                }`}>{label}</button>
            ))}
          </div>
          <button onClick={() => setRefreshKey(k => k + 1)}
            className="w-8 h-8 rounded-full bg-white border-2 border-[#141416] shadow-[2px_2px_0px_#141416] flex items-center justify-center hover:bg-[#F4EFE6] transition-colors cursor-pointer"
            title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 text-[#141416] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && activity.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 text-[#5E5E68] animate-spin" />
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="rounded-2xl bg-[#F4EFE6] border-2 border-[#141416] p-8 text-center">
          <p className="text-sm font-bold text-[#5E5E68]">No {filter !== 'all' ? filter + ' ' : ''}activity yet.</p>
          <p className="text-xs text-[#5E5E68] mt-1">Books added via the Admin → Ingestion Center will appear here.</p>
        </div>
      )}

      {/* Activity grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.slice(0, 8).map((entry) => (
          <ActivityCard key={entry.id} entry={entry} onViewBook={onViewBook} />
        ))}
      </div>

      {filtered.length > 8 && (
        <div className="text-center">
          <span className="text-xs text-[#5E5E68] font-bold">
            Showing 8 of {filtered.length} entries
          </span>
        </div>
      )}
    </section>
  );
}
