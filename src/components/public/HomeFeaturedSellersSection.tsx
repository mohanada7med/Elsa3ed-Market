import React from 'react';
import { FeaturedSellers } from './FeaturedSellers';

export const HomeFeaturedSellersSection: React.FC = () => (
  <section
    style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 450px' }}
    className="relative overflow-hidden"
  >
    <div
      className="pointer-events-none absolute inset-0 z-0 opacity-[0.035] mix-blend-screen"
      style={{
        backgroundImage: "url('/pattern/pat2.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '520px auto',
        backgroundPosition: 'center',
        maskImage: 'radial-gradient(ellipse at center, black 25%, transparent 78%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, black 25%, transparent 78%)',
      }}
      aria-hidden="true"
    />
    <div className="relative z-10">
      <FeaturedSellers />
    </div>
  </section>
);
