
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { runAIAssistant } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    // Initial message from AI
    setMessages([
        { role: 'model', text: 'Olá! Sou seu Analista IA. Como posso ajudar a otimizar sua fazenda hoje? Você pode perguntar sobre cotações, manejo, ou pedir um resumo financeiro.' }
    ]);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await runAIAssistant(input, messages);
      const modelMessage: ChatMessage = { role: 'model', text: response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'model',
        text: 'Ocorreu um erro ao conectar com o assistente. Por favor, tente novamente.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white flex-shrink-0">
                  <i data-lucide="brain-circuit" className="w-6 h-6"></i>
                </div>
              )}
              <div
                className={`max-w-lg p-3 rounded-lg shadow ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
               {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0">
                  <i data-lucide="user" className="w-6 h-6"></i>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white flex-shrink-0">
                  <i data-lucide="brain-circuit" className="w-6 h-6"></i>
              </div>
              <div className="max-w-lg p-3 rounded-lg shadow bg-gray-200 dark:bg-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte ao Analista IA..."
          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <i data-lucide="send" className="w-6 h-6"></i>
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
