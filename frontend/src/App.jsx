import React, { useState, useEffect, useCallback } from 'react';
import {
  Home, Search, BookOpen, Sparkles, Users,
  Building2, Bookmark, Info, Activity, ChevronLeft,
  ChevronRight, Zap, Compass, Heart, ArrowRight,
  ShieldCheck, LayoutDashboard, FilePlus
} from 'lucide-react';

import HomePage from './pages/HomePage';
import DiscoverBooksPage from './pages/DiscoverBooksPage';
import BookDetailsPage from './pages/BookDetailsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AuthorsPage from './pages/AuthorsPage';
import PublishersPage from './pages/PublishersPage';
import FavoritesPage from './pages/FavoritesPage';
import AboutPage from './pages/AboutPage';
import BoxModal from './components/Aardvark/BoxModal';
import BookIngestionPage from './pages/BookIngestionPage';
import AdminPipelineDashboard from './pages/AdminPipelineDashboard';

const navItems = [
  { id: 'home',            label: 'Discover',         icon: Home,      tag: 'Featured' },
  { id: 'discover',        label: 'All Books',        icon: BookOpen,  tag: '271K' },
  { id: 'recommendations', label: 'Recommendations',  icon: Sparkles,  tag: 'AI' },
  { id: 'details',         label: 'Book Inspector',   icon: Compass },
  { id: 'authors',         label: 'Authors',          icon: Users },
  { id: 'publishers',      label: 'Publishers',       icon: Building2 },
  { id: 'favorites',       label: 'Reading List',     icon: Bookmark },
  { id: 'about',           label: 'MLOps & Engine',   icon: Activity },
];

const adminNavItems = [
  { id: 'admin-ingestion', label: 'Book Ingestion',   icon: FilePlus,       tag: 'Admin' },
  { id: 'admin-pipeline',  label: 'Pipeline Monitor', icon: LayoutDashboard, tag: 'Admin' },
];

export default function App() {
  const [activeTab, setActiveTab]       = useState('home');
  const [selectedIsbn, setSelectedIsbn] = useState('0195153448');
  const [health, setHealth]             = useState(null);
  const [collapsed, setCollapsed]       = useState(false);
  const [pageKey, setPageKey]           = useState(0);

  // Reading list state
  const [boxBooks, setBoxBooks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smartbook_reading_list') || localStorage.getItem('aardvark_box_books') || '[]');
    } catch {
      return [];
    }
  });
  const [isBoxOpen, setIsBoxOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('smartbook_reading_list', JSON.stringify(boxBooks));
  }, [boxBooks]);

  const addToBox = (book) => {
    if (!book) return;
    if (boxBooks.some(b => String(b.ISBN) === String(book.ISBN))) {
      setIsBoxOpen(true);
      return;
    }
    setBoxBooks(prev => [...prev, book]);
    setIsBoxOpen(true);
  };

  const removeFromBox = (isbn) => {
    setBoxBooks(prev => prev.filter(b => String(b.ISBN) !== String(isbn)));
  };

  const clearBox = () => {
    setBoxBooks([]);
  };

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      setHealth(res.ok ? await res.json() : { status: 'offline' });
    } catch {
      setHealth({ status: 'offline' });
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, 15000);
    return () => clearInterval(id);
  }, [fetchHealth]);

  const navigate = (tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPageKey(k => k + 1);
  };

  const isHealthy = health?.status === 'healthy';
  const activeNav = navItems.find(n => n.id === activeTab);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FCFAF6] text-[#141416]">

      {/* ── Top Announcement Banner ── */}
      <div className="flex-shrink-0 bg-[#FAED8F] border-b-2 border-[#141416] py-1.5 px-4 text-center text-xs font-black text-[#141416] flex items-center justify-center gap-2 select-none">
        <Sparkles className="w-3.5 h-3.5 text-[#141416] hidden sm:inline" />
        <span>271,000+ BOOKS INDEXED · TF-IDF VECTOR EMBEDDINGS & REAL-TIME RECOMMENDATIONS</span>
        <button
          onClick={() => setIsBoxOpen(true)}
          className="ml-2 underline font-extrabold hover:text-[#1F3DF5] cursor-pointer inline-flex items-center gap-1"
        >
          <span>My Reading List ({boxBooks.length})</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ══════════ SIDEBAR ══════════ */}
        <aside
          className={`relative z-20 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 bg-[#FCFAF6] border-r-2 border-[#141416] ${
            collapsed ? 'w-[76px]' : 'w-[240px]'
          }`}
        >
          {/* Logo / Brand Header */}
          <div className={`flex items-center gap-3 px-4 pt-5 pb-4 ${collapsed ? 'justify-center' : ''}`}>
            <div
              onClick={() => navigate('home')}
              className="w-10 h-10 rounded-2xl bg-[#FAED8F] border-2 border-[#141416] shadow-[2px_2px_0px_#141416] flex items-center justify-center cursor-pointer flex-shrink-0 font-editorial font-black text-xl hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
              title="SmartBook AI"
            >
              SB
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="font-editorial font-black text-base leading-none text-[#141416] tracking-tight">
                  SMARTBOOK
                </h1>
                <p className="text-[10px] font-black text-[#5E5E68] tracking-widest mt-0.5 uppercase">
                  AI Recommender
                </p>
              </div>
            )}
          </div>

          {/* Quick "Reading List" Widget in Sidebar */}
          {!collapsed && (
            <div className="px-3 mb-3">
              <button
                onClick={() => setIsBoxOpen(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-[#FAED8F] border-2 border-[#141416] shadow-[3px_3px_0px_#141416] hover:bg-[#F5DE5D] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#141416]" />
                  <span className="font-editorial font-bold text-xs text-[#141416]">
                    Reading List
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#141416] text-[#FAED8F] text-[10px] font-black">
                  {boxBooks.length} saved
                </span>
              </button>
            </div>
          )}

          {/* Divider line */}
          <div className="mx-3 mb-3 h-0.5 bg-[#141416]/10" />

          {/* Navigation Items */}
          <nav className="flex-1 px-2.5 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 nav-icon" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {item.tag && !collapsed && (
                    <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white border border-[#141416]">
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin section divider */}
            <div className="pt-2 pb-1">
              <div className="h-px bg-[#141416]/10 mx-1" />
              {!collapsed && (
                <p className="text-[9px] font-black text-[#5E5E68] uppercase tracking-widest px-2 pt-2">Admin</p>
              )}
            </div>

            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 nav-icon" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {item.tag && !collapsed && (
                    <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#FAED8F] border border-[#141416]">
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Collapse sidebar button */}
          <div className="px-3 pb-3 mt-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`btn-ghost w-full justify-between text-xs font-bold text-[#5E5E68] border border-gray-200 ${collapsed ? 'justify-center' : ''}`}
            >
              {!collapsed && <span>Collapse Sidebar</span>}
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Machine Learning / API Status */}
          {!collapsed && (
            <div className="px-3 pb-4">
              <div className="px-3 py-2 rounded-2xl bg-white border-1.5 border-[#141416] shadow-[2px_2px_0px_#141416] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-[#141416] leading-tight">
                    ML ENGINE {isHealthy ? 'LIVE' : 'SYNCING'}
                  </p>
                  <p className="text-[9px] text-[#5E5E68] truncate">271,360 Books</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ══════════ MAIN VIEWPORT ══════════ */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#FCFAF6] relative z-10">

          {/* Top Bar */}
          <header className="flex-shrink-0 flex items-center justify-between px-6 h-[64px] bg-[#FCFAF6] border-b-2 border-[#141416]">
            <div className="flex items-center gap-3">
              {activeNav && (
                <div className="flex items-center gap-2">
                  <activeNav.icon className="w-5 h-5 text-[#141416]" />
                  <h2 className="font-editorial font-black text-lg text-[#141416] tracking-tight">
                    {activeNav.label}
                  </h2>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('discover')}
                className="btn-secondary text-xs py-2 px-4 gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Catalog</span>
              </button>

              <button
                onClick={() => setIsBoxOpen(true)}
                className="btn-primary text-xs py-2 px-4 gap-2 bg-[#FAED8F] cursor-pointer"
              >
                <Bookmark className="w-4 h-4" />
                <span>Reading List ({boxBooks.length})</span>
              </button>
            </div>
          </header>

          {/* Main Scrollable Canvas */}
          <main key={pageKey} className="flex-1 overflow-y-auto page-enter p-6 sm:p-8">
            {activeTab === 'home' && (
              <HomePage
                setActiveTab={navigate}
                setSelectedIsbn={setSelectedIsbn}
                onAddToBox={addToBox}
                boxBooks={boxBooks}
              />
            )}
            {activeTab === 'discover' && (
              <DiscoverBooksPage
                setActiveTab={navigate}
                setSelectedIsbn={setSelectedIsbn}
                onAddToBox={addToBox}
                boxBooks={boxBooks}
              />
            )}
            {activeTab === 'details' && (
              <BookDetailsPage
                selectedIsbn={selectedIsbn}
                setSelectedIsbn={setSelectedIsbn}
                setActiveTab={navigate}
                onAddToBox={addToBox}
                boxBooks={boxBooks}
              />
            )}
            {activeTab === 'recommendations' && (
              <RecommendationsPage
                setSelectedIsbn={setSelectedIsbn}
                setActiveTab={navigate}
                onAddToBox={addToBox}
                boxBooks={boxBooks}
              />
            )}
            {activeTab === 'authors' && (
              <AuthorsPage
                setSelectedIsbn={setSelectedIsbn}
                setActiveTab={navigate}
                onAddToBox={addToBox}
              />
            )}
            {activeTab === 'publishers' && (
              <PublishersPage
                setSelectedIsbn={setSelectedIsbn}
                setActiveTab={navigate}
                onAddToBox={addToBox}
              />
            )}
            {activeTab === 'favorites' && (
              <FavoritesPage
                setActiveTab={navigate}
                setSelectedIsbn={setSelectedIsbn}
                onAddToBox={addToBox}
              />
            )}
            {activeTab === 'about' && <AboutPage />}
            {activeTab === 'admin-ingestion' && <BookIngestionPage />}
            {activeTab === 'admin-pipeline' && <AdminPipelineDashboard />}
          </main>
        </div>
      </div>

      {/* Floating Reading List Drawer Modal */}
      <BoxModal
        isOpen={isBoxOpen}
        onClose={() => setIsBoxOpen(false)}
        boxBooks={boxBooks}
        onRemoveBook={removeFromBox}
        onClearBox={clearBox}
        onViewDetails={(isbn) => {
          setSelectedIsbn(isbn);
          setActiveTab('details');
          setIsBoxOpen(false);
        }}
        onExploreRecommendations={(isbn) => {
          setSelectedIsbn(isbn);
          setActiveTab('recommendations');
          setIsBoxOpen(false);
        }}
      />
    </div>
  );
}
