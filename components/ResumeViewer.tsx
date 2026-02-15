
import React from 'react';
import { FileText, Type } from 'lucide-react';

interface ResumeViewerProps {
  content: string;
  selectedBullet: string | null;
  onSelectBullet: (bullet: string) => void;
  onContentChange: (content: string) => void;
}

const ResumeViewer: React.FC<ResumeViewerProps> = ({ 
  content, 
  selectedBullet, 
  onSelectBullet,
  onContentChange 
}) => {
  const lines = content.split('\n');

  const isBullet = (line: string) => {
    const trimmed = line.trim();
    return trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•');
  };

  const cleanBullet = (line: string) => {
    return line.trim().replace(/^[-*•]\s*/, '');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600 font-semibold">
          <FileText size={20} />
          <span>Interactive Resume</span>
        </div>
        <div className="text-xs text-slate-400">
          Click any bullet point to decode
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-100 flex justify-center">
        <div className="resume-paper w-full max-w-[816px] bg-white shadow-2xl rounded-sm p-12 overflow-hidden ring-1 ring-slate-200">
          <div className="prose prose-slate max-w-none">
            {lines.length === 1 && lines[0] === '' ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20 border-2 border-dashed border-slate-200 rounded-lg">
                <Type size={48} className="mb-4 opacity-20" />
                <p>Paste your resume text in the sidebar to begin</p>
              </div>
            ) : (
              lines.map((line, idx) => {
                if (isBullet(line)) {
                  const bulletText = cleanBullet(line);
                  const isSelected = selectedBullet === bulletText;
                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectBullet(bulletText)}
                      className={`
                        group relative flex items-start gap-3 py-1 px-3 -mx-3 cursor-pointer rounded transition-all duration-200
                        ${isSelected ? 'bg-indigo-50 text-indigo-900 border-l-4 border-indigo-500 shadow-sm' : 'hover:bg-slate-50 hover:text-indigo-600 border-l-4 border-transparent'}
                      `}
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 group-hover:bg-indigo-400 shrink-0" />
                      <span className="text-sm md:text-base leading-relaxed">{bulletText}</span>
                    </div>
                  );
                }

                // Header Detection
                const isHeader = line.toUpperCase() === line && line.trim().length > 0;
                return (
                  <div 
                    key={idx} 
                    className={`
                      ${isHeader ? 'text-lg font-bold border-b-2 border-slate-900 mt-6 mb-3' : 'mb-2 min-h-[1rem]'}
                      text-slate-800
                    `}
                  >
                    {line}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeViewer;
