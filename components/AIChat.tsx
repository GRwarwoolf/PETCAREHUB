

import React, { useState, useEffect, useRef } from 'react';
import { Pet, Language, ChatMessage } from '../types';
import { ChevronLeft, Send, Sparkles, Bot, User, Image as ImageIcon, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { t } from '../services/translations';
import { chatWithAI } from '../services/geminiService';

interface AIChatProps {
  pet: Pet;
  lang: Language;
  onBack: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ pet, lang, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Add initial welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: t('chat.welcome', lang, { name: pet.name }),
          timestamp: Date.now()
        }
      ]);
    }
  }, [lang, pet.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      // Reset value so same file can be selected again
      if (event.target) event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      imageUrl: selectedImage || undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const responseText = await chatWithAI(pet, userMsg.text, lang, userMsg.imageUrl);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6F9EFF] to-[#4B7BFF] p-4 pt-6 shadow-md flex items-center gap-3 text-white z-10">
        <button 
          onClick={onBack}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg">{t('chat.title', lang)}</h2>
            <Sparkles size={16} className="text-yellow-300" />
          </div>
          <p className="text-xs opacity-90 text-blue-100">{pet.name}'s Expert</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-1">
                <Bot size={18} />
              </div>
            )}
            
            <div 
              className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}
            >
              {msg.imageUrl && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <img src={msg.imageUrl} alt="User upload" className="w-full h-auto max-h-48 object-cover" />
                </div>
              )}

              {msg.role === 'assistant' ? (
                 <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:text-gray-800 prose-headings:font-bold prose-headings:text-sm">
                   <ReactMarkdown>{msg.text}</ReactMarkdown>
                 </div>
              ) : (
                msg.text
              )}
              <span className={`text-[10px] block mt-1 text-right opacity-60 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0 mt-1">
                <User size={18} />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-1">
                <Bot size={18} />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 flex items-center gap-2">
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 pb-6 sm:pb-4">
        
        {/* Image Preview */}
        {selectedImage && (
          <div className="relative inline-block mb-2">
            <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-xl border border-gray-200 object-cover" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-end bg-gray-100 px-4 py-2.5 rounded-3xl border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mb-1 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full transition"
          >
            <ImageIcon size={20} />
          </button>
          <input 
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />

          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chat.placeholder', lang, { name: pet.name })}
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-500 py-2"
          />
          <button 
            onClick={handleSend}
            disabled={(!inputText.trim() && !selectedImage) || isLoading}
            className="mb-0.5 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;