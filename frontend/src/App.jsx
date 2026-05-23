import React from 'react'
import SentimentPredictor from './components/SentimentPredictor'
import BatchProcessor from './components/BatchProcessor'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19.8 11.4a2 2 0 1 0-2.8-2.8L12 13.6 7 8.6a2 2 0 1 0-2.8 2.8l7.8 7.8 7.8-7.8Z"/></svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              CineSentiment
            </h1>
          </div>
          <div className="text-sm font-medium text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            Powered by V2 CNN Model
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none -z-10"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Understand Movie Reviews <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Instantly.</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Our optimized NLP model analyzes text in real-time to determine sentiment and highlight key phrases. Perfect for quick checks or batch processing large datasets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-10 h-10 rounded-full bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center text-indigo-400 font-bold">1</div>
              <h3 className="text-xl font-semibold">Try it Live</h3>
            </div>
            <SentimentPredictor />
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-700/50 flex items-center justify-center text-purple-400 font-bold">2</div>
              <h3 className="text-xl font-semibold">Process in Bulk</h3>
            </div>
            <BatchProcessor />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 mt-20 py-8 text-center text-sm text-slate-500">
        <p>CineSentiment Mini-App 2. Built for speed and accuracy.</p>
      </footer>
    </div>
  )
}

export default App
