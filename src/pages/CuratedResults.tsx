/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Send, Sparkles, MessageSquare, Bot, User } from 'lucide-react';
import { motion } from 'motion/react';
import DyOfferCard from '../components/DyOfferCard';
import { useCard } from '../contexts/CardContext';
import { getCuratedHomepagePrompts } from '../config/curatedPrompts';
import { DyShoppingMuseResult, performShoppingMuse } from '../lib/dyServerApi';

interface MuseMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  result?: DyShoppingMuseResult;
}

export default function CuratedResults() {
  const [searchParams] = useSearchParams();
  const seedPrompt = searchParams.get('prompt') || '';
  const { pathname } = useLocation();
  const { cardType, points, setIsAgentOpen, userVariables } = useCard();

  const [inputVal, setInputVal] = useState(seedPrompt);
  const [messages, setMessages] = useState<MuseMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | undefined>(undefined);

  const runMusePrompt = async (prompt: string) => {
    if (!prompt.trim()) {
      return;
    }

    const userMessage: MuseMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await performShoppingMuse(prompt, pathname, cardType, chatId, userVariables);

      if (!result) {
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-assistant-error`,
            role: 'assistant',
            text: 'Unable to fetch Shopping Muse response right now. Try again.',
          },
        ]);
        return;
      }

      setChatId(result.chatId || chatId);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: result.assistant,
          result,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!seedPrompt.trim()) {
      return;
    }

    void runMusePrompt(seedPrompt);
    // Run once for initial seeded prompt only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = inputVal.trim();
    if (!prompt) {
      return;
    }

    setInputVal('');
    void runMusePrompt(prompt);
  };

  const latestAssistantMessage = [...messages].reverse().find((msg) => msg.role === 'assistant' && msg.result);
  const latestWidgets = latestAssistantMessage?.result?.widgets ?? [];
  const displayName = userVariables?.name;
  const displayPoints = userVariables?.points ?? points;
  const displayTier = userVariables?.cardType ?? cardType;
  const presetPrompts = getCuratedHomepagePrompts(displayTier, displayPoints);

  return (
    <div className="pt-24 min-h-screen bg-surface">
      <section className="bg-white border-b border-outline-variant/10 py-16 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-max-width mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-secondary mb-6 hover:text-primary transition-colors"
          >
            <ChevronLeft size={14} /> Back to home
          </Link>

          <span className="font-sans text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-4 block">
            AI Assistant
          </span>
          <h1 className="text-4xl md:text-5xl text-primary font-black mb-4 tracking-tighter uppercase not-italic">
            Curated Recommendations
          </h1>
          <p className="font-sans text-on-surface-variant text-base max-w-2xl font-light leading-relaxed opacity-70">
            Ask in natural language and get cardholder offers matching your needs.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex items-center bg-surface-container/50 px-6 py-4 rounded-2xl md:rounded-3xl border border-outline-variant/10 w-full max-w-3xl shadow-sm focus-within:border-primary/20 focus-within:ring-2 focus-within:ring-primary/5 transition-all"
          >
            <MessageSquare className="text-on-surface-variant mr-4 shrink-0" size={20} />
            <input
              className="bg-transparent border-none focus:ring-0 text-base w-full p-0 font-sans font-bold placeholder:text-on-surface-variant/30 text-primary"
              placeholder="Ask Shopping Muse..."
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="ml-4 bg-primary text-white hover:bg-secondary disabled:opacity-60 px-6 py-2.5 rounded-xl font-sans text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5"
            >
              <span>{isLoading ? 'Asking' : 'Ask Muse'}</span>
              <Send size={12} />
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 max-w-3xl">
            {presetPrompts.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setInputVal('');
                  void runMusePrompt(preset.text);
                }}
                className="bg-white text-primary border border-outline-variant/10 hover:border-secondary hover:bg-secondary/5 px-4 py-2.5 rounded-xl font-sans text-[10px] font-black uppercase tracking-wider transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 bg-white rounded-3xl border border-outline-variant/10 shadow-sm p-5 md:p-6 h-fit">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/10">
              <span className="font-sans text-[10px] font-black uppercase tracking-widest text-secondary">Conversation</span>
              <span className="font-sans text-[10px] font-black uppercase tracking-widest text-primary">{displayTier}</span>
            </div>

            {displayName && typeof displayPoints === 'number' && (
              <div className="mt-4 rounded-2xl border border-outline-variant/10 bg-surface-container/30 px-4 py-3">
                <p className="font-sans text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{displayName}</p>
                <p className="font-sans text-[10px] font-black uppercase tracking-widest text-primary mt-1">
                  {displayTier} Status
                </p>
              </div>
            )}

            <div className="mt-5 space-y-4 max-h-[560px] overflow-y-auto pr-1">
              {messages.length === 0 && (
                <p className="font-sans text-xs text-on-surface-variant opacity-70">
                  Start by asking a question like “Which culture activities are available?”
                </p>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs font-sans leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-surface-container/50 text-primary border border-outline-variant/10 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User size={14} />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-on-surface-variant/70 text-xs font-sans">
                  <Sparkles size={12} className="text-secondary animate-pulse" />
                  AI Assistant is generating recommendations...
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 min-w-0">
            <div className="flex justify-between items-center mb-8 border-b border-outline-variant/10 pb-4">
              <span className="font-sans text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/5 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Sparkles size={12} className="text-secondary" />
                {latestWidgets.length > 0 ? 'Muse Recommendations' : 'No recommendations yet'}
              </span>

              <button
                onClick={() => setIsAgentOpen(true)}
                className="font-sans text-[10px] font-black uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors"
              >
                Open Agent Drawer
              </button>
            </div>

            {latestWidgets.length === 0 && !isLoading ? (
              <div className="text-center py-20 bg-white/50 border border-dashed border-outline-variant/30 rounded-4xl max-w-xl mx-auto px-8">
                <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-on-surface-variant mb-6">
                  <Sparkles size={28} className="opacity-45" />
                </div>
                <h4 className="text-lg font-black uppercase text-primary mb-2">No widget recommendations yet</h4>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed opacity-70 mb-8">
                  Ask the AI Assistant for offers by intent, category, or country.
                </p>
              </div>
            ) : latestWidgets.length === 0 && isLoading ? (
              <div className="space-y-10">
                {[...Array(3)].map((_, widgetIdx) => (
                  <div key={`skeleton-widget-${widgetIdx}`}>
                    <div className="h-8 bg-surface-container/50 rounded-lg mb-5 w-48 animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {[...Array(3)].map((_, slotIdx) => (
                        <div key={`skeleton-card-${slotIdx}`} className="bg-white rounded-2xl border border-outline-variant/10 p-4 animate-pulse">
                          <div className="h-40 bg-surface-container/50 rounded-xl mb-4" />
                          <div className="h-4 bg-surface-container/50 rounded mb-3" />
                          <div className="h-4 bg-surface-container/50 rounded mb-4 w-5/6" />
                          <div className="h-10 bg-surface-container/50 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-10">
                {latestWidgets.map((widget, widgetIdx) => (
                  <div key={`${widget.title || 'widget'}-${widgetIdx}`}>
                    <h3 className="text-xl md:text-2xl font-black text-primary uppercase tracking-tight mb-5">
                      {widget.title || 'Recommended Offers'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      {widget.slots.map((slot, slotIdx) => (
                        <motion.div
                          key={`${slot.sku}-${slotIdx}`}
                          initial={{ opacity: 0, y: 25 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: Math.min(slotIdx, 8) * 0.04, ease: 'easeOut' }}
                        >
                          <DyOfferCard slot={slot} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {latestAssistantMessage?.result?.support === false && (
          <div className="mt-8 text-center">
            <p className="font-sans text-xs text-on-surface-variant opacity-70 mb-3">
              If the AI Assistant was unable to find any relevant recommendations for you, try asking a different question or go to the search page to browse all offers.
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-primary text-white hover:bg-secondary px-5 py-2.5 rounded-xl font-sans text-[10px] font-black uppercase tracking-widest transition-all shadow-md"
            >
              Go to Search <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
