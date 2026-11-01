import React, { useEffect, useState } from 'react';
import { Compass, ArrowLeft, Sparkles } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';

export interface UncleWahHeroBannerProps {
  doorTitle: string;
  doorBadge: string;
  mascotSrc: string;
  mascotRole: string;
  quote: string;
  statsText?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

/* A floating sticker that pops in, bobs, and drifts with the pointer */
const Sticker: React.FC<{
  className?: string;
  rotate?: number;
  delay?: number;
  x: MotionValue<number>;
  y: MotionValue<number>;
  reduce: boolean;
  children: React.ReactNode;
}> = ({ className = '', rotate = 0, delay = 0, x, y, reduce, children }) => (
  <motion.div style={{ x, y }} className={`absolute z-20 ${className}`}>
    <motion.div
      initial={reduce ? false : { scale: 0, rotate: rotate - 25, opacity: 0 }}
      animate={{ scale: 1, rotate, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 12, delay: 0.9 + delay }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 3 + delay * 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </motion.div>
  </motion.div>
);

const TWINKLES = [
  { top: '10%', left: '46%', size: 14, delay: 0 },
  { top: '72%', left: '40%', size: 10, delay: 0.8 },
  { top: '18%', left: '92%', size: 12, delay: 1.5 },
  { top: '84%', left: '88%', size: 16, delay: 0.4 },
  { top: '46%', left: '4%', size: 10, delay: 1.1 },
];

export const UncleWahHeroBanner: React.FC<UncleWahHeroBannerProps> = ({
  doorTitle,
  doorBadge,
  mascotSrc,
  mascotRole,
  quote,
  statsText,
  actionText,
  onAction,
  className = '',
}) => {
  const reduce = !!useReducedMotion();

  /* ── Pointer parallax ── */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 15 });
  const sy = useSpring(my, { stiffness: 80, damping: 15 });

  const mascotX = useTransform(sx, [-0.5, 0.5], [-22, 22]);
  const mascotY = useTransform(sy, [-0.5, 0.5], [-10, 10]);
  const blobX = useTransform(sx, [-0.5, 0.5], [14, -14]);
  const blobY = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const nearX = useTransform(sx, [-0.5, 0.5], [30, -30]);
  const nearY = useTransform(sy, [-0.5, 0.5], [20, -20]);
  const farX = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const farY = useTransform(sy, [-0.5, 0.5], [-10, 10]);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  /* ── Typewriter quote ── */
  const [typed, setTyped] = useState(reduce ? quote.length : 0);
  useEffect(() => {
    if (reduce) {
      setTyped(quote.length);
      return;
    }
    setTyped(0);
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      let i = 0;
      timer = setInterval(() => {
        i += 1;
        setTyped(i);
        if (i >= quote.length && timer) clearInterval(timer);
      }, 30);
    }, 1100);
    return () => {
      clearTimeout(start);
      if (timer) clearInterval(timer);
    };
  }, [quote, reduce]);
  const typing = typed < quote.length;

  /* ── Magnetic button ── */
  const bx = useSpring(useMotionValue(0), { stiffness: 200, damping: 14 });
  const by = useSpring(useMotionValue(0), { stiffness: 200, damping: 14 });
  const onBtnMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    bx.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    by.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  };
  const onBtnLeave = () => {
    bx.set(0);
    by.set(0);
  };

  const titleWords = doorTitle.split(/\s+/).filter(Boolean);

  const marqueeGroup = (key: string) => (
    <div key={key} dir="rtl" className="flex shrink-0 items-center" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="flex items-center gap-8 pe-8">
          <span className="whitespace-nowrap font-main text-6xl text-white/[0.07] sm:text-8xl">
            {doorTitle}
          </span>
          <Sparkles className="shrink-0 text-white/[0.07]" size={48} />
        </span>
      ))}
    </div>
  );

  return (
    <section
      dir="rtl"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative overflow-hidden rounded-[2rem] rounded-tl-[6rem] bg-primary text-white shadow-2xl ${className}`}
    >
      {/* Giant background title, scrolling in opposite directions */}
      <div dir="ltr" className="pointer-events-none absolute inset-0 flex flex-col justify-around" aria-hidden="true">
        {[0, 1].map((row) => (
          <motion.div
            key={row}
            className="flex w-max"
            animate={reduce ? undefined : { x: row === 0 ? ['0%', '-50%'] : ['-50%', '0%'] }}
            transition={{ duration: row === 0 ? 55 : 70, repeat: Infinity, ease: 'linear' }}
          >
            {marqueeGroup('a')}
            {marqueeGroup('b')}
          </motion.div>
        ))}
      </div>

      {/* Twinkling stars */}
      {TWINKLES.map((t, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute text-amber-400"
          style={{ top: t.top, left: t.left }}
          animate={reduce ? undefined : { scale: [0.6, 1.2, 0.6], opacity: [0.3, 1, 0.3], rotate: [0, 90, 0] }}
          transition={{ duration: 3, delay: t.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles size={t.size} />
        </motion.span>
      ))}

      <div className="relative z-10 grid items-center gap-8 px-5 py-8 sm:px-10 sm:py-10 md:grid-cols-[1.1fr_0.9fr] md:gap-4">
        {/* ── Words ── */}
        <div className="min-w-0 space-y-5 text-right">
          <motion.p
            initial={reduce ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-1.5 text-xs font-black text-amber-300"
          >
            <Sparkles size={13} aria-hidden="true" />
            «عم وه» صاحب وموثّق المنصة
          </motion.p>

          <div>
            <h2 className="flex flex-wrap gap-x-3 font-main text-3xl leading-[1.25] sm:text-4xl lg:text-5xl">
              {titleWords.map((w, i) => (
                <span key={i} className="overflow-hidden pb-1">
                  <motion.span
                    initial={reduce ? false : { y: '120%', rotate: 6 }}
                    animate={{ y: 0, rotate: 0 }}
                    transition={{ duration: 0.7, delay: 0.25 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block"
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </h2>
            <motion.div
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.8, ease: 'easeOut' }}
              style={{ transformOrigin: 'right' }}
              className="mt-2 h-1.5 w-28 rounded-full bg-amber-500"
            />
          </div>

          {/* Quote on a taped paper note */}
          <motion.figure
            initial={reduce ? false : { opacity: 0, y: 40, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            whileHover={reduce ? undefined : { rotate: 0, y: -4, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.6 }}
            className="relative max-w-xl rounded-2xl bg-background p-5 pt-6 text-foreground shadow-xl"
          >
            <span aria-hidden="true" className="absolute -top-2.5 right-8 h-5 w-16 -rotate-6 rounded-sm bg-amber-500/80" />
            <span aria-hidden="true" className="absolute -top-2.5 left-10 h-5 w-14 rotate-6 rounded-sm bg-amber-500/80" />

            <blockquote className="relative text-sm font-bold leading-8 sm:text-base sm:leading-9" aria-label={quote}>
              <span className="invisible" aria-hidden="true">{`"${quote}"`}</span>
              <span className="absolute inset-0" aria-hidden="true">
                {`"${quote.slice(0, typed)}${typing ? '' : '"'}`}
                {typing && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="ms-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-primary"
                  />
                )}
              </span>
            </blockquote>

            <figcaption className="mt-3 flex items-center gap-1.5 border-t border-dashed border-border-subtle pt-2.5 text-[11px] font-black text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              — عم وه، صاحب وموثّق حكاوي وتراث الصعيد
            </figcaption>
          </motion.figure>

          {actionText && (
            <motion.div style={{ x: bx, y: by }} onPointerMove={onBtnMove} onPointerLeave={onBtnLeave} className="inline-block">
              <motion.button
                type="button"
                onClick={onAction}
                initial={reduce ? false : { opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 1.5 }}
                whileTap={reduce ? undefined : { scale: 0.93 }}
                className="group relative inline-flex cursor-pointer items-center gap-2 rounded-full bg-background px-6 py-3 text-xs font-black text-foreground shadow-lg transition-colors hover:bg-amber-500 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {!reduce && (
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full border-2 border-amber-400"
                    animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <span>{actionText}</span>
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* ── Mascot stage ── */}
        <div className="relative mx-auto h-80 w-full max-w-sm sm:h-[26rem]">
          {/* Morphing amber blob */}
          <motion.div style={{ x: blobX, y: blobY }} className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={
                reduce
                  ? undefined
                  : {
                      borderRadius: [
                        '60% 40% 30% 70% / 60% 30% 70% 40%',
                        '30% 60% 70% 40% / 50% 60% 30% 60%',
                        '60% 40% 30% 70% / 60% 30% 70% 40%',
                      ],
                      rotate: [0, 25, 0],
                    }
              }
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="h-56 w-56 bg-amber-500 sm:h-72 sm:w-72"
              style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
            />
          </motion.div>

          {/* Rotating dashed ring */}
          <motion.svg
            viewBox="0 0 100 100"
            aria-hidden="true"
            className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] text-white/50"
            animate={reduce ? undefined : { rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1.5 3.5" strokeLinecap="round" />
          </motion.svg>

          {/* Mascot */}
          <motion.div style={{ x: mascotX, y: mascotY }} className="absolute inset-0 z-10 flex items-end justify-center">
            <motion.div
              initial={reduce ? false : { y: 120, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.4 }}
              className="h-[88%]"
            >
              <motion.img
                animate={reduce ? undefined : { y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={reduce ? undefined : { rotate: [0, -5, 5, -3, 0], transition: { duration: 0.6 } }}
                src={mascotSrc || '/mascot/char.png'}
                alt={mascotRole}
                loading="eager"
                className="h-full w-auto object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.4)]"
              />
            </motion.div>
          </motion.div>

          {/* Stickers */}
          <Sticker x={nearX} y={nearY} reduce={reduce} rotate={-5} delay={0} className="right-0 top-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-background px-3 py-1.5 text-xs font-black text-primary shadow-lg">
              <Compass size={13} aria-hidden="true" />
              {doorBadge}
            </span>
          </Sticker>

          <Sticker x={farX} y={farY} reduce={reduce} rotate={4} delay={0.15} className="left-0 top-1/3">
            <span className="inline-block rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-black text-black shadow-lg">
              {mascotRole}
            </span>
          </Sticker>

          {statsText && (
            <Sticker x={nearX} y={nearY} reduce={reduce} rotate={-3} delay={0.3} className="bottom-8 right-2">
              <span className="inline-block rounded-xl bg-foreground px-3 py-1.5 text-xs font-bold text-background shadow-lg">
                {statsText}
              </span>
            </Sticker>
          )}

          <Sticker x={farX} y={farY} reduce={reduce} rotate={-8} delay={0.45} className="bottom-2 left-2">
            <span className="inline-block rounded-md border-2 border-white px-2 py-0.5 text-[11px] font-black text-white">
              توثيق صعيدى أصيل 100%
            </span>
          </Sticker>
        </div>
      </div>
    </section>
  );
};

export default UncleWahHeroBanner;
