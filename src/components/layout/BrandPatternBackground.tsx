import React from 'react';

export const BrandPatternBackground: React.FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen"
    style={{
      backgroundImage: "url('/pattern/pat2.png')",
      backgroundRepeat: 'repeat',
      backgroundSize: '520px auto',
      backgroundPosition: 'center',
      maskImage: 'radial-gradient(ellipse at 50% 30%, black 40%, transparent 85%)',
      WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 40%, transparent 85%)',
    }}
  />
);
