// src/components/ai/AIStory.tsx
import React from 'react';
import type { AIAnalysisResponse } from '@/types/spotify';

interface AIStoryProps {
  analysis: AIAnalysisResponse | null;
}

/** Converts **bold** and *italic* markdown into styled React spans. */
function renderMarkdown(text: string): React.ReactNode[] {
  // Split on **bold** and *italic* tokens
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-[#00BFFF] font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="text-[#00BFFF]/80 not-italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

const AIStory: React.FC<AIStoryProps> = ({ analysis }) => {
  if (!analysis) return null;

  const { analysisParagraph } = analysis.enhanced || {};
  const raw = analysisParagraph as string | undefined;
  if (!raw) return null;

  const paragraphs = raw.split(/\n\n+/).filter(Boolean);

  return (
    <div className="bg-[#080808] rounded-xl border border-[#00BFFF]/15 overflow-hidden mb-4">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#00BFFF]/10 flex items-center gap-3">
        <span className="text-2xl">🎵</span>
        <h3 className="text-lg font-bold text-white">Your Musical Story</h3>
        <span className="ml-auto text-xs text-[#00BFFF]/50 font-medium uppercase tracking-wider">Mistral AI</span>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Decorative opening quote */}
        <div className="text-[#00BFFF]/20 text-6xl font-serif leading-none select-none -mb-2">&ldquo;</div>

        {paragraphs.map((para, i) => (
          <p
            key={i}
            className={`leading-relaxed ${
              i === 0
                ? 'text-white text-base font-medium'
                : 'text-gray-300 text-sm'
            }`}
          >
            {renderMarkdown(para)}
          </p>
        ))}

        {/* Bottom accent line */}
        <div className="pt-3 border-t border-[#00BFFF]/10">
          <p className="text-xs text-[#00BFFF]/50 text-right">
            ✦ Crafted by Mistral AI based on your listening data
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIStory;
