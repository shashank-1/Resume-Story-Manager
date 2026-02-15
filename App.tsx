
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Briefcase, 
  ChevronLeft, 
  ChevronRight, 
  PenLine, 
  BookOpen,
  Github,
  Maximize2,
  Minimize2
} from 'lucide-react';
import ResumeViewer from './components/ResumeViewer';
import DeepDive from './components/DeepDive';
import { DeepDiveData } from './types';
import { decodeBullet } from './services/geminiService';

const DEFAULT_RESUME = `JONATHAN DOE
Software Engineer | San Francisco, CA

PROFESSIONAL EXPERIENCE

TECH SOLUTIONS INC. | Senior Software Engineer
2020 - Present

- Led a cross-functional team of 8 engineers to migrate a legacy monolithic application to a microservices architecture.
- Designed and implemented a real-time data processing pipeline using Apache Kafka, reducing data latency by 45%.
- Optimized database queries and indexing strategies, resulting in a 30% improvement in API response times.
- Orchestrated the deployment of a CI/CD pipeline using GitHub Actions, decreasing release cycles from bi-weekly to daily.

GLOBAL DATA CORP | Full Stack Developer
2018 - 2020

- Developed a customer-facing analytics dashboard using React and D3.js, serving 50,000+ monthly active users.
- Automated repetitive internal workflows using Python scripts, saving the operations team 15+ hours per week.
- Collaborated with product managers to define and ship 12+ new features focused on user engagement.

SKILLS
React, TypeScript, Node.js, PostgreSQL, AWS, Docker, Kubernetes, Python`;

export default function App() {
  const [content, setContent] = useState(DEFAULT_RESUME);
  const [selectedBullet, setSelectedBullet] = useState<string | null>(null);
  const [deepDiveData, setDeepDiveData] = useState<DeepDiveData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSelectBullet = useCallback(async (bullet: string) => {
    if (selectedBullet === bullet) return;
    
    setSelectedBullet(bullet);
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await decodeBullet(bullet);
      setDeepDiveData(result);
    } catch (err) {
      console.error(err);
      setError("Failed to generate deep dive.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedBullet]);

  const toggleEditor = () => setIsEditorOpen(!isEditorOpen);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <BookOpen size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Resume Storyteller</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">AI-Powered Interview Coach</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleEditor}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all
              ${isEditorOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
            `}
          >
            <PenLine size={16} />
            {isEditorOpen ? 'Close Editor' : 'Edit Resume'}
          </button>
          <a href="https://github.com" target="_blank" className="text-slate-400 hover:text-slate-600 transition-colors">
            <Github size={20} />
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Editor Overlay */}
        {isEditorOpen && (
          <div className="absolute inset-0 z-30 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300 p-8 flex justify-center">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-300">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Paste Your Resume</h2>
                <div className="text-xs text-slate-400">Markdown and plain text supported</div>
              </div>
              <textarea
                className="flex-1 p-8 text-slate-700 font-mono text-sm leading-relaxed focus:outline-none resize-none bg-slate-50"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your professional experience here..."
              />
              <div className="p-4 bg-white border-t flex justify-end gap-3">
                <button 
                  onClick={() => setContent(DEFAULT_RESUME)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-slate-600 font-medium"
                >
                  Load Example
                </button>
                <button 
                  onClick={toggleEditor}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Start Storytelling
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className={`transition-all duration-300 border-r ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-1/2'}`}>
            <ResumeViewer 
              content={content} 
              selectedBullet={selectedBullet}
              onSelectBullet={handleSelectBullet}
              onContentChange={setContent}
            />
          </div>

          {/* Collapser Toggle */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all hover:scale-110 hidden md:flex"
            style={{ left: isSidebarCollapsed ? '16px' : '50%' }}
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Right Panel */}
          <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'flex-1' : 'w-1/2'}`}>
            <DeepDive 
              data={deepDiveData} 
              loading={isLoading} 
              error={error} 
            />
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="h-8 bg-white border-t px-6 flex items-center justify-between text-[10px] text-slate-400 font-medium shrink-0 uppercase tracking-widest">
        <div>Powered by Gemini AI</div>
        <div className="flex gap-4">
          <span>{content.split('\n').filter(l => l.trim().startsWith('-')).length} Interactive Bullets</span>
          <span>Interview Ready</span>
        </div>
      </footer>
    </div>
  );
}
