// src/components/ai/AIStory.tsx
'use client';

import React, { useState } from 'react';
import type { AIAnalysisResponse } from '@/types/spotify';

interface AIStoryProps {
  analysis: AIAnalysisResponse | null;
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
}

/** Renders **bold** and *italic* markdown as styled spans */
function renderMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-[#00BFFF] font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="text-[#00BFFF]/75 not-italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

const AIStory: React.FC<AIStoryProps> = ({ analysis }) => {
  const [showFull, setShowFull] = useState(false);

  if (!analysis) return null;

  const raw = analysis.enhanced?.analysisParagraph as string | undefined;
  const lifeContext = analysis.enhanced?.lifeContext as string | undefined;
  if (!raw) return null;

  const paragraphs = raw.split(/\n\n+/).map(p => p.trim()).filter(Boolean);

  // Extract first sentence as pull quote
  const firstPara = paragraphs[0] || '';
  const pullQuoteMatch = firstPara.match(/^([^.!?]+[.!?])/);
  const pullQuote = pullQuoteMatch ? stripMarkdown(pullQuoteMatch[0]) : stripMarkdown(firstPara.split(' ').slice(0, 12).join(' ') + '…');

  return (
    <div className="rounded-2xl overflow-hidden border border-white/8"
      style={{ background: 'linear-gradient(135deg, #080808, #0a0814)' }}>

      {/* Pull quote — the hero */}
      <div className="px-6 pt-7 pb-5 border-b border-white/5">
        <p className="text-xs font-medium text-[#00BFFF]/60 mb-4">Your story</p>
        <div className="relative pl-5">
          {/* Left accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
            style={{ background: 'linear-gradient(to bottom, #00BFFF, #9B8BF4)' }} />
          <p className="text-white text-xl font-semibold leading-snug">
            &ldquo;{pullQuote}&rdquo;
          </p>
        </div>
      </div>

      {/* Life context callout — if present */}
      {lifeContext && (
        <div className="mx-6 mt-5 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(155,139,244,0.08)', border: '1px solid rgba(155,139,244,0.2)' }}>
          <p className="text-xs text-[#9B8BF4]/80 leading-relaxed">
            💭 {stripMarkdown(lifeContext)}
          </p>
        </div>
      )}

      {/* Full story — collapsed by default */}
      <div className="px-6 pb-5 mt-5">
        {showFull ? (
          <div className="space-y-3">
            {paragraphs.map((para, i) => (
              <p key={i} className={`leading-relaxed text-sm ${i === 0 ? 'text-white/85' : 'text-white/65'}`}>
                {renderMarkdown(para)}
              </p>
            ))}
            <button
              onClick={() => setShowFull(false)}
              className="mt-2 text-xs text-[#00BFFF]/50 hover:text-[#00BFFF] transition-colors"
            >
              ↑ Show less
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowFull(true)}
            className="text-xs font-medium text-[#00BFFF]/60 hover:text-[#00BFFF] transition-colors flex items-center gap-1.5"
          >
            Read full story ↓
          </button>
        )}
      </div>

    </div>
  );
};

export default AIStory;
