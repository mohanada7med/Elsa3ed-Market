import { useEffect, useRef, useState } from 'react';

interface WahLogoIntroProps {
    onEnter: () => void;
}

const INTRO_STORAGE_KEY = 'elsa3ed_wah_intro_seen';

export default function WahLogoIntro({
    onEnter,
}: WahLogoIntroProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const enterTimerRef = useRef<number | null>(null);
    const leaveTimerRef = useRef<number | null>(null);

    const [isEntering, setIsEntering] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    /*
     * لو المستخدم شاف الـ Intro قبل كده
     * ندخل الموقع مباشرة.
     */
    useEffect(() => {
        const hasSeenIntro = localStorage.getItem(INTRO_STORAGE_KEY);

        if (hasSeenIntro === 'true') {
            onEnter();
        }
    }, [onEnter]);

    /*
     * تنظيف الـ timers فقط.
     *
     * مهم:
     * لا نوقف الـ audio هنا عشان الصوت يقدر يكمل
     * بعد خروج شاشة الـ Intro.
     */
    useEffect(() => {
        return () => {
            if (enterTimerRef.current !== null) {
                window.clearTimeout(enterTimerRef.current);
            }

            if (leaveTimerRef.current !== null) {
                window.clearTimeout(leaveTimerRef.current);
            }
        };
    }, []);

    const handleLogoClick = async () => {
        if (isEntering) return;

        setIsEntering(true);
        setShowWelcome(true);

        /*
         * نسجل إن المستخدم شاف الـ Intro.
         *
         * بالتالي في الـ Refresh القادم
         * الـ Intro مش هيظهر.
         */
        localStorage.setItem(INTRO_STORAGE_KEY, 'true');

        /*
         * تشغيل الصوت
         */
        try {
            if (!audioRef.current) {
                const audio = new Audio('/audio/site-intro.mp3');

                audio.loop = false;
                audio.volume = 0.4;
                audio.preload = 'auto';

                audioRef.current = audio;
            }

            await audioRef.current.play();
        } catch (error) {
            console.error('Audio failed:', error);
        }

        /*
         * عرض:
         * نورت بيتك ومطرحك
         */
        enterTimerRef.current = window.setTimeout(() => {
            /*
             * بداية خروج الـ Intro
             */
            setIsLeaving(true);

            /*
             * انتقال سريع وناعم للموقع
             */
            leaveTimerRef.current = window.setTimeout(() => {
                onEnter();
            }, 450);
        }, 1500);
    };

    return (
        <main
            className={`
                fixed inset-0 z-[99999]
                flex min-h-screen
                items-center justify-center
                overflow-hidden
                bg-[#f8f4ec]

                transition-all
                duration-[450ms]
                ease-[cubic-bezier(0.22,1,0.36,1)]

                ${isLeaving
                    ? 'scale-[1.02] opacity-0 blur-[5px]'
                    : 'scale-100 opacity-100 blur-0'
                }
            `}
            dir="rtl"
        >

            {/* =====================================================
                BACKGROUND
            ====================================================== */}

            <div className="pointer-events-none absolute inset-0">

                {/* Main Glow */}
                <div
                    className="
                        absolute
                        left-1/2 top-1/2
                        h-[650px] w-[650px]
                        -translate-x-1/2 -translate-y-1/2
                        rounded-full
                        bg-[#d6a15a]/15
                        blur-[130px]
                        animate-[pulse_4s_ease-in-out_infinite]
                    "
                />

                {/* Top Light */}
                <div
                    className="
                        absolute
                        left-1/2 top-0
                        h-[450px] w-[700px]
                        -translate-x-1/2
                        rounded-full
                        bg-[#fff0c9]/70
                        blur-[120px]
                    "
                />

                {/* Right Light */}
                <div
                    className="
                        absolute
                        -right-40 top-1/3
                        h-[450px] w-[450px]
                        rounded-full
                        bg-[#e6c38e]/20
                        blur-[120px]
                    "
                />

                {/* Left Light */}
                <div
                    className="
                        absolute
                        -left-40 bottom-1/4
                        h-[450px] w-[450px]
                        rounded-full
                        bg-[#d6a15a]/10
                        blur-[120px]
                    "
                />

                {/* Pattern */}
                <div
                    className="
                        absolute inset-0
                        opacity-[0.035]
                        bg-[radial-gradient(circle_at_center,#9a6a35_1px,transparent_1px)]
                        bg-[size:30px_30px]
                    "
                />

                {/* Welcome Glow */}
                <div
                    className={`
                        absolute
                        left-1/2 top-1/2
                        h-[500px] w-[500px]
                        -translate-x-1/2 -translate-y-1/2
                        rounded-full
                        bg-[#d6a15a]/10
                        blur-[100px]
                        transition-all
                        duration-700
                        ${showWelcome
                            ? 'scale-150 opacity-100'
                            : 'scale-75 opacity-0'
                        }
                    `}
                />
            </div>

            {/* =====================================================
                MAIN INTRO
            ====================================================== */}

            <div
                className={`
                    relative z-10
                    flex flex-col items-center

                    transition-all
                    duration-700
                    ease-[cubic-bezier(0.22,1,0.36,1)]

                    ${showWelcome
                        ? 'scale-90 opacity-0'
                        : 'scale-100 opacity-100'
                    }
                `}
            >

                {/* Small Title */}
                <div
                    className="
                        mb-8
                        flex items-center gap-3
                        text-[10px]
                        font-bold
                        tracking-[0.35em]
                        text-[#80633f]/60
                    "
                >
                    <span className="h-px w-10 bg-[#9a6a35]/40" />

                    الصعيد

                    <span className="h-px w-10 bg-[#9a6a35]/40" />
                </div>

                {/* =================================================
                    LOGO
                ================================================= */}

                <button
                    type="button"
                    onClick={handleLogoClick}
                    disabled={isEntering}
                    aria-label="دوس على اللوجو للدخول"
                    className="
                        group
                        relative
                        flex
                        items-center
                        justify-center
                        outline-none
                    "
                >

                    {/* Big Glow */}
                    <div
                        className="
                            pointer-events-none
                            absolute
                            h-[430px] w-[430px]
                            rounded-full
                            bg-[#d6a15a]/20
                            blur-[90px]
                            animate-[pulse_4s_ease-in-out_infinite]
                        "
                    />

                    {/* =================================================
                        LIGHT RAYS
                    ================================================= */}

                    <div
                        className="
                            pointer-events-none
                            absolute
                            h-[440px] w-[440px]
                            rounded-full
                            animate-[spin_9s_linear_infinite]
                        "
                    >

                        <span
                            className="
                                absolute left-1/2 top-1/2
                                h-[2px] w-[220px]
                                origin-left
                                -translate-y-1/2
                                bg-gradient-to-r
                                from-[#d6a15a]/0
                                via-[#d6a15a]/70
                                to-[#d6a15a]/0
                                blur-[1px]
                            "
                        />

                        <span
                            className="
                                absolute left-1/2 top-1/2
                                h-[1px] w-[210px]
                                origin-left
                                -translate-y-1/2
                                rotate-45
                                bg-gradient-to-r
                                from-[#d6a15a]/0
                                via-[#e7bd7c]/80
                                to-[#d6a15a]/0
                            "
                        />

                        <span
                            className="
                                absolute left-1/2 top-1/2
                                h-[2px] w-[215px]
                                origin-left
                                -translate-y-1/2
                                rotate-90
                                bg-gradient-to-r
                                from-[#d6a15a]/0
                                via-[#d6a15a]/60
                                to-[#d6a15a]/0
                                blur-[1px]
                            "
                        />

                        <span
                            className="
                                absolute left-1/2 top-1/2
                                h-[1px] w-[205px]
                                origin-left
                                -translate-y-1/2
                                rotate-[135deg]
                                bg-gradient-to-r
                                from-[#d6a15a]/0
                                via-[#e7bd7c]/70
                                to-[#d6a15a]/0
                            "
                        />

                        <span
                            className="
                                absolute left-1/2 top-1/2
                                h-[2px] w-[220px]
                                origin-left
                                -translate-y-1/2
                                rotate-180
                                bg-gradient-to-r
                                from-[#d6a15a]/0
                                via-[#d6a15a]/65
                                to-[#d6a15a]/0
                                blur-[1px]
                            "
                        />

                        <span
                            className="
                                absolute left-1/2 top-1/2
                                h-[1px] w-[210px]
                                origin-left
                                -translate-y-1/2
                                rotate-[225deg]
                                bg-gradient-to-r
                                from-[#d6a15a]/0
                                via-[#e7bd7c]/75
                                to-[#d6a15a]/0
                            "
                        />

                        <span
                            className="
                                absolute left-1/2 top-1/2
                                h-[2px] w-[215px]
                                origin-left
                                -translate-y-1/2
                                rotate-270
                                bg-gradient-to-r
                                from-[#d6a15a]/0
                                via-[#d6a15a]/60
                                to-[#d6a15a]/0
                                blur-[1px]
                            "
                        />

                        <span
                            className="
                                absolute left-1/2 top-1/2
                                h-[1px] w-[205px]
                                origin-left
                                -translate-y-1/2
                                rotate-[315deg]
                                bg-gradient-to-r
                                from-[#d6a15a]/0
                                via-[#e7bd7c]/70
                                to-[#d6a15a]/0
                            "
                        />
                    </div>

                    {/* Conic Glow */}
                    <div
                        className="
                            pointer-events-none
                            absolute
                            h-[370px] w-[370px]
                            rounded-full
                            bg-[conic-gradient(from_0deg,transparent,#d6a15a33,transparent,#e6bd7a44,transparent)]
                            blur-[18px]
                            animate-[spin_6s_linear_infinite_reverse]
                        "
                    />

                    {/* Outer Ring */}
                    <span
                        className="
                            absolute
                            h-72 w-72
                            rounded-full
                            border
                            border-[#b98545]/35
                            shadow-[0_0_40px_rgba(154,106,53,0.12)]
                            animate-[spin_18s_linear_infinite]
                            transition-all
                            duration-500
                            group-hover:h-80
                            group-hover:w-80
                            group-hover:border-[#b98545]/60
                            group-active:scale-90
                        "
                    />

                    {/* Second Ring */}
                    <span
                        className="
                            absolute
                            h-60 w-60
                            rounded-full
                            border
                            border-[#b98545]/25
                            shadow-[0_0_30px_rgba(214,161,90,0.08)]
                            animate-[spin_11s_linear_infinite_reverse]
                        "
                    />

                    {/* Inner Ring */}
                    <span
                        className="
                            absolute
                            h-52 w-52
                            rounded-full
                            border
                            border-[#d6a15a]/25
                            shadow-[inset_0_0_30px_rgba(214,161,90,0.1)]
                            animate-[spin_25s_linear_infinite]
                        "
                    />

                    {/* Logo Circle */}
                    <span
                        className="
                            relative
                            flex
                            h-48 w-48
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-[#c28b4d]/35
                            bg-[#fffdf8]/95
                            shadow-[0_10px_50px_rgba(154,106,53,0.16),0_0_100px_rgba(214,161,90,0.18)]
                            backdrop-blur-md
                            transition-all
                            duration-500
                            group-hover:scale-105
                            group-hover:border-[#b98545]/70
                            group-hover:shadow-[0_15px_70px_rgba(154,106,53,0.25),0_0_140px_rgba(214,161,90,0.3)]
                        "
                    >

                        {/* Inner Light */}
                        <span
                            className="
                                pointer-events-none
                                absolute inset-3
                                rounded-full
                                bg-[radial-gradient(circle,rgba(214,161,90,0.18),transparent_68%)]
                                animate-[pulse_3s_ease-in-out_infinite]
                            "
                        />

                        {/* Shine */}
                        <span
                            className="
                                pointer-events-none
                                absolute
                                left-[18%] top-[13%]
                                h-8 w-16
                                rotate-[-25deg]
                                rounded-full
                                bg-white/80
                                blur-md
                            "
                        />

                        <img
                            src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
                            alt="وَه"
                            draggable={false}
                            className="
                                relative z-10
                                h-36 w-36
                                select-none
                                object-contain
                                drop-shadow-[0_5px_18px_rgba(120,80,35,0.2)]
                                transition-all
                                duration-500
                                group-hover:scale-110
                            "
                        />
                    </span>
                </button>

                {/* Text */}
                <div className="mt-12 text-center">

                    <p
                        className="
                            text-2xl
                            font-black
                            tracking-tight
                            text-[#3d3328]
                            sm:text-3xl
                        "
                    >
                        دوس على{' '}
                        <span className="text-[#9a6a35]">
                            اللوجو
                        </span>
                    </p>

                    <p
                        className="
                            mt-3
                            text-sm
                            text-[#806f5b]/70
                        "
                    >
                        وخلي الحكاية تبدأ
                    </p>

                    <div
                        className="
                            mx-auto mt-7
                            flex h-9 w-9
                            items-center justify-center
                            rounded-full
                            border
                            border-[#b98545]/30
                            bg-white/70
                            text-[#9a6a35]
                            shadow-[0_5px_20px_rgba(154,106,53,0.12)]
                            animate-bounce
                        "
                    >
                        ↓
                    </div>
                </div>
            </div>

            {/* =====================================================
                WELCOME SCREEN
            ====================================================== */}

            <div
                className={`
                    pointer-events-none
                    absolute inset-0
                    z-30
                    flex items-center justify-center

                    transition-all
                    duration-500
                    ease-[cubic-bezier(0.22,1,0.36,1)]

                    ${showWelcome
                        ? 'scale-100 opacity-100'
                        : 'scale-90 opacity-0'
                    }
                `}
            >

                {/* Glow */}
                <div
                    className="
                        absolute
                        h-[550px] w-[550px]
                        rounded-full
                        bg-[#d6a15a]/20
                        blur-[110px]
                        animate-[pulse_2s_ease-in-out_infinite]
                    "
                />

                {/* Ring 1 */}
                <div
                    className="
                        absolute
                        h-[500px] w-[500px]
                        rounded-full
                        border
                        border-[#d6a15a]/10
                        animate-[spin_12s_linear_infinite]
                    "
                />

                {/* Ring 2 */}
                <div
                    className="
                        absolute
                        h-[400px] w-[400px]
                        rounded-full
                        border
                        border-[#b98545]/10
                        animate-[spin_8s_linear_infinite_reverse]
                    "
                />

                {/* Welcome Text */}
                <div className="relative text-center">

                    <div className="mb-7 flex items-center justify-center gap-4">

                        <span className="h-px w-16 bg-[#9a6a35]/30" />

                        <span
                            className="
                                h-2 w-2
                                rounded-full
                                bg-[#c28b4d]
                                shadow-[0_0_15px_rgba(194,139,77,0.5)]
                            "
                        />

                        <span className="h-px w-16 bg-[#9a6a35]/30" />

                    </div>

                    <h1
                        className="
                            text-4xl
                            font-black
                            tracking-tight
                            text-[#3d3328]
                            sm:text-5xl
                            md:text-6xl
                        "
                    >
                        نورت بيتك
                    </h1>

                    <h2
                        className="
                            mt-2
                            text-3xl
                            font-black
                            text-[#9a6a35]
                            sm:text-4xl
                            md:text-5xl
                        "
                    >
                        ومطرحك
                    </h2>

                    <p
                        className="
                            mt-6
                            text-sm
                            text-[#806f5b]/65
                        "
                    >
                        أهلاً بيك في الصعيد...
                    </p>

                    <div className="mt-7 flex items-center justify-center gap-4">

                        <span className="h-px w-16 bg-[#9a6a35]/30" />

                        <span
                            className="
                                h-2 w-2
                                rounded-full
                                bg-[#c28b4d]
                                shadow-[0_0_15px_rgba(194,139,77,0.5)]
                            "
                        />

                        <span className="h-px w-16 bg-[#9a6a35]/30" />

                    </div>
                </div>
            </div>

            {/* =====================================================
                FOOTER
            ====================================================== */}

            <div
                className="
                    absolute
                    bottom-7
                    left-0
                    right-0
                    text-center
                    text-[9px]
                    font-medium
                    tracking-[0.3em]
                    text-[#806f5b]/40
                "
            >
                ELSA3ED MARKET
            </div>

        </main>
    );
}
