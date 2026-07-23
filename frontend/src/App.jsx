import React, { useState, useEffect, useCallback } from 'react';
import {
  Home, Search, BookOpen, Sparkles, Users,
  Building2, BarChart3, Bookmark, Info,
  Activity, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';

import HomePage from './pages/HomePage';
import DiscoverBooksPage from './pages/DiscoverBooksPage';
import BookDetailsPage from './pages/BookDetailsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AuthorsPage from './pages/AuthorsPage';
import PublishersPage from './pages/PublishersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FavoritesPage from './pages/FavoritesPage';
import AboutPage from './pages/AboutPage';

const navItems = [
  { id: 'home',            label: 'Home',            icon: Home,      color: 'text-purple-400' },
  { id: 'discover',        label: 'Discover',         icon: Search,    color: 'text-indigo-400' },
  { id: 'details',         label: 'Book Details',     icon: BookOpen,  color: 'text-sky-400' },
  { id: 'recommendations', label: 'Recommendations',  icon: Sparkles,  color: 'text-amber-400' },
  { id: 'authors',         label: 'Authors',          icon: Users,     color: 'text-emerald-400' },
  { id: 'publishers',      label: 'Publishers',       icon: Building2, color: 'text-rose-400' },
  { id: 'analytics',       label: 'Analytics',        icon: BarChart3, color: 'text-orange-400' },
  { id: 'favorites',       label: 'Favorites',        icon: Bookmark,  color: 'text-pink-400' },
  { id: 'about',           label: 'About',            icon: Info,      color: 'text-teal-400' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [prevTab, setPrevTab] = useState(null);
  const [selectedIsbn, setSelectedIsbn] = useState('0195153448');
  const [health, setHealth] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [pageKey, setPageKey] = useState(0);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const data = res.ok ? await res.json() : { status: 'offline' };
      setHealth(data);
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
    setPrevTab(activeTab);
    setActiveTab(tab);
    setPageKey(k => k + 1);
  };

  const activeNav = navItems.find(n => n.id === activeTab);
  const isHealthy = health?.status === 'healthy';

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>

      {/* ─── Animated background orbs ─── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* ─── Sidebar ─── */}
      <aside
        className={`relative z-20 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          collapsed ? 'w-[70px]' : 'w-[240px]'
        }`}
        style={{
          background: 'rgba(8,11,20,0.85)',
          backdropFilter: 'blur(32px)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 pt-6 pb-4 transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-purple flex items-center justify-center shadow-glow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-bg dot-pulse" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-[15px] text-white leading-none tracking-tight">SmartBook AI</h1>
              <p className="text-[10px] text-brand-400 font-bold uppercase tracking-widest mt-0.5">
                Premium Platform
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 mb-4" style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

        {/* Nav Items */}
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
                  className={`w-[18px] h-[18px] flex-shrink-0 nav-icon transition-colors duration-200 ${
                    isActive ? item.color : 'text-slate-500'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <span className={`ml-auto w-1.5 h-1.5 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-2 pb-3 mt-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`btn-ghost w-full text-slate-500 hover:text-slate-300 ${collapsed ? 'justify-center' : 'justify-between'}`}
            style={{ padding: '0.5rem 0.625rem', borderRadius: '10px' }}
          >
            {!collapsed && <span className="text-[11px] font-semibold">Collapse</span>}
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Health footer */}
        {!collapsed && (
          <div className="px-3 pb-4">
            <div
              className="px-3 py-2.5 rounded-xl flex items-center gap-2.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className={`dot-pulse w-2 h-2 rounded-full flex-shrink-0 ${isHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <div className="overflow-hidden flex-1">
                <p className="text-[11px] font-bold text-slate-300 truncate">
                  API {isHealthy ? 'Online' : 'Connecting'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">271,360 books indexed</p>
              </div>
              <Activity className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            </div>
          </div>
        )}
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10">

        {/* Top Header */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-6 h-[60px]"
          style={{
            background: 'rgba(8,11,20,0.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center gap-3">
            {activeNav && (
              <>
                <activeNav.icon className={`w-5 h-5 ${activeNav.color}`} />
                <h2 className="font-bold text-[15px] text-white tracking-tight">{activeNav.label}</h2>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quick actions */}
            <button
              onClick={() => navigate('recommendations')}
              className="btn-primary text-xs py-2 px-3.5 gap-1.5"
              style={{ borderRadius: '10px' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Picks</span>
            </button>

            <button
              onClick={() => navigate('discover')}
              className="btn-secondary text-xs py-2 px-3 gap-1.5"
              style={{ borderRadius: '10px' }}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>

            {/* Status pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
                isHealthy
                  ? 'badge-emerald'
                  : 'badge-amber'
              } badge`}
            >
              <Zap className="w-2.5 h-2.5" />
              <span>{isHealthy ? 'Live' : 'Connecting'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          key={pageKey}
          className="flex-1 overflow-y-auto page-enter"
          style={{ padding: '1.5rem' }}
        >
          {activeTab === 'home'            && <HomePage setActiveTab={navigate} setSelectedIsbn={setSelectedIsbn} />}
          {activeTab === 'discover'        && <DiscoverBooksPage setActiveTab={navigate} setSelectedIsbn={setSelectedIsbn} />}
          {activeTab === 'details'         && <BookDetailsPage selectedIsbn={selectedIsbn} setSelectedIsbn={setSelectedIsbn} setActiveTab={navigate} />}
          {activeTab === 'recommendations' && <RecommendationsPage />}
          {activeTab === 'authors'         && <AuthorsPage setSelectedIsbn={setSelectedIsbn} setActiveTab={navigate} />}
          {activeTab === 'publishers'      && <PublishersPage setSelectedIsbn={setSelectedIsbn} setActiveTab={navigate} />}
          {activeTab === 'analytics'       && <AnalyticsPage />}
          {activeTab === 'favorites'       && <FavoritesPage setActiveTab={navigate} setSelectedIsbn={setSelectedIsbn} />}
          {activeTab === 'about'           && <AboutPage />}
        </main>
      </div>
    </div>
  );
}
