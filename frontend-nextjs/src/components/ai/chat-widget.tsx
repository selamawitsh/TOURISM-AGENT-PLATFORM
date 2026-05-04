'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AI_URL = 'https://ai-service-06yq.onrender.com/api/v1';

interface Message {
  role: 'user' | 'ai';
  content: string;
  data?: any;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! I can help you with:\n- Parse travel preferences\n- Generate itineraries\n- Recommend destinations\n- Enhance destination info\n- Smart booking advice\n- Dynamic pricing insights\n\nWhat would you like?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'parse' | 'itinerary' | 'recommendations' | 'enhance' | 'booking' | 'pricing'>('recommendations');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let endpoint = '';
      let body: any = { text: input };

      switch (mode) {
        case 'parse':
          endpoint = '/ai/parse';
          break;
        case 'itinerary':
          endpoint = '/ai/itinerary';
          break;
        case 'recommendations':
          endpoint = '/ai/recommendations';
          break;
        case 'enhance':
          endpoint = '/ai/enhance-destination';
          body = { destination_id: '', destination_name: input, city: '', country: '', description: input };
          break;
        case 'booking':
          endpoint = '/ai/smart-booking-recommendation';
          body = { destination_id: '', destination_name: input, budget: 500, travel_date: '2026-06-01', group_size: 2 };
          break;
        case 'pricing':
          endpoint = '/ai/dynamic-pricing';
          body = { destination_id: '', destination_name: input, season: 'peak', base_price: 500 };
          break;
      }

      const res = await fetch(`${AI_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      
      let responseText = '';
      if (data.results) {
        responseText = formatResults(data.results);
      } else if (data.recommendations) {
        responseText = formatResults(data.recommendations);
      } else if (data.history) {
        responseText = `${data.history}\n\nHotels: ${data.hotels?.map((h:any) => h.name).join(', ') || 'N/A'}\nBest time: ${data.weather?.best_time || 'October to March'}\nTips: ${data.tips?.slice(0,3).join('; ') || 'N/A'}`;
      } else if (data.best_deals) {
        responseText = `Recommended: ${data.recommended_booking?.message || ''}\nDeals: ${data.best_deals?.map((d:any) => d.description).join('; ') || ''}\nTips: ${data.tips?.join('; ') || ''}`;
      } else if (data.base_price) {
        responseText = `Base: $${data.base_price}, Peak: $${data.peak_season}, Off-season: $${data.off_season}\nDemand: ${data.demand_level}\nTrend: ${data.price_trend}`;
      } else if (data.error) {
        responseText = `Error: ${data.error}`;
      } else {
        responseText = JSON.stringify(data, null, 2);
      }

      setMessages(prev => [...prev, { role: 'ai', content: responseText }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I could not process that. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const formatResults = (results: any[]): string => {
    if (!results || results.length === 0) return 'No results found.';
    return results.map((r: any) => {
      if (typeof r === 'string') return r;
      return r.name || r.title || r.description || JSON.stringify(r);
    }).join('\n\n');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all"
        title="AI Travel Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="font-semibold">AI Travel Assistant</h3>
              </div>
              <div className="flex gap-1 flex-wrap">
                {[
                  { key: 'recommendations', label: 'Recommend' },
                  { key: 'parse', label: 'Parse' },
                  { key: 'itinerary', label: 'Itinerary' },
                  { key: 'enhance', label: 'Enhance' },
                  { key: 'booking', label: 'Booking' },
                  { key: 'pricing', label: 'Pricing' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMode(m.key as any)}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      mode === m.key
                        ? 'bg-white text-emerald-700 font-medium'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-md'
                      : 'bg-white border text-gray-700 rounded-bl-md shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border rounded-2xl px-4 py-3 shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask for ${mode}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="p-2.5 bg-emerald-700 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
