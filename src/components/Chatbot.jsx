import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Trash2, Loader2, Bot } from 'lucide-react';
import { askChatbot } from '../services/chatService';

export function Chatbot({ issData, newsData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [{ id: 1, text: 'Hello! Ask me anything about the ISS or current news.', isBot: true }];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input.trim(), isBot: false };
    const updatedMessages = [...messages, userMessage].slice(-30);
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const replyText = await askChatbot(updatedMessages, { iss: issData, news: newsData });
      setMessages(prev => [...prev, { id: Date.now(), text: replyText, isBot: true }].slice(-30));
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), text: 'Sorry, I am having trouble connecting to my AI brain. Check your API token.', isBot: true, isError: true }].slice(-30));
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{ id: Date.now(), text: 'Chat history cleared. How can I help?', isBot: true }]);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-card text-card-foreground border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold">
              <Bot size={20} />
              <span>Dashboard AI</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearChat} title="Clear Chat" className="hover:bg-primary-foreground/20 p-1 rounded transition-colors">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} title="Close" className="hover:bg-primary-foreground/20 p-1 rounded transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 bg-secondary/10">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.isBot 
                    ? msg.isError ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-secondary text-secondary-foreground rounded-tl-none' 
                    : 'bg-primary text-primary-foreground rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t bg-card flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ISS or News..." 
              className="flex-grow bg-secondary px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={isTyping || !input.trim()}
              className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
