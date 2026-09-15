import React, { useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Bot, X, Send, Loader2, ShieldAlert, Sparkles } from 'lucide-react';

export const AIHelpAssistant: React.FC = () => {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; disclaimer?: string; isEscalated?: boolean }>>([
        {
            sender: 'bot',
            text: 'Hello! I am your WorkMitra AI Assistant. How can I help you with jobs, payments, verification, or agreements today?',
            disclaimer: 'Notice: This assistant provides general guidance. Critical dispute or payment actions require human verifiers.',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post('/ai/support', { message: userMsg, language });
            setMessages((prev) => [
                ...prev,
                {
                    sender: 'bot',
                    text: res.data.answer,
                    disclaimer: res.data.disclaimer,
                    isEscalated: res.data.requiresHumanSupport,
                },
            ]);
        } catch (err: any) {
            setMessages((prev) => [
                ...prev,
                {
                    sender: 'bot',
                    text: 'Sorry, I am currently unable to process your request. Please try again or contact support.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 group border border-white/20"
                >
                    <Bot className="h-6 w-6" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-semibold pr-1">
                        WorkMitra AI Assistant
                    </span>
                </button>
            )}

            {isOpen && (
                <div className="bg-white w-[350px] sm:w-[400px] h-[500px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
                    {/* Assistant Header */}
                    <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
                                <Bot className="h-5 w-5 text-amber-300" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold flex items-center gap-1">
                                    WorkMitra AI Support <Sparkles className="h-3 w-3 text-amber-400" />
                                </h4>
                                <p className="text-[10px] text-indigo-200">24/7 Multi-lingual Guidance Assistant</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-gray-300 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50 text-xs">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`p-3 rounded-2xl max-w-[85%] space-y-1 shadow-sm ${msg.sender === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                        }`}
                                >
                                    <p className="leading-relaxed">{msg.text}</p>

                                    {msg.isEscalated && (
                                        <div className="pt-1.5 flex items-center gap-1 text-[10px] font-semibold text-rose-600 border-t border-rose-100 mt-1">
                                            <ShieldAlert className="h-3 w-3" /> Escalated for WorkMitra Human Review
                                        </div>
                                    )}
                                </div>
                                {msg.disclaimer && (
                                    <span className="text-[9px] text-gray-400 mt-1 px-1 max-w-[85%]">{msg.disclaimer}</span>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-2 text-indigo-600 bg-white p-2.5 rounded-xl border border-gray-100 max-w-[60%]">
                                <Loader2 className="animate-spin h-4 w-4" />
                                <span className="text-xs">Thinking...</span>
                            </div>
                        )}
                    </div>

                    {/* Quick prompt suggestions */}
                    <div className="px-3 py-2 bg-gray-100/80 border-t border-gray-200/60 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                        <button
                            onClick={() => { setInput('How does Escrow payment work?'); }}
                            className="px-2 py-1 bg-white border border-gray-200 rounded-md text-gray-600 whitespace-nowrap hover:bg-indigo-50 hover:text-indigo-600"
                        >
                            Escrow Payments?
                        </button>
                        <button
                            onClick={() => { setInput('How to file a dispute?'); }}
                            className="px-2 py-1 bg-white border border-gray-200 rounded-md text-gray-600 whitespace-nowrap hover:bg-indigo-50 hover:text-indigo-600"
                        >
                            File Dispute?
                        </button>
                        <button
                            onClick={() => { setInput('How to apply for daily wage jobs?'); }}
                            className="px-2 py-1 bg-white border border-gray-200 rounded-md text-gray-600 whitespace-nowrap hover:bg-indigo-50 hover:text-indigo-600"
                        >
                            Apply Jobs?
                        </button>
                    </div>

                    {/* Input bar */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask AI Assistant a question..."
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
