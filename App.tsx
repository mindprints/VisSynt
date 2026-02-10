
import React, { useState, useCallback } from 'react';
import { performTopicSearch, generateNanoBananaImage } from './services/geminiService';
import { AppState, SearchResult, GeneratedImages } from './types';
import VisualCard from './components/VisualCard';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [searchData, setSearchData] = useState<SearchResult | null>(null);
  const [images, setImages] = useState<GeneratedImages | null>(null);

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSynthesize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setAppState(AppState.SEARCHING);
    setError(null);
    setSearchData(null);
    setImages(null);

    try {
      // Step 1: Search for Visual Context
      const results = await performTopicSearch(topic);
      setSearchData(results);
      
      setAppState(AppState.GENERATING);

      // Step 2: Build Prompts
      const directPrompt = `A high-quality artistic image representing the concept of ${topic}. Digital art style, clean composition.`;
      
      const vizDescriptions = results.visualizations
        .map(v => `${v.title}: ${v.description}`)
        .join('. ');
        
      const conglomeratePrompt = `A masterfully blended conglomerate visualization of "${topic}". 
      The composition MUST incorporate elements from: ${vizDescriptions}.
      STIPULATION: Any photographic elements included must adhere to a realistic "Wikimedia Commons" style, mirroring clearly CC-licensed, documentary-style photography. 
      The final image should be a sophisticated data-infographic synthesis that looks like it belongs in a high-end educational journal, showcasing the intersection of various visual data formats.`;

      // Step 3: Concurrent Image Generation
      const [directUrl, conglomerateUrl] = await Promise.all([
        generateNanoBananaImage(directPrompt),
        generateNanoBananaImage(conglomeratePrompt)
      ]);

      setImages({
        directUrl,
        conglomerateUrl,
        directPrompt,
        conglomeratePrompt
      });
      setAppState(AppState.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during the synthesis process.");
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">Visual Synthesis Engine</h1>
              <p className="text-xs text-slate-500 font-medium">Research-Backed Image Generation</p>
            </div>
          </div>

          <form onSubmit={handleSynthesize} className="flex-1 max-w-xl w-full flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g. Quantum Computing, Climate Change...)"
              className="flex-1 bg-slate-100 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              disabled={appState === AppState.SEARCHING || appState === AppState.GENERATING}
            />
            <button
              type="submit"
              disabled={appState === AppState.SEARCHING || appState === AppState.GENERATING}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
            >
              {(appState === AppState.SEARCHING || appState === AppState.GENERATING) ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Synthesize'}
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-6 flex-1">
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="bg-indigo-50 p-6 rounded-full">
              <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">What should we visualize today?</h2>
              <p className="text-slate-500 mt-2 max-w-md">We'll search for real-world visualization data and use it to guide our AI in creating a truly informed conglomerate image.</p>
            </div>
            <div className="flex gap-4">
              {['The Silk Road', 'Dark Matter', 'Urban Sprawl', 'Neurosurgery'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setTopic(suggestion)}
                  className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-bold">Error Encountered</p>
            </div>
            <p className="text-xs ml-8 text-red-600/80">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Context & Data */}
          {(searchData || appState === AppState.SEARCHING) && (
            <div className="lg:col-span-4 space-y-6">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-left duration-500">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Search Insights
                </h3>
                {appState === AppState.SEARCHING ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {searchData?.summary}
                    </p>
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visual Pillars (Wikimedia Style Included)</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {searchData?.visualizations.map((viz, idx) => (
                          <VisualCard key={idx} viz={viz} index={idx} />
                        ))}
                      </div>
                    </div>
                    {searchData?.groundingLinks && searchData.groundingLinks.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Grounding Sources</h4>
                        <div className="flex flex-wrap gap-2">
                          {searchData.groundingLinks.slice(0, 5).map((link, idx) => (
                            <a
                              key={idx}
                              href={link.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full truncate max-w-[200px] transition-colors"
                            >
                              {link.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          )}

          {/* Right Panel: Visual Comparison */}
          <div className="lg:col-span-8">
            {(appState === AppState.GENERATING || images) ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Direct Generation */}
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">Direct Method</h3>
                      {images && (
                        <button 
                          onClick={() => downloadImage(images.directUrl, `direct-${topic}`)}
                          className="text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Save
                        </button>
                      )}
                    </div>
                    <div className="aspect-square bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden relative group">
                      {appState === AppState.GENERATING ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
                          <svg className="animate-spin h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm text-slate-400">Rendering...</span>
                        </div>
                      ) : (
                        <img src={images?.directUrl} alt="Direct visualization" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      )}
                    </div>
                    <div className="bg-white/50 p-4 rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 font-mono italic">
                        &quot;{images?.directPrompt || '...waiting for prompt...'}&quot;
                      </p>
                    </div>
                  </div>

                  {/* Conglomerate Generation */}
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 text-indigo-600">Synthesis Method</h3>
                      {images && (
                        <button 
                          onClick={() => downloadImage(images.conglomerateUrl, `synthesis-${topic}`)}
                          className="text-xs font-medium bg-indigo-100 hover:bg-indigo-200 text-indigo-600 px-3 py-1 rounded-full flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Synthesis
                        </button>
                      )}
                    </div>
                    <div className="aspect-square bg-white rounded-3xl shadow-xl border-2 border-indigo-200 overflow-hidden relative group">
                      {appState === AppState.GENERATING ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-50/50">
                          <div className="relative">
                            <svg className="animate-spin h-10 w-10 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 bg-indigo-600 rounded-full animate-ping"></div>
                          </div>
                          <span className="text-sm font-semibold text-indigo-600">Synthesizing Conglomerate...</span>
                        </div>
                      ) : (
                        <img src={images?.conglomerateUrl} alt="Conglomerate visualization" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      )}
                    </div>
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-dashed border-indigo-200">
                      <p className="text-xs text-indigo-500 font-mono italic">
                        &quot;{images?.conglomeratePrompt || '...waiting for synthesized prompt...'}&quot;
                      </p>
                    </div>
                  </div>
                </div>

                {appState === AppState.COMPLETED && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in zoom-in duration-500 delay-300">
                    <h4 className="text-md font-bold text-slate-900 mb-2">Synthesis Breakdown</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      The synthesis method doesn't just ask for an image of the topic; it extracts the structural logic of how that topic is represented in the real world. By identifying <strong>{searchData?.visualizations.length}</strong> core visual pillars—including iconic CC-licensed Wikimedia style photos—the AI creates a higher-dimensional representation that captures functional detail often lost in direct artistic prompting.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-slate-400 text-xs">
        <p>© 2024 Visual Synthesis Engine • Powered by Gemini & Nano Banana</p>
      </footer>
    </div>
  );
};

export default App;
