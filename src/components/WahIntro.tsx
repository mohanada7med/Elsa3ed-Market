'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingBag, Film, Landmark, ChevronLeft, Zap } from 'lucide-react';

interface WahIntroProps {
    onFinish: () => void;
    onBeforeFinish?: () => void;
    onEnter?: () => void;
    initialPhase?: 'idle' | 'loading_pillars';
}

const SESSION_KEY = 'elsa3ed_wah_session_visited';

const PILLARS = [
    {
        title: 'سوق وه.. من إيد الصانع لحد بيتك',
        subtitle: 'اشترى أحلى شغل من الصعيد وخلّي طلبك يوصلك لحد بيتك',
        icon: ShoppingBag,
    },
    {
        title: 'ريلز وحكاوي من قلب الصعيد',
        subtitle: 'شوف الصعيد على حقيقته ورش وأماكن أول مرة تشوفها',
        icon: Film,
    },
    {
        title: 'آثار ومعالم وحكاوي بلدنا',
        subtitle: 'لفّ في بلادنا واعرف حكاية كل مكان من قلب الصعيد',
        icon: Landmark,
    },
];

type IntroPhase = 'idle' | 'welcoming' | 'loading_pillars';

export const WahIntro: React.FC<WahIntroProps> = ({
    onFinish,
    onBeforeFinish,
    onEnter,
    initialPhase = 'idle',
}) => {
    const [phase, setPhase] = useState<IntroPhase>(initialPhase);
    const [pillarIndex, setPillarIndex] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const [logoSrc, setLogoSrc] = useState('https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/لوجو_وه_copy.png');

    useEffect(() => {
        setPhase(initialPhase);
    }, [initialPhase]);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timersRef = useRef<NodeJS.Timeout[]>([]);

    const addTimeout = useCallback((fn: () => void, ms: number) => {
        const t = setTimeout(fn, ms);
        timersRef.current.push(t);
        return t;
    }, []);

    const clearAllTimers = useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    }, []);

    const stepDuration = initialPhase === 'loading_pillars' ? 500 : 1500;

    const handleComplete = useCallback(() => {
        if (isExiting) return;
        setIsExiting(true);
        onBeforeFinish?.();

        // تظل الموسيقى تعمل وتستمر في الخلفية دون خفض الصوت أو إيقافها
        addTimeout(() => {
            onFinish();
            onEnter?.();
        }, 380);

    }, [isExiting, onBeforeFinish, onFinish, onEnter, addTimeout]);

    const handleSkip = useCallback(() => {
        try {
            sessionStorage.setItem(SESSION_KEY, 'true');
        } catch {
            // Ignore
        }
        handleComplete();
    }, [handleComplete]);

    // تجهيز الصوت
    useEffect(() => {
        try {
            const audio = new Audio('/audio/site-intro.mp3');
            audio.preload = 'auto';
            audio.volume = 0.45;
            audioRef.current = audio;
        } catch {
            // Ignored
        }

        return () => {
            clearAllTimers();
            // لا يتم استدعاء audio.pause() هنا كي يستمر التراك بالعمل عند unmount الـ Intro
        };
    }, [clearAllTimers]);

    // اختصارات الكيبورد
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSkip();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSkip]);

    // تتابع الركائز
    useEffect(() => {
        if (phase !== 'loading_pillars') return;

        if (pillarIndex >= PILLARS.length - 1) {
            const t = addTimeout(() => {
                handleComplete();
            }, stepDuration);
            return () => clearTimeout(t);
        }

        const t = addTimeout(() => {
            setPillarIndex((prev) => prev + 1);
        }, stepDuration);

        return () => clearTimeout(t);
    }, [phase, pillarIndex, stepDuration, handleComplete, addTimeout]);

    const handleLogoClick = async () => {
        if (phase !== 'idle') return;

        try {
            sessionStorage.setItem(SESSION_KEY, 'true');
        } catch {
            // Ignore
        }

        setPhase('welcoming');

        try {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                await audioRef.current.play();
            }
        } catch {
            // صامت في حال قيود المتصفح
        }

        addTimeout(() => {
            setPhase('loading_pillars');
        }, 850);
    };

    return (
        <main
            dir="rtl"
            onClick={phase === 'loading_pillars' ? handleSkip : undefined}
            className={`fixed inset-0 z-[99999] flex h-[100dvh] w-screen max-w-full items-center justify-center overflow-hidden bg-[#f8f4ec] dark:bg-espresso-900 text-espresso dark:text-cream select-none transform-gpu transition-[opacity,transform] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExiting
                ? 'opacity-0 scale-[0.98] pointer-events-none'
                : 'opacity-100 scale-100'
                } ${phase === 'loading_pillars' ? 'cursor-pointer' : ''}`}
        >
            {/* زر التخطي في أقصى أعلى الشاشة من فوق */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    handleSkip();
                }}
                className={`fixed top-2 left-3 z-[100000] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#7a6448] dark:text-[#b89b7b] bg-black/5 dark:bg-cream/10 hover:bg-primary/15 dark:hover:bg-white/20 transition-all duration-200 transform-gpu active:scale-95 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-90 hover:opacity-100'
                    }`}
            >
                <span>تخطي</span>
                <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {/* إضاءة خلفية متجاوبة */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[340px] w-[340px] sm:h-[460px] sm:w-[460px] rounded-full bg-[#d6a15a]/15 blur-[70px] sm:blur-[90px] transform-gpu transition-transform duration-700 ease-out ${phase === 'idle' ? 'scale-100' : 'scale-75'
                        }`}
                />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-sm sm:max-w-md px-6 py-4 my-auto">
                {/* وسم الصعيد */}
                <div
                    className={`mb-4 sm:mb-6 flex items-center gap-3 text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#80633f]/75 dark:text-[#c7a781] transform-gpu transition-all duration-400 ease-out ${phase === 'idle'
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 -translate-y-3 pointer-events-none'
                        }`}
                >
                    <span className="h-px w-6 sm:w-8 bg-primary/40" />
                    الصعيد
                    <span className="h-px w-6 sm:w-8 bg-primary/40" />
                </div>

                {/* الشعار والحلقات */}
                <div className="relative flex items-center justify-center mb-6 sm:mb-8">
                    <div
                        className={`pointer-events-none absolute transform-gpu transition-all duration-500 ease-out ${phase === 'idle' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                            }`}
                    >
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 sm:h-52 sm:w-52 rounded-full border border-[#b98545]/20 animate-[spin_24s_linear_infinite] transform-gpu will-change-transform" />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-36 sm:h-44 sm:w-44 rounded-full border border-[#b98545]/15 animate-[spin_16s_linear_infinite_reverse] transform-gpu will-change-transform" />
                    </div>

                    <button
                        type="button"
                        onClick={(e) => {
                            if (phase === 'idle') {
                                e.stopPropagation();
                                handleLogoClick();
                            }
                        }}
                        disabled={phase !== 'idle'}
                        aria-label="شعار وه"
                        className={`relative flex items-center justify-center rounded-full border border-[#c28b4d]/35 bg-[#fffdf8]/95 dark:bg-cream/10 backdrop-blur-md shadow-lg transform-gpu transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'idle'
                            ? 'h-32 w-32 sm:h-36 sm:w-36 cursor-pointer hover:scale-105 active:scale-95'
                            : phase === 'welcoming'
                                ? 'h-24 w-24 sm:h-28 sm:w-28 cursor-default shadow-md'
                                : 'h-16 w-16 sm:h-20 sm:w-20 cursor-default shadow-sm'
                            }`}
                    >
                        <img
                            src={logoSrc}
                            alt="لوجو وه"
                            loading="eager"
                            decoding="async"
                            onError={() => {
                                setLogoSrc('/logo-wah.png');
                            }}
                            className={`object-contain select-none transform-gpu transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'idle'
                                ? 'h-20 w-20 sm:h-24 sm:w-24 drop-shadow'
                                : phase === 'welcoming'
                                    ? 'h-14 w-14 sm:h-16 sm:w-16'
                                    : 'h-10 w-10 sm:h-12 sm:w-12'
                                }`}
                        />
                    </button>
                </div>

                {/* المحتوى النصي المتغير */}
                <div className="grid grid-cols-1 w-full text-center">
                    {/* المرحلة الأولى: idle */}
                    <div
                        className={`col-start-1 row-start-1 flex flex-col items-center transform-gpu transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'idle'
                            ? 'opacity-100 translate-y-0 pointer-events-auto'
                            : 'opacity-0 translate-y-2 pointer-events-none'
                            }`}
                    >
                        <p className="text-2xl font-black tracking-tight text-[#3d3328] dark:text-[#ede4d8] sm:text-3xl">
                            دوس على <span className="text-primary">وه</span>
                        </p>
                        <p className="mt-1.5 text-xs sm:text-sm font-semibold text-[#806f5b]/80 dark:text-[#a89988]">
                            وخلي الحكاية تبدأ
                        </p>
                    </div>

                    {/* المرحلة الثانية: welcoming */}
                    <div
                        className={`col-start-1 row-start-1 flex flex-col items-center transform-gpu transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'welcoming'
                            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                            : 'opacity-0 scale-95 pointer-events-none'
                            }`}
                    >
                        <div className="mb-2 flex items-center justify-center gap-2">
                            <span className="h-px w-6 bg-primary/40" />
                            <span className="h-1.5 w-1.5 rounded-full bg-[#c28b4d]" />
                            <span className="h-px w-6 bg-primary/40" />
                        </div>

                        <h1 className="text-2xl font-black text-[#3d3328] dark:text-[#ede4d8] sm:text-4xl">
                            نورت بيتك
                        </h1>
                        <h2 className="mt-0.5 text-xl font-black text-primary sm:text-3xl">
                            ومطرحك
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm font-medium text-[#806f5b]/85 dark:text-[#a89988] max-w-[280px] sm:max-w-none">
                            أهلاً بيك في "وه" أول منصة متكاملة للصعيد
                        </p>
                    </div>

                    {/* المرحلة الثالثة: loading_pillars */}
                    <div
                        className={`col-start-1 row-start-1 flex flex-col items-center text-center w-full transform-gpu transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'loading_pillars'
                            ? 'opacity-100 translate-y-0 pointer-events-auto'
                            : 'opacity-0 translate-y-2 pointer-events-none'
                            }`}
                    >
                        <div className="grid grid-cols-1 place-items-center w-full min-h-[86px]">
                            {PILLARS.map((pillar, idx) => {
                                const Icon = pillar.icon;
                                const isActive = pillarIndex === idx;

                                return (
                                    <div
                                        key={idx}
                                        className={`col-start-1 row-start-1 flex flex-col items-center justify-center w-full transform-gpu transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive
                                            ? 'opacity-100 translate-y-0 scale-100 blur-0 pointer-events-auto'
                                            : 'opacity-0 translate-y-2 scale-[0.98] blur-[1px] pointer-events-none'
                                            }`}
                                    >
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/12 text-[#805423] dark:text-primary-hover border border-primary/20 text-xs font-bold mb-2 shadow-sm">
                                            <Icon className="w-3.5 h-3.5 shrink-0" />
                                            <span>{pillar.title}</span>
                                        </div>

                                        <p className="text-xs sm:text-sm font-medium text-[#3d3328]/85 dark:text-[#ede4d8]/85 leading-relaxed px-2">
                                            {pillar.subtitle}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* شريط التقدم */}
                        <div className="mt-4 flex items-center gap-1.5">
                            {PILLARS.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`h-1.5 rounded-full transform-gpu transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${pillarIndex === idx
                                        ? 'w-6 sm:w-7 bg-primary'
                                        : pillarIndex > idx
                                            ? 'w-2 bg-primary/60'
                                            : 'w-1.5 bg-black/15 dark:bg-cream/20'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* تلميح النقر السريع */}
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[#806f5b]/60 dark:text-[#a89988]/60">
                            <Zap className="w-3 h-3 text-primary" />
                            <span>دوس فى أي مكان علشان تدخل على طول</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default WahIntro;