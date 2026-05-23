import React, { useState } from 'react';

export default function BatchProcessor() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/batch-predict', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process file');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    if (results.length === 0) return;
    
    // Create CSV content
    const headers = Object.keys(results[0]).join(',');
    const rows = results.map(row => 
      Object.values(row).map(val => 
        // Handle commas in text by quoting
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cinesentiment_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setFile(null);
    setResults([]);
    setError(null);
    const fileInput = document.getElementById('batch-file-input');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="w-full p-6 mt-8 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 transition-all duration-300 hover:shadow-indigo-500/10 hover:border-slate-600">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
        Batch Processing
      </h2>
      <p className="text-slate-400 mb-6 text-sm">Upload a TXT file containing one movie review per line to analyze multiple movies at once.</p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}
      
      <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-center gap-4 mb-8">
        <div className="w-full relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-200"></div>
          <div className="relative bg-slate-800 rounded-lg border border-slate-700 p-1 flex items-center">
            <input 
              id="batch-file-input"
              type="file" 
              accept=".txt" 
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-200 hover:file:bg-slate-600 transition-all cursor-pointer focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            type="submit" 
            disabled={!file || loading}
            className="w-full sm:w-auto whitespace-nowrap px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center"
          >
            {loading ? (
              <><svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Processing...</>
            ) : 'Analyze File'}
          </button>
          
          <button 
            type="button" 
            onClick={handleClear}
            disabled={(!file && results.length === 0) || loading}
            className="w-full sm:w-auto whitespace-nowrap px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center"
            title="Clear current file and results"
          >
            Clear
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Results ({results.length} reviews)</h3>
            <button 
              onClick={downloadResults}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-sm font-medium transition-colors border border-slate-700 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export CSV
            </button>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-slate-700 shadow-inner">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 backdrop-blur-sm sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-semibold">Review Snippet</th>
                  <th className="px-6 py-4 font-semibold w-32">Sentiment</th>
                  <th className="px-6 py-4 font-semibold w-24 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 bg-slate-900/50">
                {results.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="truncate max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl text-slate-300" title={row.text}>
                        {row.text}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.sentiment_label === 'Positive' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {row.sentiment_label === 'Positive' ? '😊 ' : '😞 '}
                        {row.sentiment_label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-400">
                      {(row.sentiment_score * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {results.length > 10 && (
            <div className="mt-4 text-center text-slate-500 text-sm bg-slate-800/30 py-2 rounded-lg border border-slate-700/50">
              Showing top 10 results. Export CSV to view all {results.length} reviews.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
