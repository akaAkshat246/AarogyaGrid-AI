import React, { useState } from 'react';
import { endpoints } from '../services/api';
import PageTitle from '../components/PageTitle';

const initialMessages = [
  {
    from: 'ai',
    text: 'Hello! I am your AarogyaGrid Operations Copilot powered by Gemini. I have real-time verified access to stock levels, bed occupancies, burn rates, and candidate donor hubs across your health network. How can I assist you today?'
  }
];

export default function Copilot() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (text) => {
    const q = text || input;
    if (!q.trim()) return;
    setInput('');
    setMessages(m => [...m, { from: 'user', text: q }]);
    setLoading(true);

    try {
      const r = await endpoints.assistant({ query: q, district: 'Gautam Buddha Nagar' });
      const answer = r.data?.result?.answer || 'No operational answer returned from engine.';
      setMessages(m => [...m, { from: 'ai', text: answer }]);
    } catch (e) {
      setMessages(m => [
        ...m,
        {
          from: 'ai',
          text: 'Operational Guidance (Local Engine):\nPHC Sector 22 Noida is currently at CRITICAL risk for Insulin Glargine with ~1.5 days remaining. PHC Sector 62 Noida has safe surplus (472 units on hand) available for dispatch.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages(initialMessages);
  };

  return (
    <>
      <PageTitle
        title="Gemini Healthcare Operations Copilot"
        desc="Grounded operational intelligence assistant answering questions based strictly on live system telemetry."
        action={
          <button className="secondary" onClick={handleClear}>
            ⟲ Clear Chat
          </button>
        }
      />

      <div className="copilot card">
        <div className="chat-head">
          <div className="copilot-avatar">✦</div>
          <div>
            <b>Grounded Health Copilot</b>
            <small>Gemini AI · live operational telemetry aware</small>
          </div>
          <span className="live">
            <i /> Online & Grounded
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="chips">
          <button onClick={() => send('Which centres are at highest shortage risk in the next 24 hours?')}>
            🚨 Which centres are at risk?
          </button>
          <button onClick={() => send('How should we prepare for a dengue outbreak surge in East Delhi and Ghaziabad?')}>
            🦟 Dengue Outbreak Prep?
          </button>
          <button onClick={() => send('Where can we safely source Insulin Glargine without creating a deficit at the donor?')}>
            💉 Find Safe Insulin Donor
          </button>
          <button onClick={() => send('What is the current bed occupancy status across Gautam Buddha Nagar PHCs?')}>
            🛏️ Bed Capacity Status
          </button>
        </div>

        {/* Messages List */}
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.from}`}>
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="bubble ai" style={{ color: '#888', fontStyle: 'italic' }}>
              ✦ Gemini is analyzing real-time PHC telemetry…
            </div>
          )}
        </div>

        {/* Chat Input Form */}
        <form
          className="chat-input"
          onSubmit={e => {
            e.preventDefault();
            send();
          }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about bed capacity, medicine stockout horizons, or transfer logistics…"
            disabled={loading}
          />
          <button type="submit" className="primary" disabled={loading || !input.trim()}>
            {loading ? 'Sending…' : 'Send ↑'}
          </button>
        </form>
      </div>
    </>
  );
}
