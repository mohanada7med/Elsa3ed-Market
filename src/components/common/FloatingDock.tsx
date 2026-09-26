import React from 'react';

interface FloatingDockProps {
    count?: number;
    label?: string; // مثال: "أكلة صعيدية" أو "منتج" أو "مكان"
    customText?: string; // لو حابب تكتب جملة مخصصة بالكامل بدلاً من (معروض X ...)
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
    count,
    label = 'عنصر',
    customText,
}) => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
            <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-black/10 bg-cream/90 px-6 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.12)] backdrop-blur-2xl transition-colors dark:border-white/10 dark:bg-espresso-900/90 dark:shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2 text-xs font-bold text-espresso dark:text-cream">
                    <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary dark:bg-[#d6aa72]" />
                    <span>
                        {customText ? customText : `موجود ${count ?? 0} ${label}`}
                    </span>
                </div>

                <div className="h-4 w-px bg-black/15 dark:bg-white/15" />

                <button
                    onClick={scrollToTop}
                    className="cursor-pointer text-xs font-black text-primary hover:opacity-80 dark:text-primary-hover"
                >
                    لأعلى الصفحة ↑
                </button>
            </div>
        </div>
    );
};

export default FloatingDock;