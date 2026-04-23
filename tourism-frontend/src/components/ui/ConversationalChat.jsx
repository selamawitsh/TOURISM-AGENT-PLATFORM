import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, MessageSquare, Trash2, Calendar, MapPin, DollarSign, 
  Compass, Star, Clock, Users, ChevronRight, Sparkles, 
  Heart, TrendingUp, Coffee, Mountain, Sun, Moon, Bot, User,
  Wallet, Info, CheckCircle, AlertCircle
} from 'lucide-react';
import { aiAPI } from '../../services/api';

// ==================== UI Components ====================

const Txt = ({ children }) => (
  <div className="whitespace-pre-wrap text-sm leading-relaxed">{children}</div>
);

const MessageBubble = ({ who, children }) => (
  <div className={`flex ${who === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
    <div className={`flex items-start gap-2 max-w-[85%] ${who === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${who === 'user' ? 'bg-emerald-600' : 'bg-gray-200'}`}>
        {who === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-gray-600" />}
      </div>
      <div className={`rounded-2xl px-4 py-2.5 ${who === 'user' ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-100 shadow-sm text-gray-700'}`}>
        {children}
      </div>
    </div>
  </div>
);

// ==================== Preference Card ====================

const PreferenceCard = ({ prefs }) => {
  if (!prefs || Object.keys(prefs).length === 0) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 mb-2"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-emerald-600" />
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Parsed Preferences</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {prefs.destination && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs">
            <MapPin className="w-3 h-3 text-emerald-600" />
            {prefs.destination}
          </span>
        )}
        {prefs.durationDays && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs">
            <Calendar className="w-3 h-3 text-emerald-600" />
            {prefs.durationDays} days
          </span>
        )}
        {prefs.budgetUSD && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs">
            <Wallet className="w-3 h-3 text-emerald-600" />
            ${prefs.budgetUSD}
          </span>
        )}
        {prefs.interests && Array.isArray(prefs.interests) && prefs.interests.map((i, idx) => (
          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs">
            <Heart className="w-3 h-3 text-rose-500" />
            {i}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

// ==================== Recommendations View ====================

const RecommendationsView = ({ items = [] }) => {
  if (!items.length) return <Txt>No recommendations found. Try a different destination!</Txt>;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-emerald-600" />
        <span className="text-xs font-semibold text-gray-500 uppercase">Recommended for you</span>
      </div>
      {items.map((item, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="group bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-all cursor-pointer"
          onClick={() => window.open(`/destinations/${item.name?.toLowerCase().replace(/\s+/g, '-')}`, '_blank')}
        >
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-800">{item.name || item.title || item.destination_name}</div>
              {item.price && (
                <div className="flex items-center gap-1 mt-1">
                  <DollarSign className="w-3 h-3 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-600">${item.price}</span>
                  <span className="text-xs text-gray-400">per person</span>
                </div>
              )}
              {item.rating && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-gray-500">{item.rating}</span>
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {item.snippet || item.summary || item.description || item.reason || 'Explore this amazing destination'}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ==================== Itinerary View ====================

const ItineraryView = ({ itinerary = {} }) => {
  // Handle different response formats from backend
  let days = [];
  let title = itinerary.title || itinerary.destination;
  let summary = itinerary.summary;
  let budget = itinerary.budget || itinerary.budgetUSD;
  let tips = itinerary.tips || [];
  
  // Handle { days: [...] } format
  if (itinerary.days && Array.isArray(itinerary.days)) {
    days = itinerary.days;
  }
  // Handle { itinerary: [...] } format
  else if (itinerary.itinerary && Array.isArray(itinerary.itinerary)) {
    days = itinerary.itinerary.map((item, idx) => ({
      day: item.day || idx + 1,
      title: item.title,
      activities: item.plan || item.activities || [item.description || item.plan],
      description: item.description,
      meals: item.meals,
      accommodation: item.accommodation
    }));
  }
  // Handle array format directly
  else if (Array.isArray(itinerary)) {
    days = itinerary.map((item, idx) => ({
      day: item.day || idx + 1,
      title: item.title,
      activities: item.plan || item.activities || [item.description],
      description: item.description
    }));
  }
  
  if (!days.length && !title) {
    // Try to extract raw text
    if (itinerary.raw || itinerary.message) {
      return <Txt>{itinerary.raw || itinerary.message}</Txt>;
    }
    if (typeof itinerary === 'string') {
      return <Txt>{itinerary}</Txt>;
    }
    return <Txt>No itinerary data available. Please try again.</Txt>;
  }
  
  return (
    <div className="space-y-3">
      {title && (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
      )}
      
      {summary && (
        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">{summary}</p>
      )}
      
      <div className="space-y-3">
        {days.map((day, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="border-l-2 border-emerald-200 pl-3 py-1"
          >
            <div className="font-semibold text-sm text-emerald-700">
              {day.title ? `Day ${day.day || idx + 1}: ${day.title}` : `Day ${day.day || idx + 1}`}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {Array.isArray(day.activities) 
                ? day.activities.map((a, i) => (
                    <div key={i} className="flex items-start gap-1 mt-0.5">
                      <span className="text-emerald-500">•</span> 
                      <span>{a}</span>
                    </div>
                  ))
                : day.plan || day.description || day.notes || 'Activities to be planned'
              }
            </div>
            {day.meals && Array.isArray(day.meals) && (
              <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                <Coffee className="w-3 h-3" />
                <span>{day.meals.join(' • ')}</span>
              </div>
            )}
            {day.accommodation && (
              <div className="mt-0.5 text-xs text-gray-400">
                🏨 {day.accommodation}
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {budget && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
          <Wallet className="w-3 h-3 text-emerald-600" />
          <span className="text-xs text-gray-500">Estimated budget: ${budget}</span>
        </div>
      )}
      
      {tips.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 mb-1">
            <Info className="w-3 h-3 text-emerald-600" />
            <span className="text-xs font-medium text-gray-500">Travel Tips</span>
          </div>
          <div className="space-y-0.5">
            {tips.map((tip, i) => (
              <div key={i} className="text-xs text-gray-400 flex items-start gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Rate Limit Warning ====================

const RateLimitWarning = ({ onDismiss }) => (
  <motion.div 
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-amber-50 border border-amber-200 rounded-xl p-2 mb-2 flex items-center justify-between"
  >
    <div className="flex items-center gap-2">
      <AlertCircle className="w-4 h-4 text-amber-600" />
      <span className="text-xs text-amber-700">Rate limit reached. Waiting 60 seconds...</span>
    </div>
    <button onClick={onDismiss} className="text-amber-500 hover:text-amber-700">
      <X className="w-3 h-3" />
    </button>
  </motion.div>
);

// ==================== Typing Indicator ====================

const TypingIndicator = () => (
  <div className="flex justify-start mb-3">
    <div className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-2.5">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
      <span className="text-xs text-gray-400">AI is thinking...</span>
    </div>
  </div>
);

// ==================== Main Component ====================

export default function ConversationalChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rateLimit, setRateLimit] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  const STORAGE_KEY = 'ai_conversations_v1';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setConversations(parsed || []);
      if (parsed && parsed.length) {
        const last = parsed[parsed.length - 1];
        setCurrentConversationId(last.id);
        setMessages(last.messages || []);
      }
    } catch (e) {
      console.warn('Could not load conversations', e);
    }
  }, []);

  const persistConversations = (next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setConversations(next);
    } catch (e) {
      console.warn('persist failed', e);
    }
  };

  const ensureConversation = () => {
    if (currentConversationId) return currentConversationId;
    const id = `${Date.now()}`;
    const convo = { id, createdAt: new Date().toISOString(), messages: [] };
    const next = [...conversations, convo];
    persistConversations(next);
    setCurrentConversationId(id);
    setMessages([]);
    return id;
  };

  const pushMessage = (msg) => {
    setMessages((m) => {
      const next = [...m, msg];
      if (currentConversationId) {
        const updated = conversations.map((c) => c.id === currentConversationId ? { ...c, messages: next } : c);
        persistConversations(updated);
      } else {
        const id = ensureConversation();
        const updated = conversations.map((c) => c.id === id ? { ...c, messages: next } : c);
        persistConversations(updated);
      }
      return next;
    });
  };

  const selectConversation = (id) => {
    setCurrentConversationId(id);
    const found = conversations.find((c) => c.id === id);
    setMessages(found ? (found.messages || []) : []);
    setOpen(true);
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConversations([]);
    setCurrentConversationId(null);
    setMessages([]);
    setPrefs(null);
  };

  const newChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setPrefs(null);
    setInput('');
    setError(null);
    setRateLimit(false);
  };

  const send = async () => {
    if (!input.trim()) return;
    setError(null);
    setRateLimit(false);
    ensureConversation();
    const text = input;
    pushMessage({ who: 'user', text });
    setInput('');
    setLoading(true);
    
    try {
      const parseRes = await aiAPI.parse(text);
      const parsed = parseRes.data || parseRes;
      setPrefs(parsed);
      
      pushMessage({ 
        who: 'bot', 
        text: 'I understood your preferences:', 
        type: 'preferences', 
        meta: parsed 
      });

      const recRes = await aiAPI.recommendations({ text });
      const recs = recRes.data || recRes;
      const items = recs.results || recs.items || recs.destinations || recs.data || [];
      
      pushMessage({ 
        who: 'bot', 
        text: items.length ? 'Here are some destinations I recommend:' : 'I found some interesting options for you:',
        type: 'recommendations', 
        meta: items 
      });
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Service temporarily unavailable.';
      
      if (status === 429) {
        setRateLimit(true);
        pushMessage({ who: 'bot', text: `⚠️ Rate limit reached. The AI service is busy. Please wait 60 seconds and try again.`, type: 'error' });
        // Auto-clear rate limit warning after 60 seconds
        setTimeout(() => setRateLimit(false), 60000);
      } else {
        setError(msg);
        pushMessage({ who: 'bot', text: `⚠️ ${msg}`, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const buildItinerary = async () => {
    if (!prefs) {
      pushMessage({ who: 'bot', text: 'Please tell me your travel preferences first (e.g., "5-day trip to Ethiopia with $500 budget").', type: 'info' });
      return;
    }
    
    setError(null);
    setRateLimit(false);
    ensureConversation();
    setLoading(true);
    
    try {
      // Send preferences in the correct format
      const itineraryPrefs = {
        durationDays: prefs.durationDays,
        destination: prefs.destination,
        budgetUSD: prefs.budgetUSD
      };
      
      const res = await aiAPI.itinerary(itineraryPrefs);
      const data = res.data || res;
      
      let itinerary = data;
      if (typeof data === 'string') {
        try {
          itinerary = JSON.parse(data);
        } catch (e) {
          const match = data.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          if (match) {
            try { itinerary = JSON.parse(match[0]); } catch (e2) { itinerary = { raw: data }; }
          } else {
            itinerary = { raw: data };
          }
        }
      }
      
      pushMessage({ 
        who: 'bot', 
        text: 'Here\'s your personalized travel plan:', 
        type: 'itinerary', 
        meta: itinerary 
      });
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Failed to generate itinerary.';
      
      if (status === 429) {
        setRateLimit(true);
        pushMessage({ who: 'bot', text: `⚠️ Rate limit reached. Please wait 60 seconds and try generating the itinerary again.`, type: 'error' });
        setTimeout(() => setRateLimit(false), 60000);
      } else {
        setError(msg);
        pushMessage({ who: 'bot', text: `⚠️ ${msg}`, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[450px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Travel Assistant</h3>
                    <p className="text-xs text-emerald-100">AI-powered travel planner</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={newChat} className="text-white/80 hover:text-white transition text-xs px-2 py-1 rounded hover:bg-white/10">
                    New chat
                  </button>
                  <button onClick={clearHistory} className="text-white/80 hover:text-white transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Conversation History */}
            {conversations.length > 0 && (
              <div className="border-b border-gray-100 px-4 py-2 bg-gray-50">
                <div className="flex gap-2 overflow-x-auto">
                  {conversations.slice(-3).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => selectConversation(c.id)}
                      className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition ${c.id === currentConversationId ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                    >
                      {new Date(c.createdAt).toLocaleDateString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rate Limit Warning */}
            {rateLimit && <RateLimitWarning onDismiss={() => setRateLimit(false)} />}

            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-4 bg-gray-50/30">
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-3">
                    <Compass className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-gray-500 text-sm">Ask me anything about your trip!</p>
                  <p className="text-xs text-gray-400 mt-1">Try: "5-day cultural tour of Ethiopia with $500 budget"</p>
                </div>
              )}
              
              {messages.map((m, idx) => (
                <div key={idx}>
                  {m.type === 'preferences' ? (
                    <MessageBubble who={m.who}>
                      <Txt>{m.text}</Txt>
                      <PreferenceCard prefs={m.meta} />
                    </MessageBubble>
                  ) : m.type === 'recommendations' ? (
                    <MessageBubble who={m.who}>
                      <Txt>{m.text}</Txt>
                      <RecommendationsView items={m.meta || []} />
                    </MessageBubble>
                  ) : m.type === 'itinerary' ? (
                    <MessageBubble who={m.who}>
                      <Txt>{m.text}</Txt>
                      <ItineraryView itinerary={m.meta || {}} />
                    </MessageBubble>
                  ) : (
                    <MessageBubble who={m.who}>
                      <Txt>{m.text}</Txt>
                    </MessageBubble>
                  )}
                </div>
              ))}
              
              {loading && <TypingIndicator />}
              
              {error && !rateLimit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
                  <p className="text-red-600 text-xs">{error}</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100 p-4 bg-white">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about destinations, budget, or duration..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={loading}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={buildItinerary}
                  disabled={loading || !prefs}
                  className="flex-1 bg-gray-100 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Generate Itinerary
                  </span>
                </button>
              </div>
              
              <p className="text-xs text-gray-400 text-center mt-3">
                AI may make mistakes. Check important info.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}