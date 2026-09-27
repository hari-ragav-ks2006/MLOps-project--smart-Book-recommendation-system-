import React, { useState, useEffect } from 'react';
import { Building2, Search, BookOpen, ArrowRight, Loader2, LayoutGrid } from 'lucide-react';
import BookCover from '../components/UI/BookCover';

function PublisherCard({ publisher, index, onClick }) {
  const colors = [
    ['#fff1f2','rgba(225,29,72,0.15)','#e11d48'],['#f5f3ff','rgba(124,58,237,0.15)','#7c3aed'],
    ['#ecfdf5','rgba(5,150,105,0.15)','#059669'],['#fffbeb','rgba(217,119,6,0.15)','#d97706'],
    ['#eff6ff','rgba(37,99,235,0.15)','#2563eb'],['#f0fdfa','rgba(13,148,136,0.15)','#0d9488'],
  ];
  const [bg, border, text] = colors[index % colors.length];
  return (
    <div className="card rounded-2xl p-5 cursor-pointer reveal" style={{ animationDelay:`${Math.min(index,12)*0.04}s` }} onClick={()=>onClick(publisher.publisher)}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Building2 className="w-5 h-5" style={{ color: text }}/>
        </div>
        <span className="badge text-[10px]" style={{ background: bg, color: text, border:`1px solid ${border}` }}>
          {publisher.book_count?.toLocaleString()} titles
        </span>
      </div>
      <h4 className="font-bold text-[13px] text-gray-900 truncate-2 leading-snug">{publisher.publisher}</h4>
    </div>
  );
}

export default function PublishersPage({ setSelectedIsbn, setActiveTab }) {
  const [publishers, setPublishers]   = useState([]);
  const [selectedPub, setSelectedPub] = useState(null);
  const [pubBooks, setPubBooks]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [search, setSearch]           = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/publishers?limit=60').then(r=>r.json()).then(d=>{ setPublishers(d.publishers||[]); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  const fetchPubBooks = async (name) => {
    setBooksLoading(true); setSelectedPub(name); setPubBooks([]);
    try { const res = await fetch(`/api/publishers?publisher_name=${encodeURIComponent(name)}`); if(res.ok){const d=await res.json();setPubBooks(d.books||[]);} }
    finally { setBooksLoading(false); }
  };

  const filtered = search ? publishers.filter(p => p.publisher?.toLowerCase().includes(search.toLowerCase())) : publishers;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-3xl p-6 md:p-8 reveal shine-card" style={{ background:'linear-gradient(135deg,#ffffff 60%,#fff1f2)', border:'1px solid rgba(225,29,72,0.1)', boxShadow:'0 4px 24px rgba(225,29,72,0.06)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'#fff1f2' }}>
            <Building2 className="w-5 h-5 text-rose-600"/>
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-gray-900">Publishers</h2>
            <p className="text-gray-400 text-xs">16,000+ publishing houses indexed in Book Finder</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 bg-white" style={{ border:'1.5px solid rgba(0,0,0,0.09)', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
          <Search className="w-4 h-4 text-gray-300"/>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search publishers..." className="flex-1 bg-transparent text-gray-900 text-sm placeholder-gray-300 outline-none"/>
          {loading && <Loader2 className="w-4 h-4 text-gray-300 animate-spin"/>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">{Array.from({length:8}).map((_,i)=>(
              <div key={i} className="card rounded-2xl p-5"><div className="skeleton w-10 h-10 rounded-xl mb-3"/><div className="skeleton h-3.5 rounded w-3/4 mb-2"/><div className="skeleton h-3 rounded w-1/2"/></div>
            ))}</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((pub,idx) => <PublisherCard key={idx} publisher={pub} index={idx} onClick={fetchPubBooks}/>)}
            </div>
          )}
        </div>

        <div>
          {selectedPub ? (
            <div className="rounded-3xl p-5 sticky top-4" style={{ background:'#ffffff', border:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 className="font-bold text-[14px] text-gray-900 mb-4 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-rose-500"/>
                <span className="truncate">{selectedPub}</span>
              </h3>
              {booksLoading ? (
                <div className="space-y-3">{Array.from({length:4}).map((_,i)=>(
                  <div key={i} className="flex gap-3 items-center"><div className="skeleton w-10 h-14 rounded-lg flex-shrink-0"/><div className="flex-1 space-y-1.5"><div className="skeleton h-3 rounded w-4/5"/><div className="skeleton h-2.5 rounded w-2/3"/></div></div>
                ))}</div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {pubBooks.map((book,i) => {
                    return (
                      <div key={i} className="flex gap-3 items-center cursor-pointer group" onClick={()=>{ setSelectedIsbn&&setSelectedIsbn(book['ISBN']||book['Book-Title']); setActiveTab&&setActiveTab('details'); }}>
                        <BookCover book={book} size="S" className="w-10 h-14 rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-gray-900 truncate group-hover:text-rose-600 transition-colors">{book['Book-Title']}</p>
                          <p className="text-[10px] text-gray-400">{book['Book-Author']||'—'}</p>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-200 group-hover:text-rose-500 transition-colors flex-shrink-0"/>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl p-8 text-center" style={{ background:'#ffffff', border:'1px dashed rgba(0,0,0,0.09)' }}>
              <Building2 className="w-10 h-10 mx-auto text-gray-200 mb-3"/>
              <p className="text-gray-400 text-sm font-medium">Select a publisher</p>
              <p className="text-gray-300 text-xs mt-1">to browse their catalog</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
