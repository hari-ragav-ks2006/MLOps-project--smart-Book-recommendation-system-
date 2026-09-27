import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Upload, CheckCircle2, AlertCircle, Info,
  ArrowRight, Loader2, ChevronDown, ChevronUp, X, Eye,
  Diff, BookOpen, Zap, RefreshCw, FileText
} from 'lucide-react';

// ── Status Badge ──────────────────────────────
function StatusBadge({ status }) {
  const map = {
    NEW: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    NO_CHANGE: 'bg-gray-100 text-gray-700 border-gray-300',
    EXISTING_CHANGED: 'bg-amber-100 text-amber-800 border-amber-300',
    EXISTING: 'bg-amber-100 text-amber-800 border-amber-300',
    INSERTED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    UPDATED: 'bg-blue-100 text-blue-800 border-blue-300',
    ERROR: 'bg-red-100 text-red-800 border-red-300',
  };
  const cls = map[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  const icons = {
    NEW: <CheckCircle2 className="w-3 h-3" />,
    NO_CHANGE: <Info className="w-3 h-3" />,
    EXISTING_CHANGED: <AlertCircle className="w-3 h-3" />,
    INSERTED: <CheckCircle2 className="w-3 h-3" />,
    UPDATED: <CheckCircle2 className="w-3 h-3" />,
    ERROR: <AlertCircle className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${cls}`}>
      {icons[status]}
      {status?.replace('_', ' ')}
    </span>
  );
}

// ── Field Diff Table ──────────────────────────
function FieldDiffTable({ changes = [] }) {
  if (!changes.length) return null;
  return (
    <div className="mt-3 rounded-xl border-2 border-[#141416] overflow-hidden">
      <div className="bg-[#141416] px-3 py-1.5 text-[10px] font-black text-[#FAED8F] uppercase tracking-widest flex items-center gap-1.5">
        <Diff className="w-3 h-3" /> Changes Detected
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#F4EFE6] border-b border-[#141416]/20">
            <th className="text-left px-3 py-2 font-black text-[#141416] w-1/4">Field</th>
            <th className="text-left px-3 py-2 font-black text-[#141416] w-1/3">Current Value</th>
            <th className="text-left px-3 py-2 font-black text-[#141416] w-1/3">New Value</th>
            <th className="text-left px-3 py-2 font-black text-[#141416]">Category</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((c, i) => (
            <tr key={i} className="border-b border-[#141416]/10 hover:bg-gray-50">
              <td className="px-3 py-2 font-bold text-[#141416]">{c.field}</td>
              <td className="px-3 py-2 text-red-600 line-through">{c.old_value || '—'}</td>
              <td className="px-3 py-2 text-emerald-700 font-semibold">{c.new_value || '—'}</td>
              <td className="px-3 py-2">
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                  c.category === 'ML_RELEVANT' ? 'bg-purple-100 text-purple-700' :
                  c.category === 'DISPLAY_ONLY' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>{c.category?.replace('_', ' ')}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Book Form ─────────────────────────────────
const EMPTY_FORM = {
  title: '', author: '', isbn: '', isbn_13: '', publisher: '',
  publication_year: '', genre: '', description: '', language: 'English',
  cover_image_url: '', open_library_id: '',
};

function BookForm({ initial = EMPTY_FORM, onSubmit, submitLabel = 'Check Book', loading }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const inputCls = "w-full rounded-xl px-3 py-2 text-sm font-medium text-[#141416] bg-white border-2 border-[#141416]/30 focus:border-[#141416] outline-none transition-colors placeholder-[#92929D]";
  const labelCls = "block text-[11px] font-black text-[#141416] uppercase tracking-wider mb-1";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Book Title *</label>
          <input className={inputCls} value={form.title} onChange={set('title')} placeholder="e.g. The Fellowship of the Ring" required />
        </div>
        <div>
          <label className={labelCls}>Author *</label>
          <input className={inputCls} value={form.author} onChange={set('author')} placeholder="e.g. J.R.R. Tolkien" required />
        </div>
        <div>
          <label className={labelCls}>Publisher</label>
          <input className={inputCls} value={form.publisher} onChange={set('publisher')} placeholder="e.g. Allen & Unwin" />
        </div>
        <div>
          <label className={labelCls}>ISBN-10</label>
          <input className={inputCls} value={form.isbn} onChange={set('isbn')} placeholder="e.g. 0395489318" />
        </div>
        <div>
          <label className={labelCls}>ISBN-13</label>
          <input className={inputCls} value={form.isbn_13} onChange={set('isbn_13')} placeholder="e.g. 9780395489314" />
        </div>
        <div>
          <label className={labelCls}>Publication Year</label>
          <input className={inputCls} value={form.publication_year} onChange={set('publication_year')} placeholder="e.g. 1954" type="number" min="1000" max="2026" />
        </div>
        <div>
          <label className={labelCls}>Genre</label>
          <input className={inputCls} value={form.genre} onChange={set('genre')} placeholder="e.g. Fantasy, Literary Fiction" />
        </div>
        <div>
          <label className={labelCls}>Language</label>
          <input className={inputCls} value={form.language} onChange={set('language')} placeholder="English" />
        </div>
        <div>
          <label className={labelCls}>Open Library ID</label>
          <input className={inputCls} value={form.open_library_id} onChange={set('open_library_id')} placeholder="e.g. OL7353617M" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Cover Image URL</label>
          <input className={inputCls} value={form.cover_image_url} onChange={set('cover_image_url')} placeholder="https://covers.openlibrary.org/..." />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Description</label>
          <textarea className={inputCls + " resize-none h-20"} value={form.description} onChange={set('description')} placeholder="Brief description or synopsis..." />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 text-sm font-black gap-2 shadow-[3px_3px_0px_#141416] cursor-pointer disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        {submitLabel}
      </button>
    </form>
  );
}

// ── Add New Book Tab ──────────────────────────
function AddBookTab() {
  const [loading, setLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [lastForm, setLastForm] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  const handleCheck = async (form) => {
    setLoading(true);
    setCheckResult(null);
    setActionResult(null);
    setLastForm(form);
    try {
      const res = await fetch('/api/admin/books/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setCheckResult(data);
    } catch (e) {
      setCheckResult({ status: 'ERROR', message: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lastForm),
      });
      const data = await res.json();
      setActionResult(data);
      setCheckResult(null);
      setConfirming(false);
    } catch (e) {
      setActionResult({ success: false, error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!checkResult?.row_index === undefined) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/books/${checkResult.row_index}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lastForm),
      });
      const data = await res.json();
      setActionResult(data);
      setCheckResult(null);
    } catch (e) {
      setActionResult({ success: false, error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border-2 border-[#141416] p-6 shadow-[4px_4px_0px_#141416]">
        <h3 className="font-editorial font-extrabold text-lg text-[#141416] mb-1">Book Details</h3>
        <p className="text-xs text-[#5E5E68] mb-5">The system will automatically check for duplicates before inserting.</p>
        <BookForm onSubmit={handleCheck} submitLabel="Check Catalog →" loading={loading} />
      </div>

      {/* Check Result */}
      {checkResult && (
        <div className={`rounded-2xl p-5 border-2 shadow-[4px_4px_0px_#141416] ${
          checkResult.status === 'NEW' ? 'bg-[#D2F5E3] border-[#141416]' :
          checkResult.status === 'NO_CHANGE' ? 'bg-[#F4EFE6] border-[#141416]' :
          'bg-[#FAED8F] border-[#141416]'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={checkResult.status} />
                {checkResult.matched_by && (
                  <span className="text-[10px] text-[#5E5E68] font-bold">matched by: {checkResult.matched_by}</span>
                )}
              </div>
              <p className="text-sm font-bold text-[#141416]">{checkResult.message}</p>
              {checkResult.existing_book && (
                <p className="text-xs text-[#5E5E68] mt-1">
                  Existing: <strong>{checkResult.existing_book['Book-Title']}</strong> by {checkResult.existing_book['Book-Author']}
                </p>
              )}
            </div>
          </div>

          {/* Field diff */}
          {checkResult.changed_fields?.length > 0 && (
            <FieldDiffTable changes={checkResult.changed_fields} />
          )}

          {/* Actions */}
          {checkResult.status === 'NEW' && !confirming && (
            <div className="mt-4 flex gap-3">
              <button onClick={() => setConfirming(true)}
                className="btn-primary text-xs py-2 px-5 gap-1.5 cursor-pointer">
                <CheckCircle2 className="w-4 h-4" /> Confirm Insert
              </button>
              <button onClick={() => setCheckResult(null)}
                className="btn-secondary text-xs py-2 px-4 cursor-pointer">Cancel</button>
            </div>
          )}
          {checkResult.status === 'NEW' && confirming && (
            <div className="mt-4 p-4 rounded-xl bg-white/70 border border-[#141416]/20">
              <p className="text-xs font-black text-[#141416] mb-3">✅ Confirm insertion of this new book into the catalog? ML pipeline will rebuild automatically.</p>
              <div className="flex gap-3">
                <button onClick={handleInsert} disabled={loading}
                  className="btn-primary text-xs py-2 px-5 gap-1.5 cursor-pointer disabled:opacity-60">
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  Yes, Insert Book
                </button>
                <button onClick={() => setConfirming(false)}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer">Go Back</button>
              </div>
            </div>
          )}
          {checkResult.status === 'EXISTING_CHANGED' && (
            <div className="mt-4 flex gap-3">
              <button onClick={handleUpdate} disabled={loading}
                className="btn-primary text-xs py-2 px-5 gap-1.5 bg-[#E3D9FF] border-[#141416] text-[#141416] cursor-pointer disabled:opacity-60">
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                Save Changes
              </button>
              <button onClick={() => setCheckResult(null)}
                className="btn-secondary text-xs py-2 px-4 cursor-pointer">Cancel</button>
            </div>
          )}
        </div>
      )}

      {/* Final Result */}
      {actionResult && (
        <div className={`rounded-2xl p-5 border-2 shadow-[4px_4px_0px_#141416] ${
          actionResult.success ? 'bg-[#D2F5E3] border-[#141416]' : 'bg-[#FFD6CE] border-[#141416]'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {actionResult.success
              ? <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              : <AlertCircle className="w-5 h-5 text-red-700" />}
            <span className="font-editorial font-extrabold text-base text-[#141416]">
              {actionResult.success ? 'Operation Successful' : 'Operation Failed'}
            </span>
          </div>
          <p className="text-sm text-[#141416] font-medium">{actionResult.message || actionResult.error}</p>
          {actionResult.ml_pipeline_required && (
            <div className="mt-3 flex items-center gap-2 text-xs font-black text-purple-800 bg-purple-100 px-3 py-2 rounded-lg border border-purple-300">
              <Zap className="w-3.5 h-3.5" /> ML pipeline rebuild triggered in background
            </div>
          )}
          {actionResult.version_id && (
            <p className="mt-2 text-[10px] text-[#5E5E68] font-mono">Version: {actionResult.version_id}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Bulk Upload Tab ───────────────────────────
function BulkUploadTab() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState(null);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setPreview(null);
    setExecResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/books/bulk/preview', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Preview failed');
      setPreview(data);
    } catch (e) {
      setPreview({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const res = await fetch('/api/admin/books/bulk/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preview_result: preview, author: 'admin' }),
      });
      const data = await res.json();
      setExecResult(data);
      setPreview(null);
    } catch (e) {
      setExecResult({ success: false, error: e.message });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white border-2 border-[#141416] p-6 shadow-[4px_4px_0px_#141416]">
        <h3 className="font-editorial font-extrabold text-lg text-[#141416] mb-1">Bulk CSV Upload</h3>
        <p className="text-xs text-[#5E5E68] mb-4">
          Upload a CSV with columns: title, author, isbn, isbn_13, publisher, publication_year, genre, cover_image_url.<br />
          Max 5,000 rows. The system will preview classification before importing.
        </p>
        <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-[#141416]/40 bg-[#F4EFE6] cursor-pointer hover:border-[#141416] transition-colors">
          <Upload className="w-8 h-8 text-[#5E5E68]" />
          <span className="text-sm font-bold text-[#141416]">Drop CSV file here or click to browse</span>
          <span className="text-xs text-[#5E5E68]">.csv files only</span>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </label>
        {loading && (
          <div className="mt-4 flex items-center gap-2 text-sm font-bold text-[#141416]">
            <Loader2 className="w-4 h-4 animate-spin" /> Analysing CSV...
          </div>
        )}
      </div>

      {preview?.error && (
        <div className="rounded-2xl p-5 bg-[#FFD6CE] border-2 border-[#141416] shadow-[3px_3px_0px_#141416]">
          <p className="text-sm font-bold text-red-800"><AlertCircle className="inline w-4 h-4 mr-1" />{preview.error}</p>
        </div>
      )}

      {preview && !preview.error && (
        <div className="rounded-2xl bg-white border-2 border-[#141416] p-6 shadow-[4px_4px_0px_#141416] space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="font-editorial font-extrabold text-base text-[#141416]">Bulk Import Preview</h4>
            <span className="badge badge-yellow font-black">{preview.total_rows} total rows</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'New Books', val: preview.new_books, color: 'bg-[#D2F5E3]' },
              { label: 'Updated', val: preview.updated_books, color: 'bg-[#E3D9FF]' },
              { label: 'No Change', val: preview.no_change, color: 'bg-[#F4EFE6]' },
              { label: 'Invalid', val: preview.invalid, color: 'bg-[#FFD6CE]' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl p-4 border-2 border-[#141416] shadow-[2px_2px_0px_#141416] text-center`}>
                <p className="text-2xl font-editorial font-black text-[#141416]">{s.val}</p>
                <p className="text-[11px] font-black text-[#5E5E68] uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>

          {(preview.updated_books > 0) && (
            <p className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
              <Zap className="inline w-3 h-3 mr-1" />
              {preview.ml_relevant_updates} books have ML-relevant changes (TF-IDF rebuild required) · {preview.display_only_updates} display-only
            </p>
          )}

          {preview.invalid_list?.length > 0 && (
            <div>
              <p className="text-xs font-black text-[#141416] mb-2 uppercase">Invalid Records (first 20)</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {preview.invalid_list.map((inv, i) => (
                  <div key={i} className="text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                    <strong>Row {inv.row}:</strong> {inv.reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(preview.new_books > 0 || preview.updated_books > 0) && (
            <div className="flex gap-3 pt-2 border-t border-[#141416]/10">
              <button onClick={handleExecute} disabled={executing}
                className="btn-primary text-xs py-2.5 px-6 gap-2 shadow-[3px_3px_0px_#141416] cursor-pointer disabled:opacity-60">
                {executing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Import {preview.new_books + preview.updated_books} Valid Records
              </button>
              <button onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="btn-secondary text-xs py-2 px-4 cursor-pointer">Cancel</button>
            </div>
          )}
        </div>
      )}

      {execResult && (
        <div className={`rounded-2xl p-5 border-2 shadow-[4px_4px_0px_#141416] ${execResult.success ? 'bg-[#D2F5E3]' : 'bg-[#FFD6CE]'} border-[#141416]`}>
          <p className="font-editorial font-bold text-base text-[#141416] mb-2">
            {execResult.success ? '✅ Bulk Import Complete' : '❌ Import Failed'}
          </p>
          {execResult.success && (
            <p className="text-sm text-[#141416]">
              Inserted: <strong>{execResult.inserted}</strong> · Updated: <strong>{execResult.updated}</strong>
            </p>
          )}
          {execResult.ml_pipeline_required && (
            <div className="mt-3 flex items-center gap-2 text-xs font-black text-purple-800 bg-purple-100 px-3 py-2 rounded-lg border border-purple-300">
              <Zap className="w-3.5 h-3.5" /> ML pipeline rebuild triggered in background
            </div>
          )}
          {execResult.error && <p className="text-sm text-red-700 mt-1">{execResult.error}</p>}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────
export default function BookIngestionPage() {
  const [tab, setTab] = useState('add');

  const tabs = [
    { id: 'add', label: '+ Add New Book', icon: Plus },
    { id: 'bulk', label: 'Bulk Upload CSV', icon: Upload },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="rounded-3xl bg-[#FAED8F] border-2 border-[#141416] p-6 sm:p-8 shadow-[6px_6px_0px_#141416] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #141416 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#141416] text-[10px] font-black uppercase mb-3">
            <FileText className="w-3 h-3" /> Admin · Catalog Management
          </div>
          <h1 className="text-3xl sm:text-4xl font-editorial font-extrabold text-[#141416] tracking-tight">
            Book Ingestion Center
          </h1>
          <p className="text-sm text-[#141416]/80 mt-2 max-w-xl">
            Add new books, detect duplicates, preview field-level changes, and trigger intelligent MLOps pipeline rebuilds automatically.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-full bg-[#F4EFE6] border-2 border-[#141416] gap-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                tab === t.id ? 'bg-[#FAED8F] text-[#141416] shadow-[1px_1px_0px_#141416]' : 'text-[#5E5E68] hover:text-[#141416]'
              }`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === 'add' && <AddBookTab />}
      {tab === 'bulk' && <BulkUploadTab />}
    </div>
  );
}
