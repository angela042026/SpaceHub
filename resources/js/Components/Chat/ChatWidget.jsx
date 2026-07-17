import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, MessageSquare, X, ArrowRight, BookOpen } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import ChatBot from './ChatBot';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [modoAtivo, setModoAtivo] = useState('menu');
    const popUpRef = useRef(null);

    useEffect(() => {
        function handleClickOut(event) {
            if (popUpRef.current && !popUpRef.current.contains(event.target)) {
                setIsOpen(false);
                setModoAtivo('menu');
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOut);
        }
        return () => document.removeEventListener('mousedown', handleClickOut);
    }, [isOpen]);

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">

            {isOpen && (
                <div
                    ref={popUpRef}
                    className="absolute bottom-16 right-0 mb-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl transition-all duration-200 dark:border-slate-700 dark:bg-slate-900"
                >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse" />
                            <h3 className="font-bold text-slate-800 dark:text-white">Suporte SpaceHub</h3>
                        </div>
                        <button
                            onClick={() => { setIsOpen(false); setModoAtivo('menu'); }}
                            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {modoAtivo === 'menu' ? (
                        <div className="mt-4 space-y-3">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Como podemos ajudar hoje? Escolhe uma das opções abaixo:
                            </p>

                            <Link
                                href={route('faqs.index')}
                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition-all hover:border-teal-500 hover:bg-teal-500/5 dark:border-slate-800 dark:bg-slate-800/50"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                                            Help Center
                                        </span>
                                        <span className="block text-xs text-slate-400">
                                            Perguntas frequentes e guias
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-slate-400" />
                            </Link>

                            <button
                                onClick={() => setModoAtivo('chat')}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition-all hover:border-teal-500 hover:bg-teal-500/5 dark:border-slate-800 dark:bg-slate-800/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                                            Assistente Virtual
                                        </span>
                                        <span className="block text-xs text-slate-400">
                                            Respostas automáticas na hora
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="text-slate-400" />
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                            {/* Botão simples para voltar ao menu do widget */}
                            <button
                                onClick={() => setModoAtivo('menu')}
                                className="mb-2 text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1"
                            >
                                ← Voltar às opções
                            </button>

                            <div className="scale-95 origin-top">
                                <ChatBot />
                            </div>
                        </div>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Abrir ajuda"
                className={`flex h-14 w-14 items-center justify-center rounded-full text-white transition-all duration-250 active:scale-95
                    ${isOpen
                        ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30'
                        : 'bg-teal-500 hover:bg-teal-600 shadow-xl hover:shadow-teal-500/20 shadow-black/25'
                    }
                    border border-white/10`}
                style={{
                    boxShadow: isOpen
                        ? '0 8px 16px -4px rgba(244, 63, 94, 0.4), 0 4px 6px -2px rgba(244, 63, 94, 0.1)'
                        : '0 10px 20px -5px rgba(0, 0, 0, 0.3), 0 4px 8px -2px rgba(0, 0, 0, 0.15)'
                }}
            >
                {isOpen ? (
                    <X size={24} className="transition-transform duration-200 rotate-90" />
                ) : (
                    <HelpCircle size={26} className="transition-transform duration-200" />
                )}
            </button>
        </div>
    );
}
