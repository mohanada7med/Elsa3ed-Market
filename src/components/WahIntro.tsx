'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Film, Landmark, ChevronLeft } from 'lucide-react';

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

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // تسريع زمن العرض في حالة الـ Refresh
    const stepDuration = initialPhase === 'loading_pillars' ? 1000 : 1400;

    const handleComplete = () => {
        if (isExiting) return;
        setIsExiting(true);
        onBeforeFinish?.();

        setTimeout(() => {
            onFinish();
            onEnter?.();
        }, 650);
    };

    const handleSkip = () => {
        try {
            sessionStorage.setItem(SESSION_KEY, 'true');
        } catch {
            // Ignore
        }
        if (audioRef.current) {
            audioRef.current.pause();
        }
        handleComplete();
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // إدارة تبديل الركائز الثلاث بسلاسة
    useEffect(() => {
        if (phase !== 'loading_pillars') return;

        if (pillarIndex >= PILLARS.length - 1) {
            timerRef.current = setTimeout(() => {
                handleComplete();
            }, stepDuration);
            return () => {
                if (timerRef.current) clearTimeout(timerRef.current);
            };
        }

        timerRef.current = setTimeout(() => {
            setPillarIndex((prev) => prev + 1);
        }, stepDuration);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [phase, pillarIndex, stepDuration]);

    const handleLogoClick = async () => {
        if (phase !== 'idle') return;

        try {
            sessionStorage.setItem(SESSION_KEY, 'true');
        } catch {
            // Ignore
        }

        setPhase('welcoming');

        try {
            if (!audioRef.current) {
                const audio = new Audio('/audio/site-intro.mp3');
                audio.loop = false;
                audio.volume = 0.35;
                audioRef.current = audio;
            }
            await audioRef.current.play();
        } catch {
            // تجنب أخطاء المتصفح عند منع التشغيل التلقائي
        }

        timerRef.current = setTimeout(() => {
            setPhase('loading_pillars');
        }, 1500);
    };

    return (
        <main
            dir="rtl"
            className={`fixed inset-0 z-[99999] flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f4ec] dark:bg-[#0b0b0a] text-[#211d18] dark:text-[#f5f0e7] select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExiting
                    ? 'opacity-0 -translate-y-6 scale-[0.97] pointer-events-none'
                    : 'opacity-100 translate-y-0 scale-100'
                }`}
        >
            {/* زر التخطي السريع */}
            <button
                type="button"
                onClick={handleSkip}
                className={`absolute top-6 left-6 z-30 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#7a6448] dark:text-[#b89b7b] bg-black/5 dark:bg-white/5 hover:bg-[#9a6a35]/15 dark:hover:bg-white/10 transition-all duration-300 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-80 hover:opacity-100'
                    }`}
            >
                <span>تخطي</span>
                <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* هالة إضاءة محيطية */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d6a15a]/12 blur-[90px] transition-all duration-1000 ease-out ${phase === 'idle' ? 'h-[480px] w-[480px]' : 'h-[360px] w-[360px]'
                        }`}
                />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-md w-full px-4">
                {/* شريط الصعيد العلوي */}
                <div
                    className={`mb-6 flex items-center gap-3 text-xs font-bold tracking-[0.3em] text-[#80633f]/70 dark:text-[#c7a781] transition-all duration-500 ease-out ${phase === 'idle'
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 -translate-y-4 pointer-events-none'
                        }`}
                >
                    <span className="h-px w-8 bg-[#9a6a35]/40" />
                    الصعيد
                    <span className="h-px w-8 bg-[#9a6a35]/40" />
                </div>

                {/* مركز اللوجو المشترك المتحرك (Morphing) */}
                <div className="relative flex items-center justify-center mb-6">
                    <div
                        className={`pointer-events-none absolute transition-all duration-700 ease-out ${phase === 'idle' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                            }`}
                    >
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full border border-[#b98545]/25 animate-[spin_24s_linear_infinite]" />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full border border-[#b98545]/15 animate-[spin_16s_linear_infinite_reverse]" />
                    </div>

                    <button
                        type="button"
                        onClick={handleLogoClick}
                        disabled={phase !== 'idle'}
                        aria-label="شعار وه"
                        className={`relative flex items-center justify-center rounded-full border border-[#c28b4d]/35 bg-[#fffdf8]/90 dark:bg-white/5 backdrop-blur-md shadow-lg transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'idle'
                                ? 'h-36 w-36 cursor-pointer hover:scale-105 active:scale-95'
                                : phase === 'welcoming'
                                    ? 'h-28 w-28 cursor-default shadow-md'
                                    : 'h-20 w-20 cursor-default shadow-sm'
                            }`}
                    >
                        <img
                            src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
                            alt="لوجو وه"
                            className={`object-contain select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'idle'
                                    ? 'h-24 w-24 drop-shadow'
                                    : phase === 'welcoming'
                                        ? 'h-18 w-18'
                                        : 'h-12 w-12'
                                }`}
                        />
                    </button>
                </div>

                {/* مصفوفة النصوص المتداخلة الثابتة */}
                <div className="grid grid-cols-1 w-full text-center">
                    {/* 1. مرحلة الزرار */}
                    <div
                        className={`col-start-1 row-start-1 flex flex-col items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'idle'
                                ? 'opacity-100 translate-y-0 pointer-events-auto'
                                : 'opacity-0 translate-y-3 pointer-events-none'
                            }`}
                    >
                        <p className="text-2xl font-black tracking-tight text-[#3d3328] dark:text-[#ede4d8] sm:text-3xl whitespace-nowrap">
                            دوس على <span className="text-[#9a6a35]">اللوجو</span>
                        </p>
                        <p className="mt-1 text-xs sm:text-sm font-semibold text-[#806f5b]/80 dark:text-[#a89988] whitespace-nowrap">
                            وخلي الحكاية تبدأ
                        </p>
                    </div>

                    {/* 2. مرحلة الترحيب */}
                    <div
                        className={`col-start-1 row-start-1 flex flex-col items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'welcoming'
                                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                                : 'opacity-0 scale-95 pointer-events-none'
                            }`}
                    >
                        <div className="mb-2 flex items-center justify-center gap-2">
                            <span className="h-px w-8 bg-[#9a6a35]/40" />
                            <span className="h-1.5 w-1.5 rounded-full bg-[#c28b4d]" />
                            <span className="h-px w-8 bg-[#9a6a35]/40" />
                        </div>

                        <h1 className="text-3xl font-black text-[#3d3328] dark:text-[#ede4d8] sm:text-4xl whitespace-nowrap">
                            نورت بيتك
                        </h1>
                        <h2 className="mt-0.5 text-2xl font-black text-[#9a6a35] sm:text-3xl whitespace-nowrap">
                            ومطرحك
                        </h2>
                        <p className="mt-2 text-xs font-medium text-[#806f5b]/80 dark:text-[#a89988] whitespace-nowrap">
                            أهلاً بيك في منصة وه المتكاملة
                        </p>
                    </div>

                    {/* 3. مرحلة التحميل والركائز (بدون أي تقطيع أو كسر سطر) */}
                    <div
                        className={`col-start-1 row-start-1 flex flex-col items-center text-center w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'loading_pillars'
                                ? 'opacity-100 translate-y-0 pointer-events-auto'
                                : 'opacity-0 translate-y-3 pointer-events-none'
                            }`}
                    >
                        <div className="grid grid-cols-1 place-items-center w-full min-h-[80px]">
                            {PILLARS.map((pillar, idx) => {
                                const Icon = pillar.icon;
                                const isActive = pillarIndex === idx;

                                return (
                                    <div
                                        key={idx}
                                        className={`col-start-1 row-start-1 flex flex-col items-center justify-center w-full transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive
                                                ? 'opacity-100 translate-y-0 scale-100 blur-0 pointer-events-auto'
                                                : 'opacity-0 translate-y-2 scale-[0.98] blur-[2px] pointer-events-none'
                                            }`}
                                    >
                                        {/* شارة العنوان */}
                                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#9a6a35]/12 text-[#805423] dark:text-[#d5a56d] border border-[#9a6a35]/20 text-xs font-bold mb-2 shadow-sm whitespace-nowrap">
                                            <Icon className="w-3.5 h-3.5 shrink-0" />
                                            <span className="whitespace-nowrap">{pillar.title}</span>
                                        </div>

                                        {/* النص التوضيحي في سطر واحد ثابت */}
                                        <div className="flex items-center justify-center w-full px-2">
                                            <p className="text-xs sm:text-sm font-medium text-[#3d3328]/85 dark:text-[#ede4d8]/85 whitespace-nowrap">
                                                {pillar.subtitle}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* مؤشر النقاط */}
                        <div className="mt-4 flex items-center gap-1.5">
                            {PILLARS.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${pillarIndex === idx
                                            ? 'w-6 bg-[#9a6a35]'
                                            : 'w-1.5 bg-black/15 dark:bg-white/20'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default WahIntro;