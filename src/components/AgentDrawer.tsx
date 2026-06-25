/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, ArrowUpRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCard } from '../contexts/CardContext';
import { Link, useLocation } from 'react-router-dom';
import { USER } from '../config';
import { getCuratedHomepagePrompts } from '../config/curatedPrompts';
import { DyRecommendationSlot, performShoppingMuse } from '../lib/dyServerApi';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  recommendations?: DyRecommendationSlot[];
}

export default function AgentDrawer() {
  const { isAgentOpen, setIsAgentOpen, cardType, points, userVariables } = useCard();
  const { pathname } = useLocation();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displayName = userVariables?.name ?? USER.name;
  const displayCardType = userVariables?.cardType ?? cardType;
  const displayPoints = userVariables?.points ?? points;
  const presetPrompts = getCuratedHomepagePrompts(displayCardType, displayPoints);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      text: `Welcome, ${displayName.split(' ')[0]}. I am your assistant for ${displayCardType} card offers. Whether you are looking for dining perks, travel rewards, or cashback offers, let me know what you have in mind and I will find the perfect offers for you.`,
      timestamp: 'Just now',
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isAgentOpen]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length !== 1 || prev[0]?.id !== '1') {
        return prev;
      }

      return [
        {
          ...prev[0],
          text: `Welcome, ${displayName.split(' ')[0]}. I am your Mastercard ${displayCardType} benefit assistant. Whether you are looking for dining perks, travel rewards, or statement credits, let me know what you have in mind and I will find the perfect offers for you.`,
        },
      ];
    });
  }, [displayName, displayCardType]);

  const submitPrompt = async (rawPrompt: string) => {
    const userText = rawPrompt.trim();
    if (!userText) {
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await performShoppingMuse(userText, pathname, cardType, chatId, userVariables);

      if (!result) {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'agent',
            text: 'I could not reach Shopping Muse right now. Please try again.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }

      const flattenedSlots = result.widgets.flatMap((widget) => widget.slots || []);
      const uniqueSlots = Array.from(new Map(flattenedSlots.map((slot) => [slot.sku, slot])).values()).slice(0, 6);

      setChatId((prevChatId) => result.chatId || prevChatId);

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: result.assistant,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendations: uniqueSlots,
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: 'I hit an unexpected error while calling Shopping Muse.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle message sending
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const prompt = input;
    setInput('');
    void submitPrompt(prompt);
  };

  if (!isAgentOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsAgentOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        {/* Drawer slide-out */}
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen lg:w-[48vw] xl:w-[42vw] bg-white flex flex-col shadow-2xl h-full border-l border-outline-variant/10 relative"
        >
          {/* Header */}
          <div className="bg-primary text-white p-6 md:p-8 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary relative">
                <Sparkles size={18} className="animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-primary" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black uppercase tracking-wider">AI Assistant</h3>
                
              </div>
            </div>
            
            <button 
              onClick={() => setIsAgentOpen(false)}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all border border-white/10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-surface-container/30 px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
            <span className="font-sans text-[10px] font-black tracking-widest text-on-surface-variant uppercase">Member: {displayName}</span>
            <span className="font-sans text-[10px] font-black tracking-widest text-on-surface-variant uppercase">{displayCardType} Card</span>
          </div>

          {/* Messages Log */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-surface/30">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-full`}
              >
                <div 
                  className={`p-5 rounded-3xl text-sm leading-relaxed max-w-[85%] font-medium ${
                    msg.sender === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-lg' 
                    : 'bg-white text-primary border border-outline-variant/10 shadow-sm rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                
                <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1.5 px-2">
                  {msg.sender === 'user' ? 'User' : 'Assistant'} • {msg.timestamp}
                </span>

                {/* Optional Recommended Cards rendering */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[90%]">
                    {msg.recommendations.map((rec) => (
                      <div key={rec.sku} className="bg-white rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                        <div className="h-28 relative">
                          {rec.productData.image_url ? (
                            <img src={rec.productData.image_url} className="w-full h-full object-cover" alt={rec.productData.brand || rec.sku} />
                          ) : (
                            <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                              {rec.productData.logo_url ? (
                                <img src={rec.productData.logo_url} className="h-14 w-auto object-contain" alt={rec.productData.brand || rec.sku} />
                              ) : (
                                <span className="font-sans text-xs font-black text-primary uppercase px-2 text-center">{rec.productData.brand || rec.sku}</span>
                              )}
                            </div>
                          )}
                          <div className="absolute top-3 left-3 bg-primary/95 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                            {rec.productData.categories?.[0] ?? 'Offer'}
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-sans font-black text-xs uppercase tracking-tight text-primary leading-tight mb-1 group-hover:text-secondary transition-colors line-clamp-1">{rec.productData.brand || rec.sku}</h4>
                          <p className="text-[10px] text-on-surface-variant line-clamp-2 h-8 leading-snug mb-3 opacity-80">{rec.productData.name}</p>
                          <Link 
                            to={`/offers/${encodeURIComponent(rec.sku)}`}
                            onClick={() => setIsAgentOpen(false)}
                            className="w-full bg-surface-container text-primary hover:bg-secondary hover:text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1"
                          >
                            <span>Claim Offer</span>
                            <ArrowUpRight size={12} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="bg-white border border-outline-variant/10 p-5 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest ml-2">Assistant is searching rewards...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preset recommendations */}
          <div className="px-6 py-4 bg-surface-container/10 border-t border-outline-variant/10">
            <span className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-widest mb-2.5 flex items-center gap-1">
              <HelpCircle size={12} className="text-secondary" /> Suggested Requests:
            </span>
            <div className="flex flex-wrap gap-2">
              {presetPrompts.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    if (isTyping) {
                      return;
                    }
                    setInput('');
                    void submitPrompt(preset.text);
                  }}
                  disabled={isTyping}
                  className="bg-white text-primary border border-outline-variant/10 hover:border-secondary hover:bg-secondary/5 px-4 py-2.5 rounded-xl font-sans text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Input Footer */}
          <form onSubmit={handleSend} className="p-6 md:p-8 border-t border-outline-variant/10 bg-white flex gap-3">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type message here... (e.g. 'I want dining recommendations')"
              className="flex-1 bg-surface-container/50 border-none focus:ring-2 focus:ring-primary/20 px-6 py-4 rounded-2xl text-sm font-sans font-semibold placeholder:text-on-surface-variant/40"
            />
            <button 
              type="submit"
              className="bg-primary text-white hover:bg-secondary px-6 rounded-2xl transition-all shadow-lg flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
