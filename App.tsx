import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Layers, Image as ImageIcon, Sparkles, Download, Trash2, XCircle, Key, ChevronLeft, ChevronRight } from 'lucide-react';

import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ImageCanvas from './components/ImageCanvas';
import StyleSelector from './components/StyleSelector';
import { StickerJob, ProcessingStatus, STYLES } from './types';
import { generateSticker } from './services/geminiService';

const MAX_BATCH_SIZE = 6;

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [jobs, setJobs] = useState<StickerJob[]>([]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [activeJobIndex, setActiveJobIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleFilesSelected = (files: File[]) => {
    const newJobs: StickerJob[] = files.map(file => ({
      id: uuidv4(),
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
      status: ProcessingStatus.IDLE
    }));

    if (mode === 'single') {
      // Replace existing
      clearAll();
      setJobs([newJobs[0]]);
      setActiveJobIndex(0);
    } else {
      // Append but limit total
      setJobs(prev => {
        const combined = [...prev, ...newJobs];
        return combined.slice(0, MAX_BATCH_SIZE);
      });
      // If we added new files and didn't have any, set index to 0
      if (jobs.length === 0 && newJobs.length > 0) {
        setActiveJobIndex(0);
      }
    }
    setErrorMsg(null);
  };

  const handleRemoveCurrentJob = () => {
    if (jobs.length === 0) return;
    
    const currentJob = jobs[activeJobIndex];
    URL.revokeObjectURL(currentJob.previewUrl);
    
    const newJobs = jobs.filter((_, index) => index !== activeJobIndex);
    setJobs(newJobs);
    
    // Adjust index
    if (newJobs.length === 0) {
      setActiveJobIndex(0);
    } else if (activeJobIndex >= newJobs.length) {
      setActiveJobIndex(newJobs.length - 1);
    }
  };

  const handleCanvasSave = (markedUrl: string | null) => {
    if (jobs.length === 0) return;
    setJobs(prev => prev.map((job, idx) => 
      idx === activeJobIndex ? { ...job, markedUrl: markedUrl || undefined } : job
    ));
  };

  const processJobs = async () => {
    if (jobs.length === 0) return;
    if (!apiKey) {
      setErrorMsg("Please enter a valid Gemini API Key first.");
      return;
    }
    
    setIsProcessing(true);
    setErrorMsg(null);

    // Update statuses
    setJobs(prev => prev.map(j => ({ ...j, status: ProcessingStatus.PROCESSING, error: undefined })));

    try {
      const promises = jobs.map(async (job) => {
        try {
          // Use marked URL (drawing) if available, otherwise original file
          const input = job.markedUrl || job.originalFile;
          const hasDrawing = !!job.markedUrl;

          const stickerUrl = await generateSticker(apiKey, input, selectedStyle, hasDrawing);
          
          return { id: job.id, success: true, url: stickerUrl };
        } catch (err: any) {
          const msg = err.message || "Failed to generate sticker";
          return { id: job.id, success: false, error: msg };
        }
      });

      const results = await Promise.all(promises);

      setJobs(prev => prev.map(job => {
        const res = results.find(r => r.id === job.id);
        if (res && res.success && res.url) {
          return { ...job, status: ProcessingStatus.COMPLETED, resultUrl: res.url };
        } else if (res && !res.success) {
          return { ...job, status: ProcessingStatus.FAILED, error: res.error };
        }
        return job;
      }));

    } catch (e: any) {
        setErrorMsg("A global error occurred during processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    jobs.forEach(j => URL.revokeObjectURL(j.previewUrl));
    setJobs([]);
    setActiveJobIndex(0);
    setErrorMsg(null);
  };

  const activeJob = jobs[activeJobIndex];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-8">
        
        {/* API Key Section */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
             <Key className="w-5 h-5 text-brand-500" />
             <input 
               type="password" 
               placeholder="Enter your Gemini API Key here..." 
               value={apiKey}
               onChange={(e) => setApiKey(e.target.value)}
               className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all dark:text-white"
             />
          </div>
          <div className="text-xs text-slate-400 mt-2 ml-8">
            Requires Google Cloud Project API Key with billing enabled.
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center">
          <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex">
            <button
              onClick={() => { setMode('single'); clearAll(); }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'single' 
                  ? 'bg-brand-500 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Single Mode
              </div>
            </button>
            <button
              onClick={() => { setMode('batch'); clearAll(); }}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'batch' 
                  ? 'bg-brand-500 text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Batch Mode (Max 6)
              </div>
            </button>
          </div>
        </div>

        {/* Setup Stage */}
        {jobs.length === 0 ? (
           <UploadArea 
             onFilesSelected={handleFilesSelected} 
             maxFiles={mode === 'single' ? 1 : MAX_BATCH_SIZE} 
           />
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            
            {/* Style Selector */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
               <StyleSelector 
                   selectedStyle={selectedStyle} 
                   onSelect={setSelectedStyle}
                   disabled={isProcessing}
               />
            </div>

            {errorMsg && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-4 rounded-xl flex items-center gap-2 border border-red-200 dark:border-red-800 animate-in slide-in-from-top-2">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Main Editor / Viewer */}
            {activeJob && (
               <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                   {/* Card Header: Navigation & Status */}
                   <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Image {activeJobIndex + 1} of {jobs.length}
                          </span>
                          {activeJob.status === ProcessingStatus.COMPLETED && (
                             <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-0.5 rounded-full font-medium border border-green-200 dark:border-green-800">
                               Completed
                             </span>
                          )}
                          {activeJob.status === ProcessingStatus.FAILED && (
                             <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-2 py-0.5 rounded-full font-medium border border-red-200 dark:border-red-800">
                               Failed
                             </span>
                          )}
                       </div>
                       
                       <div className="flex items-center gap-2">
                           <button 
                             onClick={() => setActiveJobIndex(Math.max(0, activeJobIndex - 1))}
                             disabled={activeJobIndex === 0}
                             className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                           >
                              <ChevronLeft className="w-5 h-5" />
                           </button>
                           <button 
                             onClick={() => setActiveJobIndex(Math.min(jobs.length - 1, activeJobIndex + 1))}
                             disabled={activeJobIndex === jobs.length - 1}
                             className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                           >
                              <ChevronRight className="w-5 h-5" />
                           </button>
                           <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-2"></div>
                           <button 
                             onClick={handleRemoveCurrentJob}
                             className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                             title="Remove image"
                           >
                             <Trash2 className="w-5 h-5" />
                           </button>
                       </div>
                   </div>

                   {/* Content Area */}
                   <div className="p-6 min-h-[400px] flex items-center justify-center bg-slate-100 dark:bg-slate-900/50">
                       {activeJob.status === ProcessingStatus.COMPLETED && activeJob.resultUrl ? (
                           <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                <img 
                                    src={activeJob.resultUrl} 
                                    alt="Sticker Result" 
                                    className="max-h-[400px] w-auto drop-shadow-2xl mb-6"
                                />
                                <a 
                                    href={activeJob.resultUrl} 
                                    download={`sticker-${activeJob.id}.png`}
                                    className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-full shadow-lg font-medium transition-all transform hover:scale-105"
                                >
                                    <Download className="w-4 h-4" /> Download Sticker
                                </a>
                           </div>
                       ) : activeJob.status === ProcessingStatus.FAILED ? (
                           <div className="text-center p-8 max-w-md">
                               <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                               <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Generation Failed</h4>
                               <p className="text-slate-500">{activeJob.error || "Unknown error occurred"}</p>
                           </div>
                       ) : (
                           <div className={`w-full ${isProcessing ? "pointer-events-none opacity-50 blur-[1px] transition-all" : ""}`}>
                               <ImageCanvas 
                                 key={activeJob.id} // Force re-mount on change
                                 imageUrl={activeJob.previewUrl} 
                                 onSave={handleCanvasSave}
                                 isActive={!isProcessing}
                               />
                               {!isProcessing && (
                                 <p className="text-center text-slate-500 text-sm mt-4">
                                   Optional: Draw a circle over the subject to guide the AI
                                 </p>
                               )}
                           </div>
                       )}
                   </div>
               </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 pb-12">
                <button
                    onClick={processJobs}
                    disabled={isProcessing || !apiKey}
                    className={`
                        w-full py-4 px-6 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-3 text-lg transition-all transform
                        ${isProcessing || !apiKey
                            ? 'bg-slate-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-brand-600 to-purple-700 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98]'}
                    `}
                >
                    {isProcessing ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Generating Stickers...
                        </>
                    ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          Generate Stickers {jobs.length > 1 && `(${jobs.length})`}
                        </>
                    )}
                </button>
                {!apiKey && (
                  <p className="text-center text-red-500 text-sm mt-3">
                    Please enter API Key to proceed
                  </p>
                )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;