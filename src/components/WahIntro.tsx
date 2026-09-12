'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Film, Landmark } from 'lucide-react';

interface WahIntroProps {
    onFinish: () => void;
    onBeforeFinish?: () => void;
}

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

export const WahIntro: React.FC<WahIntroProps> = ({ onFinish, onBeforeFinish }) => {
    const [phase, setPhase] = useState<IntroPhase>('idle');
    const [pillarIndex, setPillarIndex] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleComplete = () => {
        setIsExiting(true);
        // إشعار الـ App بالبدء في الظهور بالتزامن
        onBeforeFinish?.();

        // إزالة الـ Intro بعد اكتمال الـ Transition
        setTimeout(() => {
            onFinish();
        }, 650);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (phase !== 'loading_pillars') return;

        if (pillarIndex >= PILLARS.length - 1) {
            timerRef.current = setTimeout(() => {
                handleComplete();
            }, 1200);
            return () => {
                if (timerRef.current) clearTimeout(timerRef.current);
            };
        }

        timerRef.current = setTimeout(() => {
            setPillarIndex((prev) => prev + 1);
        }, 1200);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [phase, pillarIndex]);

    const handleLogoClick = async () => {
        if (phase !== 'idle') return;

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
            // Audio fallback
        }

        timerRef.current = setTimeout(() => {
            setPhase('loading_pillars');
        }, 1300);
    };

    const CurrentIcon = PILLARS[pillarIndex].icon;

    return (
        <main
            dir="rtl"
            className={`fixed inset-0 z-[99999] flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f4ec] dark:bg-[#0b0b0a] text-[#211d18] dark:text-[#f5f0e7] select-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExiting
                ? 'opacity-0 -translate-y-4 scale-[0.98] pointer-events-none'
                : 'opacity-100 translate-y-0 scale-100'
                }`}
        >
            {/* إضاءة محيطية */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-[#d6a15a]/12 blur-[80px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">

                {/* Phase 1: Idle */}
                <div
                    className={`flex flex-col items-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'idle'
                        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                        : 'opacity-0 -translate-y-4 scale-95 pointer-events-none absolute'
                        }`}
                >
                    <div className="mb-6 flex items-center gap-3 text-xs font-bold tracking-[0.3em] text-[#80633f]/70 dark:text-[#c7a781]">
                        <span className="h-px w-8 bg-[#9a6a35]/40" />
                        الصعيد
                        <span className="h-px w-8 bg-[#9a6a35]/40" />
                    </div>

                    <button
                        type="button"
                        onClick={handleLogoClick}
                        aria-label="دوس على اللوجو للدخول"
                        className="group relative flex items-center justify-center outline-none cursor-pointer p-4"
                    >
                        <div className="pointer-events-none absolute h-56 w-56 rounded-full bg-[#d6a15a]/15 blur-2xl transition-transform duration-500 group-hover:scale-125" />
                        <span className="absolute h-52 w-52 rounded-full border border-[#b98545]/30 transition-transform duration-500 group-hover:scale-105" />

                        <span className="relative flex h-40 w-40 items-center justify-center rounded-full border border-[#c28b4d]/35 bg-[#fffdf8]/90 dark:bg-white/5 backdrop-blur-md shadow-lg transition-transform duration-300 group-hover:scale-105 active:scale-95">
                            <img
                                src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
                                alt="لوجو وه"
                                className="h-28 w-28 object-contain drop-shadow transition-transform duration-300 group-hover:scale-105"
                            />
                        </span>
                    </button>

                    <div className="mt-7 text-center">
                        <p className="text-2xl font-black tracking-tight text-[#3d3328] dark:text-[#ede4d8] sm:text-3xl">
                            دوس على <span className="text-[#9a6a35]">اللوجو</span>
                        </p>
                        <p className="mt-1 text-xs sm:text-sm font-semibold text-[#806f5b]/80 dark:text-[#a89988]">
                            وخلي الحكاية تبدأ
                        </p>
                    </div>
                </div>

                {/* Phase 2: Welcoming */}
                <div
                    className={`flex flex-col items-center text-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'welcoming'
                        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                        : 'opacity-0 translate-y-4 scale-95 pointer-events-none absolute'
                        }`}
                >
                    <div className="mb-4 flex items-center justify-center gap-2">
                        <span className="h-px w-10 bg-[#9a6a35]/40" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c28b4d]" />
                        <span className="h-px w-10 bg-[#9a6a35]/40" />
                    </div>

                    <h1 className="text-3xl font-black text-[#3d3328] dark:text-[#ede4d8] sm:text-4xl md:text-5xl">
                        نورت بيتك
                    </h1>
                    <h2 className="mt-1 text-2xl font-black text-[#9a6a35] sm:text-3xl md:text-4xl">
                        ومطرحك
                    </h2>
                    <p className="mt-3 text-xs sm:text-sm font-medium text-[#806f5b]/80 dark:text-[#a89988]">
                        أهلاً بيك في منصة وه المتكاملة
                    </p>
                </div>

                {/* Phase 3: Pillars */}
                <div
                    className={`flex flex-col items-center text-center w-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${phase === 'loading_pillars'
                        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                        : 'opacity-0 translate-y-4 scale-95 pointer-events-none absolute'
                        }`}
                >
                    <div className="relative flex items-center justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-white/60 dark:bg-white/5 border border-[#9a6a35]/25 flex items-center justify-center backdrop-blur-sm p-3 shadow-sm">
                            <img
                                src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
                                alt="شعار وه"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    <div
                        key={`title-${pillarIndex}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#9a6a35]/12 text-[#805423] dark:text-[#d5a56d] border border-[#9a6a35]/20 text-xs font-bold mb-2 transition-all duration-300"
                    >
                        <CurrentIcon className="w-3.5 h-3.5" />
                        <span>{PILLARS[pillarIndex].title}</span>
                    </div>

                    <div className="h-10 flex items-center justify-center">
                        <p
                            key={`sub-${pillarIndex}`}
                            className="text-xs sm:text-sm font-medium text-[#3d3328]/80 dark:text-[#ede4d8]/80 transition-opacity duration-300"
                        >
                            {PILLARS[pillarIndex].subtitle}
                        </p>
                    </div>

                    <div className="mt-5 flex items-center gap-1.5">
                        {PILLARS.map((_, idx) => (
                            <span
                                key={idx}
                                className={`h-1 rounded-full transition-all duration-300 ${pillarIndex === idx
                                    ? 'w-5 bg-[#9a6a35]'
                                    : 'w-1 bg-black/15 dark:bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
};

export default WahIntro;