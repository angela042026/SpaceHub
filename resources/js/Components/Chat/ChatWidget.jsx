import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircleMore, MessageSquare, X, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from '@inertiajs/react';
import ChatBot from './ChatBot';
import useCookieBannerVisible from '@/Lib/useCookieBannerVisible';
import useReservaAlteracaoBarVisible from '@/Lib/useReservaAlteracaoBarVisible';

const DURACAO_ANIMACAO_MS = 200;

export default function ChatWidget() {
    const { t } = useTranslation('common');
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [modoAtivo, setModoAtivo] = useState('menu');
    const popUpRef = useRef(null);
    const buttonRef = useRef(null);
    const cookieBannerVisible = useCookieBannerVisible();
    const alteracaoBarVisible = useReservaAlteracaoBarVisible();

    function abrir() {
        setMounted(true);
        requestAnimationFrame(() => setIsOpen(true));
    }

    function fechar() {
        setIsOpen(false);
        setModoAtivo('menu');
        setTimeout(() => setMounted(false), DURACAO_ANIMACAO_MS);
    }

    useEffect(() => {
        function handleClickOut(event) {
            // Se clicou fora do pop-up e também fora do botão redondo, então fecha de forma segura
            if (
                popUpRef.current && !popUpRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)
            ) {
                fechar();
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOut);
        }
        return () => document.removeEventListener('mousedown', handleClickOut);
    }, [isOpen]);

    return (
        <div
            className={`fixed right-6 z-50 font-sans transition-all duration-300 print:hidden ${
                cookieBannerVisible
                    ? 'bottom-48 lg:bottom-28'
                    : alteracaoBarVisible
                        ? 'bottom-56 lg:bottom-28'
                        : 'bottom-6'
            }`}
        >

            {/* Painel do chat */}
            {mounted && (
                <div
                    ref={popUpRef}
                    className={`absolute bottom-[68px] right-0 flex w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] transition-all duration-200 ease-out sm:w-[390px] ${
                        isOpen
                            ? 'translate-y-0 scale-100 opacity-100'
                            : 'pointer-events-none translate-y-2 scale-95 opacity-0'
                    } ${
                        modoAtivo === 'chat'
                            ? 'h-[500px] max-h-[75vh]'
                            : ''
                    }`}
                >
                    {modoAtivo === 'menu' ? (
                        <>
                            {/* Cabeçalho */}
                            <div className="relative overflow-hidden bg-gradient-to-r from-[#03172B] to-[#14B8A6] px-5 py-5">
                                <button
                                    type="button"
                                    onClick={fechar}
                                    aria-label={t('chat.fecharChat')}
                                    className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
                                >
                                    <X size={16} />
                                </button>

                                <div className="flex items-center gap-3 pr-8">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                                        <MessageCircleMore
                                            size={19}
                                            strokeWidth={1.8}
                                        />
                                    </span>

                                    <div>
                                        <p className="text-base font-bold leading-tight text-white">
                                            {t('chat.saudacao')}
                                        </p>
                                        <p className="text-sm leading-tight text-white/90">
                                            {t('chat.comoPodemosAjudar')}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    <span className="text-xs font-medium text-white/85">
                                        {t('chat.assistenteDisponivel')}
                                    </span>
                                </div>
                            </div>

                            {/* Opções */}
                            <div className="p-4">
                                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                                    {t('chat.escolhaUmaOpcao')}
                                </p>

                                <div className="space-y-2.5">
                                    <Link
                                        href={route('faqs.index')}
                                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition-all hover:border-teal-500 hover:bg-teal-500/5"
                                        onClick={fechar}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                                                <BookOpen size={20} />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-semibold text-[#071A33]">
                                                    {t('chat.centralDeAjuda')}
                                                </span>
                                                <span className="block text-xs text-slate-500">
                                                    {t('chat.encontreRespostasRapidas')}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight
                                            size={16}
                                            className="text-slate-300"
                                        />
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setModoAtivo('chat')
                                        }
                                        className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition-all hover:border-teal-500 hover:bg-teal-500/5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600">
                                                <MessageSquare
                                                    size={20}
                                                />
                                            </div>
                                            <div>
                                                <span className="block text-sm font-semibold text-[#071A33]">
                                                    {t('chat.assistenteVirtual')}
                                                </span>
                                                <span className="block text-xs text-slate-500">
                                                    {t('chat.respostasImediatas')}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight
                                            size={16}
                                            className="text-slate-300"
                                        />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* CHATBOT INTEGRADO INTEGRALMENTE */
                        <ChatBot
                            aoVoltar={() => setModoAtivo('menu')}
                        />
                    )}
                </div>
            )}

            {/* Botão redondo flutuante — escondido enquanto o painel está visível */}
            {!mounted && (
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        abrir();
                    }}
                    aria-label={t('chat.abrirChat')}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500 text-white shadow-lg shadow-teal-500/30 transition-all duration-250 hover:bg-teal-600 active:scale-95"
                >
                    <MessageCircleMore size={22} />
                </button>
            )}
        </div>
    );
}
