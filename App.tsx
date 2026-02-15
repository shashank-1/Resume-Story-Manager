
import React, { useState, useCallback, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  PenLine, 
  BookOpen,
  Github,
  Upload,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  Globe,
  X
} from 'lucide-react';
import ResumeViewer from './components/ResumeViewer';
import DeepDive from './components/DeepDive';
import { DeepDiveData } from './types';
import { decodeBullet, extractTextFromResumeFile, extractTextFromUrl } from './services/geminiService';

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
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);
    setSelectedBullet(null);
    setDeepDiveData(null);

    try {
      if (file.type === 'text/plain' || file.name.endsWith('.md')) {
        const text = await file.text();
        setContent(text);
      } else {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          try {
            // DOCX MIME type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
            const extractedText = await extractTextFromResumeFile(base64Data, file.type);
            setContent(extractedText);
          } catch (err) {
            setError("AI could not extract text from this format. Please try PDF or plain text.");
            console.error(err);
          } finally {
            setIsParsing(false);
          }
        };
        reader.onerror = () => {
          setError("Failed to read file.");
          setIsParsing(false);
        };
        reader.readAsDataURL(file);
        return;
      }
    } catch (err) {
      setError("An unexpected error occurred during upload.");
      console.error(err);
    } finally {
      if (file.type === 'text/plain' || file.name.endsWith('.md')) {
        setIsParsing(false);
      }
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUrlImport = async () => {
    if (!importUrl) return;
    setIsParsing(true);
    setIsUrlModalOpen(false);
    setError(null);

    try {
      const text = await extractTextFromUrl(importUrl);
      if (text.toLowerCase().includes("cannot access") || text.length < 50) {
        throw new Error("Could not retrieve content. Ensure the link is public.");
      }
      setContent(text);
      setImportUrl('');
    } catch (err) {
      setError("Failed to import from URL. Please ensure the link is publicly accessible or copy-paste your text.");
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

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

        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".txt,.md,.pdf,.png,.jpg,.jpeg,.docx"
          />
          
          <div className="hidden lg:flex items-center bg-slate-100 rounded-full p-1 gap-1">
            <button 
              onClick={triggerFileUpload}
              disabled={isParsing}
              title="Upload PDF, DOCX, or Image"
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white hover:shadow-sm text-slate-600 rounded-full text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Upload size={14} />
              File
            </button>
            <button 
              onClick={() => setIsUrlModalOpen(true)}
              disabled={isParsing}
              title="Import from URL or Google Drive"
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white hover:shadow-sm text-slate-600 rounded-full text-xs font-semibold transition-all disabled:opacity-50"
            >
              <LinkIcon size={14} />
              URL/Drive
            </button>
          </div>

          <button 
            onClick={toggleEditor}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all
              ${isEditorOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
            `}
          >
            <PenLine size={16} />
            <span className="hidden sm:inline">{isEditorOpen ? 'Close' : 'Edit Text'}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* URL Modal */}
        {isUrlModalOpen && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Import from URL</h3>
                  <p className="text-sm text-slate-500 mt-1">Enter a public Google Drive or document link</p>
                </div>
                <button onClick={() => setIsUrlModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="url"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                    placeholder="https://drive.google.com/..."
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
                  />
                </div>
                <button
                  onClick={handleUrlImport}
                  disabled={!importUrl}
                  className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  Fetch & Analyze
                </button>
              </div>
              <p className="mt-6 text-[11px] text-slate-400 text-center leading-relaxed">
                Note: AI access to private files requires a public sharing link. <br/>
                For best results, use the "Upload File" or "Edit Text" feature.
              </p>
            </div>
          </div>
        )}

        {/* Parsing Overlay */}
        {isParsing && (
          <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center text-center max-w-sm">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                <Loader2 size={40} className="animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Analyzing Document</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Our AI is extracting text and structure from your resume. This usually takes just a few seconds.
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-1/2 animate-[loading_2s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        )}

        {/* Editor Overlay */}
        {isEditorOpen && !isParsing && (
          <div className="absolute inset-0 z-30 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300 p-8 flex justify-center">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-300">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Edit Resume Content</h2>
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
                  Save & Analyze
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Split View */}
        <div className="flex-1 flex overflow-hidden">
          <div className={`transition-all duration-300 border-r ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-1/2'}`}>
            <ResumeViewer 
              content={content} 
              selectedBullet={selectedBullet}
              onSelectBullet={handleSelectBullet}
              onContentChange={setContent}
            />
          </div>

          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all hover:scale-110 hidden md:flex"
            style={{ left: isSidebarCollapsed ? '16px' : '50%' }}
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'flex-1' : 'w-1/2'}`}>
            {error && (
              <div className="p-6 m-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 text-red-600">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-1">Import Error</h4>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </div>
            )}
            <DeepDive 
              data={deepDiveData} 
              loading={isLoading} 
              error={null} 
            />
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="h-8 bg-white border-t px-6 flex items-center justify-between text-[10px] text-slate-400 font-medium shrink-0 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLoading || isParsing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          {isParsing ? 'Processing Document...' : isLoading ? 'Decoding Achievement...' : 'System Ready'}
        </div>
        <div className="flex gap-4">
          <span className="hidden sm:inline">Supported: PDF, DOCX, TXT, MD, IMG, DRIVE URL</span>
          <span>{content.split('\n').filter(l => l.trim().startsWith('-')).length} Interactive Bullets</span>
        </div>
      </footer>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
