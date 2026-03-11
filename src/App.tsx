import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Code2, 
  BookOpen, 
  Terminal, 
  ChevronRight, 
  Sparkles, 
  Send,
  Loader2,
  History,
  Info,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translateToPython, getPythonReference, PythonReference } from './services/geminiService';
import { CodeBlock } from './components/CodeBlock';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COMMON_TOPICS = [
  "List Comprehensions",
  "Decorators",
  "Generators",
  "Context Managers",
  "Dunder Methods",
  "Async/Await",
  "Type Hinting",
  "Data Classes",
  "Lambda Functions",
  "Error Handling"
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'assistant' | 'reference'>('assistant');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [refTopic, setRefTopic] = useState('');
  const [reference, setReference] = useState<PythonReference | null>(null);
  const [history, setHistory] = useState<{prompt: string, result: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result, history]);

  const handleTranslate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    try {
      const code = await translateToPython(prompt);
      setResult(code);
      setHistory(prev => [{ prompt, result: code }, ...prev].slice(0, 10));
      setPrompt('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchReference = async (topic: string) => {
    setLoading(true);
    setRefTopic(topic);
    try {
      const ref = await getPythonReference(topic);
      setReference(ref);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Terminal className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                PyLogic<span className="text-yellow-500">Assistant</span>
              </span>
            </div>
            
            <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setActiveTab('assistant')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                  activeTab === 'assistant' ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <Sparkles size={16} />
                Logic Assistant
              </button>
              <button
                onClick={() => setActiveTab('reference')}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                  activeTab === 'reference' ? "bg-yellow-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                )}
              >
                <BookOpen size={16} />
                Reference
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input/Content */}
          <div className="lg:col-span-8 space-y-6">
            {activeTab === 'assistant' ? (
              <div className="space-y-6">
                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Code2 className="text-blue-400" size={20} />
                    Describe your logic
                  </h2>
                  <form onSubmit={handleTranslate} className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., 'How do I read a CSV file and filter rows where age is greater than 25?'"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 pr-12 min-h-[120px] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none text-slate-200 placeholder:text-slate-600"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleTranslate();
                        }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={loading || !prompt.trim()}
                      className="absolute bottom-4 right-4 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg transition-all text-white shadow-lg shadow-blue-600/20"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                  </form>
                  <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                    <Info size={12} />
                    Tip: Press Enter to generate code. Shift+Enter for new line.
                  </p>
                </section>

                <AnimatePresence mode="wait">
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                          <Terminal size={16} className="text-emerald-400" />
                          Generated Python Logic
                        </h3>
                      </div>
                      <CodeBlock code={result} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-6">
                <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Search className="text-yellow-400" size={20} />
                    Python Quick Reference
                  </h2>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={refTopic}
                      onChange={(e) => setRefTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFetchReference(refTopic)}
                      placeholder="Search any Python topic (e.g., 'decorators', 'list slicing')..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all text-slate-200 placeholder:text-slate-600"
                    />
                    <button
                      onClick={() => handleFetchReference(refTopic)}
                      disabled={loading || !refTopic.trim()}
                      className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl transition-all text-white font-medium shadow-lg shadow-yellow-600/20"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : "Search"}
                    </button>
                  </div>
                  
                  <div className="mt-6 flex flex-wrap gap-2">
                    {COMMON_TOPICS.map(topic => (
                      <button
                        key={topic}
                        onClick={() => handleFetchReference(topic)}
                        className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </section>

                <AnimatePresence mode="wait">
                  {reference && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-xl"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500 mb-1 block">
                            {reference.category}
                          </span>
                          <h3 className="text-2xl font-bold text-white">{reference.title}</h3>
                        </div>
                        <div className="p-3 bg-yellow-500/10 rounded-xl">
                          <BookOpen className="text-yellow-500" size={24} />
                        </div>
                      </div>
                      
                      <p className="text-slate-400 leading-relaxed mb-8 text-lg">
                        {reference.description}
                      </p>

                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                          <Code2 size={16} className="text-yellow-500" />
                          Implementation Example
                        </h4>
                        <CodeBlock code={reference.code} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* History / Recent */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-slate-400">
                <History size={16} />
                Recent Logic
              </h3>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-600">No recent activity</p>
                  </div>
                ) : (
                  history.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveTab('assistant');
                        setResult(item.result);
                      }}
                      className="w-full text-left p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-blue-500/50 transition-all group"
                    >
                      <p className="text-xs text-slate-400 line-clamp-2 group-hover:text-slate-200 transition-colors">
                        {item.prompt}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-slate-600 font-mono">Python</span>
                        <ChevronRight size={12} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Learning Resources */}
            <section className="bg-gradient-to-br from-blue-600/10 to-yellow-600/10 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-slate-200">
                <ExternalLink size={16} className="text-blue-400" />
                Learning Resources
              </h3>
              <ul className="space-y-3">
                {[
                  { name: "Official Python Docs", url: "https://docs.python.org/3/" },
                  { name: "Real Python", url: "https://realpython.com/" },
                  { name: "Python Weekly", url: "https://www.pythonweekly.com/" },
                  { name: "PyPI Packages", url: "https://pypi.org/" }
                ].map(link => (
                  <li key={link.name}>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-sm text-slate-400 hover:text-white transition-colors py-1 group"
                    >
                      {link.name}
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            {/* Footer Info */}
            <div className="px-6 py-4 text-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-2">
                Powered by Gemini AI
              </p>
              <div className="flex justify-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse delay-75" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-150" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
