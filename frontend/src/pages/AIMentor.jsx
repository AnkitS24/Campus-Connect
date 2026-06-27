import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const suggestedQuestions = [
  'How should I prepare for DSA interviews?',
  'Create a 4-week web development roadmap',
  'What companies should I target as a CSE student?',
  'How to improve my communication for HR rounds?',
  'What are the key topics in System Design?',
];

const AIMentor = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Mentor. I can help you with interview preparation, roadmaps, career guidance, and more. What would you like to learn about?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content) => {
    const message = content || input;
    if (!message.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await aiAPI.chat({ message });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.data?.response || 'I apologize, but I was unable to process your request. Please try again.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="p-4 border-b border-border glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold">AI Mentor</h2>
              <p className="text-xs text-text-muted">Powered by Gemini AI</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {messages.length === 1 && (
            <div className="mb-6">
              <p className="text-sm text-text-muted mb-3">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-sm px-3 py-1.5 rounded-full bg-surface-lighter border border-border text-text-muted hover:text-text hover:border-primary/30 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                  <Sparkles size={16} className="text-accent" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'glass rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <User size={16} className="text-primary" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Sparkles size={16} className="text-accent" />
              </div>
              <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 size={16} className="animate-spin text-accent" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="p-4 border-t border-border glass"
        >
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Ask your AI mentor anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-surface-lighter rounded-xl px-4 py-2.5 text-sm text-text placeholder-text-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-accent hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIMentor;
