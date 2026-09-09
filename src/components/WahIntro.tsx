import { useRef, useState, useEffect } from 'react';

interface WahLogoIntroProps {
    onEnter: () => void;
}

export default function WahLogoIntro({ onEnter }: WahLogoIntroProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [stage, setStage] = useState<'idle' | 'breach' | 'matrix' | 'roast' | 'welcome'>('idle');
    const [ipAddress, setIpAddress] = useState('192.168.1.104');
    const [matrixLogs, setMatrixLogs] = useState<string[]>([]);

    useEffect(() => {
        const randomIp = `${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        setIpAddress(randomIp);
    }, []);

    const handleLogoClick = async () => {
        if (stage !== 'idle') return;

        // المرحلة الأولى: اختراق أمني وهمي
        setStage('breach');

        try {
            if (!audioRef.current) {
                const audio = new Audio('/audio/site-intro.mp3');
                audio.loop = false;
                audio.volume = 0.4;
                audio.preload = 'auto';
                audioRef.current = audio;
            }

            audioRef.current.play().catch(() => { });
        } catch (error) {
            console.error('Audio failed:', error);
        }

        // بعد ثانيتين، سيل الأكواد
        setTimeout(() => {
            setStage('matrix');

            const logs = [
                'ACCESS GRANTED: ROOT USER',
                `TARGET IP: ${ipAddress} [EXPOSED]`,
                'DOWNLOADING WHATSAPP CHATS... [OK]',
                'EXTRACTING GALLERY & SAVED PASSWORDS...',
                'UPLOADING TO DARKNET SERVER... 100%',
                'FORMATTING SYSTEM IN 3... 2... 1...'
            ];

            let i = 0;
            const logInterval = setInterval(() => {
                if (i < logs.length) {
                    setMatrixLogs(prev => [...prev, logs[i]]);
                    i++;
                } else {
                    clearInterval(logInterval);
                }
            }, 350);

        }, 2200);

        // بعد 5 ثوانٍ، شاشة المقلب والضحك
        setTimeout(() => {
            setStage('roast');

            // بعد ثانيتين ونصف من الضحك، نظهر رسالة الترحيب الدافئة
            setTimeout(() => {
                setStage('welcome');

                // بعد ثانيتين من رسالة الترحيب، ندخله الموقع بجد
                setTimeout(() => {
                    onEnter();
                }, 2200);
            }, 2500);
        }, 5500);
    };

    // 1. شاشة الاختراق
    if (stage === 'breach') {
        return (
            <main className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#f7f2e8] text-[#9a6a35] font-mono select-none overflow-hidden" dir="rtl">
                <div className="absolute inset-0 bg-[#9a6a35]/5 animate-pulse pointer-events-none" />
                <div className="relative z-10 text-center space-y-6 px-4">
                    <div className="text-8xl animate-bounce">🚨</div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-widest text-[#9a6a35] drop-shadow-[0_0_20px_rgba(154,106,53,0.25)]">
                        SECURITY BREACH DETECTED
                    </h1>
                    <p className="text-2xl text-[#241b14] font-bold">
                        تم رصد محاولة اختراق لجهازك من عنوان IP: <span className="text-[#9a6a35] font-mono">{ipAddress}</span>
                    </p>
                    <p className="text-lg text-[#9a6a35] animate-pulse">
                        !! جاري سحب بياناتك الشخصية وحفظها على السيرفر الخارجي !!
                    </p>
                </div>
            </main>
        );
    }

    // 2. شاشة الماتريكس
    if (stage === 'matrix') {
        return (
            <main className="fixed inset-0 z-[99999] flex flex-col justify-end p-8 bg-[#f7f2e8] text-[#557a4f] font-mono select-none overflow-hidden" dir="rtl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(85,122,79,0.06)_0,transparent_100%)] pointer-events-none" />
                <div className="relative z-10 max-w-2xl space-y-2 mb-10">
                    <p className="text-[#9a6a35] text-xl font-bold mb-4 animate-pulse">
                        [!] نظام الحماية عجز عن التصدي للتهديد:
                    </p>
                    {matrixLogs.map((log, index) => (
                        <p key={index} className="text-sm sm:text-base tracking-wider text-[#557a4f] drop-shadow-[0_0_5px_rgba(85,122,79,0.25)]">
                            {'>'} {log}
                        </p>
                    ))}
                    <div className="w-full bg-[#9a6a35]/10 h-2 rounded mt-6 overflow-hidden border border-[#9a6a35]/20">
                        <div className="bg-[#9a6a35] h-full animate-[pulse_0.2s_infinite]" style={{ width: '100%' }} />
                    </div>
                </div>
            </main>
        );
    }

    // 3. شاشة الضحك والكشف عن المقلب
    if (stage === 'roast') {
        return (
            <main className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#f7f2e8] text-center select-none" dir="rtl">
                <div className="space-y-4 px-4 animate-fade-in">
                    <h2 className="text-4xl font-black text-[#9a6a35]">
                        قلبك وقف ولا لسه يا صاحبي؟!
                    </h2>
                    <p className="text-lg text-[#241b14]/60">
                        تليفونك سليم ومفيش أي بيانات اتسحبت.. منور الصعيد يا فنان!
                    </p>
                </div>
            </main>
        );
    }

    // 4. رسالة الترحيب الخاصة (نورت بيتك ومطرك)
    if (stage === 'welcome') {
        return (
            <main className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#f7f2e8] text-center select-none" dir="rtl">
                <div className="space-y-4 px-4 animate-fade-in">
                    <h2 className="text-4xl sm:text-5xl font-black text-[#9a6a35] tracking-wide">
                        نورت بيتك ومطرحك
                    </h2>
                    <p className="text-lg text-[#241b14]/70 font-medium">
                        ثواني وهتفتح معاك الحكاية.. استعد!
                    </p>
                </div>
            </main>
        );
    }

    // 5. الفخ الأساسي
    return (
        <main className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f2e8]" dir="rtl">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9a6a35]/10 blur-[140px]" />
                <div className="absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,#9a6a35_1px,transparent_1px),linear-gradient(to_bottom,#9a6a35_1px,transparent_1px)] bg-[size:30px_30px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="mb-8 px-4 py-1.5 rounded-full border border-[#9a6a35]/20 bg-white/70 backdrop-blur-md flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#9a6a35] shadow-[0_0_15px_rgba(154,106,53,0.08)]">
                    <span className="h-2 w-2 rounded-full bg-[#9a6a35] animate-ping" />
                    SECURE GATEWAY // اتصال مشفر 256-bit
                </div>

                <button
                    type="button"
                    onClick={handleLogoClick}
                    aria-label="دخول آمن"
                    className="group relative flex items-center justify-center outline-none cursor-pointer p-6"
                >
                    <div className="absolute h-56 w-56 rounded-full border border-dashed border-[#9a6a35]/30 animate-[spin_25s_linear_infinite] group-hover:border-[#9a6a35]" />
                    <div className="absolute h-44 w-44 rounded-full border border-[#9a6a35]/10 animate-pulse" />

                    <div className="relative flex h-40 w-40 items-center justify-center rounded-2xl rotate-45 border border-[#9a6a35]/40 bg-white shadow-[0_20px_60px_rgba(70,45,20,0.12)] transition-all duration-500 group-hover:rotate-0 group-hover:scale-105 group-hover:border-[#9a6a35] group-hover:shadow-[0_0_80px_rgba(154,106,53,0.25)]">
                        <img
                            src="https://res.cloudinary.com/kuana1nl/image/upload/v1788711341/%D9%84%D9%88%D8%AC%D9%88_%D9%88%D9%87_copy.png"
                            alt="وَه"
                            draggable={false}
                            className="h-24 w-24 -rotate-45 select-none object-contain transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110 filter drop-shadow-[0_0_10px_rgba(154,106,53,0.3)]"
                        />
                    </div>
                </button>

                <div className="mt-10 text-center space-y-2">
                    <p className="text-2xl font-bold tracking-wide text-[#241b14]">
                        اضغط هنا للتحقق من هويتك ودخول <span className="text-[#9a6a35]">وَه</span>
                    </p>
                    <p className="text-xs text-[#241b14]/40 font-mono tracking-widest">
                        [ اضغط للمتابعة عبر بروتوكول الأمان الآمن ]
                    </p>
                </div>
            </div>
        </main>
    );
}