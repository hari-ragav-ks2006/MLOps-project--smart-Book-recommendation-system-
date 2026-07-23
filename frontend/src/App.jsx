import React, { useState, useEffect, useCallback } from 'react';
import {
  Home, Search, BookOpen, Sparkles, Users,
  Building2, Bookmark, Info, Activity, ChevronLeft,
  ChevronRight, Zap
} from 'lucide-react';

import HomePage          from './pages/HomePage';
import DiscoverBooksPage from './pages/DiscoverBooksPage';
import BookDetailsPage   from './pages/BookDetailsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AuthorsPage       from './pages/AuthorsPage';
import PublishersPage    from './pages/PublishersPage';
import FavoritesPage     from './pages/FavoritesPage';
import AboutPage         from './pages/AboutPage';

// ─── Analytics REMOVED ───
const navItems = [
  { id: 'home',            label: 'Home',            icon: Home,      color: 'text-violet-600' },
  { id: 'discover',        label: 'Discover',         icon: Search,    color: 'text-indigo-600' },
  { id: 'details',         label: 'Book Details',     icon: BookOpen,  color: 'text-sky-600' },
  { id: 'recommendations', label: 'Recommendations',  icon: Sparkles,  color: 'text-amber-600' },
  { id: 'authors',         label: 'Authors',          icon: Users,     color: 'text-emerald-600' },
  { id: 'publishers',      label: 'Publishers',       icon: Building2, color: 'text-rose-600' },
  { id: 'favorites',       label: 'Favorites',        icon: Bookmark,  color: 'text-pink-600' },
  { id: 'about',           label: 'About',            icon: Info,      color: 'text-teal-600' },
];

export default function App() {
  const [activeTab, setActiveTab]       = useState('home');
  const [selectedIsbn, setSelectedIsbn] = useState('0195153448');
  const [health, setHealth]             = useState(null);
  const [collapsed, setCollapsed]       = useState(false);
  const [pageKey, setPageKey]           = useState(0);

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
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#f8f7f4' }}>

      {/* ── Background orbs (very subtle on light) ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* ══════════ SIDEBAR ══════════ */}
      <aside
        className={`relative z-20 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex-shrink-0 ${
          collapsed ? 'w-[68px]' : 'w-[228px]'
        }`}
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(0,0,0,0.07)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
        }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 pt-5 pb-4 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative flex-shrink-0 float-anim">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}
            >
              <BookOpen className="w-5 h-5 text-white" />
            </div>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-[15px] text-gray-900 leading-none tracking-tight">
                BOOK <span className="gradient-text">FINDER</span>
              </h1>
              <p className="text-[10px] text-violet-500 font-bold uppercase tracking-widest mt-0.5">
                AI Discovery
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-3 mb-3" style={{ height: '1px', background: 'rgba(0,0,0,0.06)' }} />

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
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
                <Icon
                  className={`w-[17px] h-[17px] flex-shrink-0 nav-icon transition-colors duration-200 ${
                    isActive ? item.color : 'text-gray-400'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {isActive && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-2 pb-3 mt-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`btn-ghost w-full text-gray-400 hover:text-gray-600 ${collapsed ? 'justify-center' : 'justify-between'}`}
            style={{ padding: '0.5rem 0.625rem', borderRadius: '10px' }}
          >
            {!collapsed && <span className="text-[11px] font-semibold">Collapse</span>}
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Health status */}
        {!collapsed && (
          <div className="px-3 pb-4">
            <div
              className="px-3 py-2.5 rounded-xl flex items-center gap-2.5"
              style={{ background: '#f8f7f4', border: '1px solid rgba(0,0,0,0.07)' }}
            >
              <div className={`dot-pulse w-2 h-2 rounded-full flex-shrink-0 ${isHealthy ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <div className="overflow-hidden flex-1">
                <p className="text-[11px] font-bold text-gray-700 truncate">
                  API {isHealthy ? 'Online' : 'Connecting'}
                </p>
                <p className="text-[10px] text-gray-400 truncate">271,360 books indexed</p>
              </div>
              <Activity className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        )}
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10">

        {/* Header */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-6 h-[58px]"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center gap-2.5">
            {activeNav && (
              <>
                <activeNav.icon className={`w-5 h-5 ${activeNav.color}`} />
                <h2 className="font-bold text-[15px] text-gray-900 tracking-tight">{activeNav.label}</h2>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => navigate('recommendations')} className="btn-primary text-xs py-1.5 px-3.5 gap-1.5" style={{ borderRadius: '10px' }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Picks</span>
            </button>
            <button onClick={() => navigate('discover')} className="btn-secondary text-xs py-1.5 px-3 gap-1.5" style={{ borderRadius: '10px' }}>
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
            <div className={`badge ${isHealthy ? 'badge-emerald' : 'badge-amber'}`}>
              <Zap className="w-2.5 h-2.5" />
              <span>{isHealthy ? 'Live' : 'Connecting'}</span>
            </div>
          </div>
        </header>

        {/* Page area */}
        <main key={pageKey} className="flex-1 overflow-y-auto page-enter" style={{ padding: '1.5rem' }}>
          {activeTab === 'home'            && <HomePage setActiveTab={navigate} setSelectedIsbn={setSelectedIsbn} />}
          {activeTab === 'discover'        && <DiscoverBooksPage setActiveTab={navigate} setSelectedIsbn={setSelectedIsbn} />}
          {activeTab === 'details'         && <BookDetailsPage selectedIsbn={selectedIsbn} setSelectedIsbn={setSelectedIsbn} setActiveTab={navigate} />}
          {activeTab === 'recommendations' && <RecommendationsPage />}
          {activeTab === 'authors'         && <AuthorsPage setSelectedIsbn={setSelectedIsbn} setActiveTab={navigate} />}
          {activeTab === 'publishers'      && <PublishersPage setSelectedIsbn={setSelectedIsbn} setActiveTab={navigate} />}
          {activeTab === 'favorites'       && <FavoritesPage setActiveTab={navigate} setSelectedIsbn={setSelectedIsbn} />}
          {activeTab === 'about'           && <AboutPage />}
        </main>
      </div>
    </div>
  );
}
