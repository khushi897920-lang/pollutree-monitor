'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function Chatbot({ wardId = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Hello! I\'m your AQI assistant. Ask me anything about air quality in your area.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, wardId }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, { role: 'bot', content: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'bot', content: 'Sorry, I couldn\'t process your question. Please try again.' },
        ]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: 'An error occurred. Please try again later.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-[0_0_15px_rgba(0,255,255,0.1)] bg-[#0d1520]/80 hover:bg-[#111c2a]/90 border border-cyan-500/30 backdrop-blur-md transition-all duration-300"
          size="icon"
        >
          <MessageCircle className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="glass-panel fixed bottom-6 right-6 w-96 h-[500px] flex flex-col rounded-xl overflow-hidden text-white border-0 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-neon-cyan" />
              <h3 className="font-semibold text-white tracking-wider">AQI Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/10 hover:text-red-400"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/20">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-3 shadow-lg ${message.role === 'user'
                    ? 'bg-teal-500/30 border border-teal-500/50 text-white'
                    : 'bg-black/40 border border-white/10 text-gray-200'
                    }`}
                >
                  <p className="text-sm font-light leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-black/40 border border-white/10 rounded-xl p-3 shadow-lg">
                  <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about air quality..."
                className="bg-black/40 border-white/10 text-white placeholder:text-gray-500 rounded-lg focus-visible:ring-teal-500/50"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-teal-500/20 hover:bg-teal-500/40 border border-teal-500/50 rounded-lg"
              >
                <Send className="w-4 h-4 text-teal-400" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
