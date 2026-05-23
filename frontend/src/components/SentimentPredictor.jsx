import React, { useState } from 'react';

export default function SentimentPredictor() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to analyze text');
      }
      
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  // Function to highlight keywords in the text
  const renderHighlightedText = () => {
    if (!result || !result.highlights || result.highlights.length === 0) return text;
    
    let highlightedHTML = text;
    // We need to be careful with replace, so we sort highlights by length descending to replace longer words first
    const sortedHighlights = [...result.highlights].sort((a, b) => b.word.length - a.word.length);
    
    sortedHighlights.forEach(hl => {
      const colorClass = hl.sentiment === 'positive' 
        ? 'bg-green-500/30 text-green-300 font-semibold px-1 rounded' 
        : 'bg-red-500/30 text-red-300 font-semibold px-1 rounded';
      
      // Basic regex replace (case insensitive) with word boundaries
      const regex = new RegExp(`\\b(${hl.word})\\b`, 'gi');
      highlightedHTML = highlightedHTML.replace(regex, `<span class="${colorClass}">$1</span>`);
    });
    
    return <div dangerouslySetInnerHTML={{ __html: highlightedHTML }} />;
  };

  return (
    <div className="w-full p-6 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 transition-all duration-300 hover:shadow-indigo-500/10 hover:border-slate-600">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-400"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
        Real-Time Analysis
      </h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full h-32 p-4 bg-slate-800 text-slate-100 rounded-lg border border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-inner"
          placeholder="Type a movie review here... (e.g. 'An absolute masterpiece! Loved the acting.')"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        <div className="flex gap-4 mt-4">
          <button 
            type="submit" 
            disabled={!text.trim() || loading}
            className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center"
          >
            {loading ? (
              <><svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Analyzing...</>
            ) : 'Analyze Text'}
          </button>
          <button 
            type="button" 
            onClick={handleClear}
            disabled={loading || (!text && !result && !error)}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-slate-600"
          >
            Clear
          </button>
        </div>
      </form>

      {result && !error && (
        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <div className="flex flex-col">
              <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Sentiment</span>
              <span className={`text-2xl font-bold mt-1 ${result.sentiment === 'Positive' ? 'text-green-400' : 'text-red-400'}`}>
                {result.sentiment} {result.sentiment === 'Positive' ? '😊' : '😞'}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Confidence</span>
              <span className="text-2xl font-bold text-slate-200 mt-1">{(result.confidence * 100).toFixed(1)}%</span>
            </div>
          </div>
          
          {/* Confidence Gauge / Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden relative shadow-inner p-[2px]">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${result.sentiment === 'Positive' ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-gradient-to-r from-red-600 to-red-400'}`}
              style={{ width: `${result.confidence * 100}%` }}
            ></div>
          </div>

          <div className="mt-6 p-5 bg-slate-800 rounded-lg border border-slate-700 shadow-md">
            <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              Keyword Analysis
            </h3>
            <div className="text-slate-200 leading-relaxed text-lg">
              {renderHighlightedText()}
            </div>
            {result.highlights.length === 0 && (
              <p className="text-slate-500 italic text-sm mt-2">No strong positive/negative keywords identified or text too long.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
