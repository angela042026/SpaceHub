import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, MessageSquare, X, ArrowRight, BookOpen } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import ChatBot from './ChatBot';
import useCookieBannerVisible from '@/Lib/useCookieBannerVisible';

export default function ChatWidget() {
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [modoAtivo, setModoAtivo] = useState('menu');
    const popUpRef = useRef(null);
    const buttonRef = useRef(null); // Nova referência para blindar o botão redondo
    const cookieBannerVisible = useCookieBannerVisible();

    useEffect(() => {
        function handleClickOut(event) {
            // Se clicou fora do pop-up E também fora do botão redondo, então fecha de forma segura
            if (
                popUpRef.current && !popUpRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)
            ) {
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
        <div
            className={`fixed right-6 z-50 font-sans transition-all duration-300 ${
                cookieBannerVisible
                    ? 'bottom-48 lg:bottom-28'
                    : 'bottom-6'
            }`}
        >

            {/* O Pop-up Retangular */}
            {isOpen && (
                <div
                    ref={popUpRef}
                    className={`dashboard-card absolute bottom-16 right-0 mb-2 flex w-[calc(100vw-3rem)] flex-col overflow-hidden transition-all duration-200 sm:w-[360px] ${
                        modoAtivo === 'menu' ? 'p-4' : 'h-[500px] max-h-[75vh] p-0'
                    }`}
                >
                    {/* MENU PRINCIPAL DO WIDGET */}
                    {modoAtivo === 'menu' ? (
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                                <span className="flex h-2.5 w-2.5 rounded-full bg-teal-500 animate-pulse" />
                                <h3 className="font-bold text-slate-800 dark:text-white">Suporte SpaceHub</h3>
                            </div>

                            <div className="mt-4 space-y-3 flex-1">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Como podemos ajudar hoje? Escolha uma das opções abaixo:
                                </p>

                                <Link
                                    href={
                                        auth?.user
                                            ? route('faqs.index')
                                            : route('login')
                                    }
                                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition-all hover:border-teal-500 hover:bg-teal-500/5 dark:border-slate-800 dark:bg-slate-800/50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                                            <BookOpen size={20} />
                                        </div>
                                        <div>
                                            <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">Help Center</span>
                                            <span className="block text-xs text-slate-400">Perguntas frequentes</span>
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
                                            <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">Assistente Virtual</span>
                                            <span className="block text-xs text-slate-400">Respostas automáticas</span>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-slate-400" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* CHATBOT INTEGRADO INTEGRALMENTE */
                        <ChatBot aoVoltar={() => setModoAtivo('menu')} />
                    )}
                </div>
            )}

            {/* Botão Redondo Flutuante (Adicionada a ref={buttonRef}) */}
            <button
                ref={buttonRef}
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                aria-label={
                    isOpen
                        ? 'Fechar chat de suporte'
                        : 'Abrir chat de suporte'
                }
                className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all duration-250 active:scale-95 ${
                    isOpen
                        ? 'bg-rose-500 shadow-rose-500/30 hover:bg-rose-600'
                        : 'bg-teal-500 shadow-teal-500/30 hover:bg-teal-600'
                }`}
            >
                {isOpen ? <X size={24} /> : <HelpCircle size={26} />}
            </button>
        </div>
    );
}
