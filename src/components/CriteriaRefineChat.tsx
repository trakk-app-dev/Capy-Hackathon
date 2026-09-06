'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

const MAX_TURNS = 8;

interface CriteriaRefineChatProps {
  title: string;
  endpoint: '/api/commitments/refine' | '/api/evaluate/refine';
  draft: Record<string, unknown>;
  onDraftUpdate: (next: Record<string, unknown>) => void;
  /** Optional seed assistant line */
  initialAssistant?: string;
}

export default function CriteriaRefineChat({
  title,
  endpoint,
  draft,
  onDraftUpdate,
  initialAssistant = 'Tell me what you like or what feels off — I’ll adjust the criteria.',
}: CriteriaRefineChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initialAssistant ? [{ role: 'assistant', content: initialAssistant }] : []
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userTurns = messages.filter((m) => m.role === 'user').length;
  const atLimit = userTurns >= MAX_TURNS;

  const send = async () => {
    const text = input.trim();
    if (!text || loading || atLimit) return;
    setError('');
    setInput('');
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft, messages: nextMessages }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.draft && typeof data.draft === 'object') {
        onDraftUpdate(data.draft as Record<string, unknown>);
      }
      if (data.assistantMessage) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.assistantMessage }]);
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-near-black/10 bg-white/50 p-3 mb-4">
      <p
        className="text-[10px] uppercase tracking-widest text-near-black/45 mb-2 font-semibold"
        style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
      >
        {title}
      </p>
      <div className="max-h-40 overflow-y-auto space-y-2 mb-2 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xs leading-relaxed rounded-lg px-2.5 py-1.5 ${
                m.role === 'user'
                  ? 'bg-coral/15 text-near-black ml-4'
                  : 'bg-near-black/5 text-near-black/85 mr-4'
              }`}
              style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
            >
              {m.content}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex gap-1 justify-center py-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-coral/60 animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-failure text-[11px] mb-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
          {error}
        </p>
      )}
      {atLimit && (
        <p className="text-[10px] text-near-black/40 mb-2" style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}>
          Chat limit reached — confirm or go back to edit your plan.
        </p>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="e.g. Proof should be a screenshot of the sent email"
          disabled={loading || atLimit}
          className="flex-1 text-xs bg-white rounded-lg px-3 py-2 border border-near-black/10 input-glow placeholder:text-near-black/30"
          style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
        />
        <button
          type="button"
          onClick={send}
          disabled={!input.trim() || loading || atLimit}
          className="shrink-0 bg-near-black text-white text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-40"
          style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal' }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
