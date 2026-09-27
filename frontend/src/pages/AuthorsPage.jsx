import React, { useState, useEffect } from 'react';
import { Users, Search, BookOpen, ArrowRight, Loader2 } from 'lucide-react';
import BookCover from '../components/UI/BookCover';

function AuthorCard({ author, index, onClick }) {
  const initials = (author.author || '?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const colors = [
    ['#f5f3ff','#7c3aed'],['#ecfdf5','#059669'],['#fffbeb','#d97706'],
    ['#fff1f2','#e11d48'],['#eff6ff','#2563eb'],['#f0fdfa','#0d9488'],
  ];
  const [bg, text] = colors[index % colors.length];

  return (
    <div className="card rounded-2xl p-4 flex items-center gap-4 cursor-pointer reveal" style={{ animationDelay: `${Math.min(index,10)*0.04}s` }} onClick={() => onClick(author.author)}>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 font-extrabold text-sm" style={{ background: bg, color: text }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[13px] text-gray-900 truncate">{author.author}</h4>
        <p className="text-xs text-gray-400 mt-0.5">{author.book_count?.toLocaleString()} books</p>
        {author.sample_title && <p className="text-[10px] text-gray-300 truncate mt-0.5">"{author.sample_title}"</p>}
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </div>
  );
}

export default function AuthorsPage({ setSelectedIsbn, setActiveTab }) {
  const [authors, setAuthors]           = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authorBooks, setAuthorBooks]   = useState([]);
  const [loading, setLoading]           = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [search, setSearch]             = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/authors?limit=60').then(r=>r.json()).then(d=>{ setAuthors(d.authors||[]); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  const fetchAuthorBooks = async (name) => {
    setBooksLoading(true); setSelectedAuthor(name); setAuthorBooks([]);
    try {
      const res = await fetch(`/api/authors?author_name=${encodeURIComponent(name)}`);
      if (res.ok) { const d = await res.json(); setAuthorBooks(d.books||[]); }
    } finally { setBooksLoading(false); }
  };

  const filtered = search ? authors.filter(a => a.author?.toLowerCase().includes(search.toLowerCase())) : authors;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-3xl p-6 md:p-8 reveal shine-card" style={{ background: 'linear-gradient(135deg,#ffffff 60%,#ecfdf5)', border:'1px solid rgba(5,150,105,0.1)', boxShadow:'0 4px 24px rgba(5,150,105,0.06)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'#ecfdf5' }}>
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-gray-900">Authors</h2>
            <p className="text-gray-400 text-xs">100,000+ unique authors indexed in Book Finder</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 bg-white" style={{ border:'1.5px solid rgba(0,0,0,0.09)', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <Search className="w-4 h-4 text-gray-300" />
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search authors..."
            className="flex-1 bg-transparent text-gray-900 text-sm placeholder-gray-300 outline-none" />
          {loading && <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          {loading ? Array.from({length:8}).map((_,i)=>(
            <div key={i} className="card rounded-2xl p-4 flex items-center gap-4">
              <div className="skeleton w-11 h-11 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-2"><div className="skeleton h-3.5 rounded w-1/2"/><div className="skeleton h-3 rounded w-1/3"/></div>
            </div>
          )) : filtered.map((author,idx) => <AuthorCard key={idx} author={author} index={idx} onClick={fetchAuthorBooks} />)}
        </div>

        <div>
          {selectedAuthor ? (
            <div className="rounded-3xl p-5 sticky top-4" style={{ background:'#ffffff', border:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 className="font-bold text-[14px] text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-500" />
                <span className="truncate">{selectedAuthor}</span>
              </h3>
              {booksLoading ? (
                <div className="space-y-3">{Array.from({length:4}).map((_,i)=>(
                  <div key={i} className="flex gap-3 items-center">
                    <div className="skeleton w-10 h-14 rounded-lg flex-shrink-0"/>
                    <div className="flex-1 space-y-1.5"><div className="skeleton h-3 rounded w-4/5"/><div className="skeleton h-2.5 rounded w-3/5"/></div>
                  </div>
                ))}</div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {authorBooks.map((book,i) => {
                    return (
                      <div key={i} className="flex gap-3 items-center cursor-pointer group" onClick={()=>{ setSelectedIsbn&&setSelectedIsbn(book['ISBN']||book['Book-Title']); setActiveTab&&setActiveTab('details'); }}>
                        <BookCover book={book} size="S" className="w-10 h-14 rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-gray-900 truncate group-hover:text-violet-600 transition-colors">{book['Book-Title']}</p>
                          <p className="text-[10px] text-gray-400">{book['Year-Of-Publication']||'—'}</p>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-200 group-hover:text-violet-500 transition-colors flex-shrink-0"/>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl p-8 text-center" style={{ background:'#ffffff', border:'1px dashed rgba(0,0,0,0.09)' }}>
              <Users className="w-10 h-10 mx-auto text-gray-200 mb-3"/>
              <p className="text-gray-400 text-sm font-medium">Select an author</p>
              <p className="text-gray-300 text-xs mt-1">to browse their catalog</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
