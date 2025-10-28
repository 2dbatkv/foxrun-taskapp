import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, MessageSquare, Sparkles } from 'lucide-react';
import Tile from './Tile';
import { chatAPI } from '../services/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const isInitialLoad = useRef(true);

  const examplePrompts = [
    "What are my high priority tasks?",
    "Show me my upcoming meetings this week",
    "What reminders do I have today?",
    "Summarize my recent knowledge base entries",
    "Help me organize my tasks"
  ];

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    // Don't scroll on initial load, only when new messages are added
    if (!isInitialLoad.current) {
      scrollToBottom();
    } else {
      isInitialLoad.current = false;
    }
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const response = await chatAPI.getHistory();
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (messageText = null, e = null) => {
    if (e) e.preventDefault();

    const messageToSend = messageText || input;
    if (!messageToSend.trim() || loading) return;

    setInput('');
    setLoading(true);
    setShowSuggestions(false);

    // Add user message immediately
    setMessages((prev) => [...prev, { role: 'user', content: messageToSend }]);

    try {
      const response = await chatAPI.sendMessage(messageToSend);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.detail ||
        'Sorry, I encountered an error connecting to Claude AI. Please check:\n\n' +
        '1. Your Anthropic API key is configured correctly\n' +
        '2. The backend server is running\n' +
        '3. You have internet connectivity\n\n' +
        'Try again or contact support if the issue persists.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (prompt) => {
    setInput(prompt);
    handleSend(prompt);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear chat history?')) {
      try {
        await chatAPI.clearHistory();
        setMessages([]);
      } catch (error) {
        console.error('Error clearing chat history:', error);
      }
    }
  };

  return (
    <Tile
      title="AI Assistant"
      className="lg:col-span-2"
      actions={
        messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-red-500 hover:text-red-700"
            title="Clear chat history"
          >
            <Trash2 size={16} />
          </button>
        )
      }
    >
      <div className="flex flex-col h-96">
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.length === 0 && showSuggestions ? (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <Sparkles size={48} className="text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Ask Claude AI</h3>
              <p className="text-sm text-gray-600 mb-4 text-center">
                Get help managing your tasks, schedule, and knowledge base
              </p>
              <div className="w-full max-w-md space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Try asking:</p>
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(prompt)}
                    className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm transition border border-blue-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare size={48} />
              <p className="mt-2">Start a conversation with Claude</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={(e) => handleSend(null, e)} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or click an example above..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            title="Send message to Claude AI"
          >
            <Send size={18} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </Tile>
  );
};

export default ChatInterface;
