import React, { useEffect, useState } from 'react';
import { aiAPI } from '../../services/api';

const Txt = ({ children }) => <div className="whitespace-pre-wrap text-sm">{children}</div>;

const MessageBubble = ({ who, children }) => (
  <div className={`flex ${who === 'user' ? 'justify-end' : 'justify-start'} mb-2`}> 
    <div className={`${who === 'user' ? 'bg-emerald-600 text-white' : 'bg-white border'} rounded-lg px-3 py-2 max-w-md`}>{children}</div>
  </div>
);

const RecommendationsView = ({ items = [] }) => (
  <div className="grid grid-cols-1 gap-2">
    {items.map((d, i) => (
      <div key={i} className="flex gap-2 items-start p-2 border rounded">
        <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center text-lg">📍</div>
        <div>
          <div className="font-semibold">{d.name || d.title || d.destination_name}</div>
          <div className="text-xs text-slate-600">{d.snippet || d.summary || d.description || ''}</div>
        </div>
      </div>
    ))}
  </div>
);

const ItineraryView = ({ itinerary = {} }) => {
  // itinerary may be {title, summary, days: [{day, activities: []}...]}
  const days = itinerary.days || itinerary.itinerary || [];
  return (
    <div>
      {itinerary.title && <div className="font-semibold mb-1">{itinerary.title}</div>}
      {itinerary.summary && <div className="text-xs text-slate-600 mb-2">{itinerary.summary}</div>}
      <div className="space-y-2">
        {Array.isArray(days) && days.map((d, i) => (
          <div key={i} className="p-2 border rounded">
            <div className="font-medium">{d.day || `Day ${i + 1}`}</div>
            <div className="text-sm text-slate-700 mt-1">{Array.isArray(d.activities) ? d.activities.join(', ') : d.description || d.notes}</div>
          </div>
        ))}
        {!Array.isArray(days) && <pre className="text-xs">{JSON.stringify(itinerary, null, 2)}</pre>}
      </div>
    </div>
  );
};

export default function ConversationalChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  // LocalStorage key
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
      // also persist to current conversation
      if (currentConversationId) {
        const updated = conversations.map((c) => c.id === currentConversationId ? { ...c, messages: next } : c);
        persistConversations(updated);
      } else {
        // create a conversation automatically
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
  };

  const send = async () => {
    if (!input) return;
    setError(null);
    ensureConversation();
    const text = input;
    pushMessage({ who: 'user', text });
    setInput('');
    setLoading(true);
    try {
      const parseRes = await aiAPI.parse(text);
      const parsed = parseRes.data || parseRes;
      setPrefs(parsed);
      pushMessage({ who: 'bot', text: 'Parsed preferences.', type: 'info', meta: parsed });

      const recRes = await aiAPI.recommendations({ text });
      const recs = recRes.data || recRes;
      const items = recs.results || recs.items || recs || [];
      pushMessage({ who: 'bot', text: 'Here are some recommendations.', type: 'recommendations', meta: items });
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err.message || 'Error calling AI service.';
      setError(msg);
      pushMessage({ who: 'bot', text: `Error: ${msg}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const buildItinerary = async () => {
    if (!prefs) return;
    setError(null);
    ensureConversation();
    setLoading(true);
    try {
      const res = await aiAPI.itinerary(prefs);
      const data = res.data || res;
      // If the response is a string, try to parse JSON
      let itinerary = data;
      if (typeof data === 'string') {
        try {
          itinerary = JSON.parse(data);
        } catch (e) {
          // try to extract JSON-like substring
          const match = data.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          if (match) {
            try { itinerary = JSON.parse(match[0]); } catch (e2) { itinerary = { raw: data }; }
          } else {
            itinerary = { raw: data };
          }
        }
      }
      pushMessage({ who: 'bot', text: 'Generated itinerary', type: 'itinerary', meta: itinerary });
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err.message || 'Itinerary generation failed.';
      setError(msg);
      pushMessage({ who: 'bot', text: `Error: ${msg}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={() => setOpen(!open)} className="rounded-full bg-emerald-600 text-white p-3 shadow-lg text-white text-xl">
          💬
        </button>
      </div>

      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-96 bg-white border rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Travel Assistant</div>
            <div className="text-xs text-slate-500">AI-powered</div>
          </div>

          <div className="mb-2 flex gap-2">
            <div className="flex-1 text-xs text-slate-600">History</div>
            <button onClick={clearHistory} className="text-xs text-red-500">Clear</button>
          </div>
          <div className="max-h-28 overflow-y-auto mb-3 border-b pb-2">
            {conversations.length === 0 && <div className="text-xs text-slate-400">No previous conversations</div>}
            {conversations.map((c) => (
              <div key={c.id} className={`flex items-center justify-between p-1 cursor-pointer ${c.id === currentConversationId ? 'bg-slate-100 rounded' : ''}`} onClick={() => selectConversation(c.id)}>
                <div className="text-xs">{new Date(c.createdAt).toLocaleString()}</div>
                <div className="text-xs text-slate-500">{(c.messages || []).length} msgs</div>
              </div>
            ))}
          </div>

          <div className="max-h-56 overflow-y-auto mb-3">
            {messages.map((m, i) => (
              <div key={i}>
                {m.type === 'recommendations' ? (
                  <MessageBubble who={m.who}><RecommendationsView items={m.meta || []} /></MessageBubble>
                ) : m.type === 'itinerary' ? (
                  <MessageBubble who={m.who}><ItineraryView itinerary={m.meta || {}} /></MessageBubble>
                ) : (
                  <MessageBubble who={m.who}><Txt>{m.text}</Txt></MessageBubble>
                )}
              </div>
            ))}
            {loading && <div className="text-xs text-slate-500">Thinking…</div>}
            {error && <div className="text-xs text-red-600">{error}</div>}
          </div>

          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask: '5-day cultural Ethiopia $500'" className="flex-1 border rounded px-3 py-2 text-sm" disabled={loading} />
            <button onClick={send} disabled={loading} className="bg-emerald-600 text-white rounded px-3 py-2">{loading ? '…' : 'Send'}</button>
          </div>

          <div className="mt-3 flex gap-2">
            <button onClick={buildItinerary} disabled={!prefs || loading} className="flex-1 bg-slate-100 text-slate-700 rounded px-3 py-2 text-sm">Generate Itinerary</button>
          </div>
        </div>
      )}
    </div>
  );
}
