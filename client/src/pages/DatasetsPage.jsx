import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Badge from '../components/Badge';
import LoadingState from '../components/LoadingState';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Database, UploadCloud, Sparkles, Play, Trash2, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  // Deletion modal & state
  const [datasetToDelete, setDatasetToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchDatasets = async () => {
    try {
      const res = await api.get('/datasets');
      if (res.data.success) {
        setDatasets(res.data.datasets || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/datasets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setIsUploadModalOpen(false);
        setFile(null);
        setFeedback({ type: 'success', text: 'Dataset uploaded and evaluated successfully.' });
        fetchDatasets();
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to upload dataset.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSeedSamples = async () => {
    setSeeding(true);
    try {
      await api.post('/datasets/seed-samples');
      setFeedback({ type: 'success', text: 'Sample datasets loaded successfully.' });
      fetchDatasets();
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Failed to load sample datasets.' });
    } finally {
      setSeeding(false);
    }
  };

  const handleRunAnalysis = async (ds) => {
    const targetId = ds._id || ds.id;
    try {
      await api.post(`/analysis/${targetId}`, { module: ds.detectedModule });
      setFeedback({ type: 'success', text: `Analysis started for ${ds.originalName || ds.filename}.` });
      fetchDatasets();
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to run analysis.' });
    }
  };

  const confirmDelete = async () => {
    if (!datasetToDelete) return;
    const targetId = datasetToDelete._id || datasetToDelete.id || datasetToDelete.filename;
    setDeletingId(targetId);

    try {
      const res = await api.delete(`/datasets/${targetId}`);
      if (res.data.success) {
        // Optimistically remove from state immediately
        setDatasets(prev => prev.filter(d => (d._id || d.id) !== targetId && d.filename !== targetId));
        setFeedback({ type: 'success', text: `Dataset "${datasetToDelete.originalName || datasetToDelete.filename}" deleted successfully.` });
        setDatasetToDelete(null);
        await fetchDatasets();
      } else {
        setFeedback({ type: 'error', text: res.data.message || 'Unable to delete dataset.' });
      }
    } catch (err) {
      console.error('[Delete Error]', err);
      const msg = err.response?.data?.message || 'Unable to delete dataset. Please try again.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingState message="Loading company datasets repository..." />;

  const columns = [
    { 
      header: 'Filename', 
      render: (r) => (
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-brand-600" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">{r.originalName || r.filename}</span>
          {r.isSample && <Badge variant="warning">Sample Dataset</Badge>}
        </div>
      ) 
    },
    { header: 'File Format', accessor: 'fileType' },
    { header: 'Rows', accessor: 'rowCount' },
    { header: 'Columns', accessor: 'columnCount' },
    { 
      header: 'Quality Score', 
      render: (r) => (
        <span className={`font-bold ${r.dataQualityScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
          {r.dataQualityScore}/100
        </span>
      ) 
    },
    { header: 'Detected Module', render: (r) => <span className="uppercase font-semibold text-[11px] text-slate-600">{r.detectedModule}</span> },
    { header: 'Status', render: (r) => <Badge variant={r.status === 'Analyzed' ? 'success' : 'info'}>{r.status}</Badge> },
    {
      header: 'Actions',
      render: (r) => {
        const id = r._id || r.id;
        const isDeletingThis = deletingId === id;
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleRunAnalysis(r)}
              title="Run AI Analysis Engine"
              className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded text-[11px] font-semibold flex items-center space-x-1"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Analyze</span>
            </button>
            <button
              onClick={() => { setSelectedDataset(r); setIsPreviewModalOpen(true); }}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px]"
            >
              Inspect
            </button>
            <button
              onClick={() => setDatasetToDelete(r)}
              disabled={isDeletingThis}
              title="Delete Dataset"
              className="p-1 text-slate-400 hover:text-rose-600 rounded disabled:opacity-50 transition-colors"
            >
              {isDeletingThis ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Feedback Alert Banner */}
      {feedback && (
        <div className={`p-3 rounded-md text-xs flex items-center justify-between border ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
            : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold px-1.5 py-0.5 rounded hover:bg-black/5">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center space-x-2">
            <Database className="w-5 h-5 text-brand-600" />
            <span>Dataset Repository & Management System</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Supported formats: CSV, XLSX, XLS. Upload actual operational datasets for analysis.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSeedSamples}
            disabled={seeding}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-md text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{seeding ? 'Loading Samples...' : 'Load Sample Datasets'}</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Dataset</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <DataTable columns={columns} data={datasets} emptyMessage="No datasets uploaded yet. Upload a CSV/XLSX file or click 'Load Sample Datasets'." />
      </div>

      {/* Confirmation Modal for Deletion */}
      <Modal 
        isOpen={!!datasetToDelete} 
        onClose={() => setDatasetToDelete(null)} 
        title="Delete Dataset Confirmation"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete:
            <span className="font-bold text-slate-900 dark:text-white block mt-1 text-sm font-mono">
              {datasetToDelete?.originalName || datasetToDelete?.filename}
            </span>
          </p>
          <p className="text-rose-600 dark:text-rose-400 font-medium">
            This action will remove the uploaded dataset record and its associated analysis findings.
          </p>
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setDatasetToDelete(null)}
              disabled={!!deletingId}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={!!deletingId}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold flex items-center space-x-1 shadow-xs transition-colors"
            >
              {deletingId ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>{deletingId ? 'Deleting Dataset...' : 'Delete Dataset'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Company Operational Dataset">
        <form onSubmit={handleFileUpload} className="space-y-4 text-xs">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center bg-slate-50 dark:bg-slate-800/50">
            <UploadCloud className="w-8 h-8 text-brand-600 mx-auto mb-2" />
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Select a CSV, XLSX, or XLS file</p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              required
              onChange={e => setFile(e.target.files[0])}
              className="mt-3 text-xs text-slate-500 mx-auto"
            />
          </div>
          <button type="submit" disabled={uploading || !file} className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded font-semibold">
            {uploading ? 'Validating & Uploading...' : 'Upload & Evaluate Quality'}
          </button>
        </form>
      </Modal>

      {/* Inspect Preview Modal */}
      <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title={`Inspect Dataset: ${selectedDataset?.originalName || selectedDataset?.filename}`}>
        {selectedDataset && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              <div><span className="font-semibold">Detected Module:</span> {selectedDataset.detectedModule}</div>
              <div><span className="font-semibold">Quality Score:</span> {selectedDataset.dataQualityScore}/100</div>
              <div><span className="font-semibold">Total Rows:</span> {selectedDataset.rowCount}</div>
              <div><span className="font-semibold">Total Columns:</span> {selectedDataset.columnCount}</div>
            </div>
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Detected Columns:</span>
              <p className="font-mono text-[11px] text-slate-500">{selectedDataset.columns?.join(', ')}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
