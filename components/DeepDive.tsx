
import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  BarChart3, 
  MessageSquare, 
  Loader2, 
  ChevronRight,
  HelpCircle,
  Quote
} from 'lucide-react';
import { DeepDiveData, TabType } from '../types';

interface DeepDiveProps {
  data: DeepDiveData | null;
  loading: boolean;
  error: string | null;
}

const DeepDive: React.FC<DeepDiveProps> = ({ data, loading, error }) => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.STAR);

  if (!data && !loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center max-w-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
            <Sparkles size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Unlock the Story</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Select an achievement on the left. Our AI will break it down into interview-ready narratives and metrics.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
        <p className="text-slate-600 font-medium animate-pulse">Decoding achievement...</p>
        <p className="text-slate-400 text-xs mt-2 italic">Refining STAR components & generating metrics</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-red-500">
        <p>Something went wrong. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Tab Navigation */}
      <div className="p-4 bg-white border-b shadow-sm sticky top-0 z-10">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Deep Dive Decoder</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab(TabType.STAR)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === TabType.STAR ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Target size={16} />
            STAR
          </button>
          <button
            onClick={() => setActiveTab(TabType.METRICS)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === TabType.METRICS ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart3 size={16} />
            Metrics
          </button>
          <button
            onClick={() => setActiveTab(TabType.NARRATIVE)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === TabType.NARRATIVE ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare size={16} />
            Narrative
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Selected Bullet Quote */}
        <div className="relative group">
          <div className="absolute -left-2 top-0 bottom-0 w-1 bg-indigo-500 rounded-full" />
          <p className="text-slate-700 font-medium leading-relaxed italic pl-4">
            "{data.bullet}"
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === TabType.STAR && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {(Object.keys(data.star) as Array<keyof typeof data.star>).map((key) => (
              <div key={key} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                    {key[0]}
                  </span>
                  <h4 className="font-bold text-slate-900 capitalize">{key}</h4>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{data.star[key]}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === TabType.METRICS && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-2 gap-4">
              {data.metrics.map((metric, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <div className="text-2xl font-black text-indigo-600 mb-1">{metric.value}</div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-tighter">{metric.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-amber-600">
                <HelpCircle size={18} />
                <h4 className="font-bold">Follow-up Questions</h4>
              </div>
              <ul className="space-y-3">
                {data.questions.map((q, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg hover:bg-slate-100 transition-colors cursor-default">
                    <ChevronRight size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === TabType.NARRATIVE && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <Quote className="absolute top-4 right-4 text-slate-50 opacity-10" size={120} />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider mb-6">
                  Behind the Scenes
                </div>
                <p className="text-slate-700 leading-8 text-lg font-serif">
                  {data.narrative}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeepDive;
