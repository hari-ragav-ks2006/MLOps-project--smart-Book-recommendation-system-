import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function DatasetUploadPage({ setActiveTab }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV or Excel file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload_dataset', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const errData = await res.json();
        setError(errData.detail || 'Failed to upload dataset.');
      }
    } catch (err) {
      setError('Connection error uploading dataset.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-panel p-6 rounded-2xl space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Upload className="w-6 h-6 text-brand-400" />
          <span>Upload Dataset</span>
        </h2>
        <p className="text-slate-400 text-sm">
          Upload any CSV or Excel file. The MLOps pipeline automatically infers schemas, data types, handles missing values, and builds recommendation features.
        </p>
      </div>

      {/* File Dropzone */}
      <div className="glass-card p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-brand-500 transition-colors flex flex-col items-center justify-center text-center space-y-4">
        <div className="p-4 bg-brand-500/10 text-brand-400 rounded-full">
          <FileText className="w-8 h-8" />
        </div>

        <div>
          <p className="text-base font-semibold text-slate-200">
            {file ? file.name : 'Select or drag your CSV/Excel dataset file'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Supports .csv, .xlsx, .xls (Up to 500MB)</p>
        </div>

        <input
          type="file"
          id="dataset-input"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex space-x-3">
          <label
            htmlFor="dataset-input"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold cursor-pointer border border-slate-700 transition-all"
          >
            Browse File
          </label>
          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold flex items-center space-x-2 shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Analyze</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Success Analysis Preview */}
      {result && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold text-lg text-white">Dataset Analyzed Successfully</h3>
            </div>
            <button
              onClick={() => setActiveTab('analysis')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 transition-all"
            >
              <span>View Full EDA Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400">Filename</span>
              <p className="font-bold text-white truncate mt-1">{result.filename}</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400">Total Rows</span>
              <p className="font-bold text-white mt-1">{result.dataset_analysis?.total_rows?.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400">Columns Detected</span>
              <p className="font-bold text-white mt-1">{result.dataset_analysis?.total_columns}</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400">Duplicates</span>
              <p className="font-bold text-white mt-1">{result.dataset_analysis?.duplicate_rows}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
