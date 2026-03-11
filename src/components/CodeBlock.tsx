import React from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'python' }) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden bg-slate-900 my-4 border border-slate-800 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{language}</span>
        <button
          onClick={copyToClipboard}
          className="p-1.5 rounded-md hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="font-mono text-sm text-slate-200 leading-relaxed">
          {code}
        </code>
      </pre>
    </div>
  );
};
