import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80';

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = DEFAULT_FALLBACK,
  aspectRatio = 'auto',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    auto: ''
  }[aspectRatio];

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden bg-[#f0e6da] ${aspectClasses} ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#f0e6da] via-[#faf4ed] to-[#f0e6da] animate-pulse" />
      )}

      {/* Fallback Display if Error occurs */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f5ede4] text-[#8c7a6b] p-3 text-center">
          <ImageOff className="w-8 h-8 mb-1 text-[#b5a394]" />
          <span className="text-xs font-medium">تعذر تحميل الصورة التراثية</span>
        </div>
      ) : (
        <img
          src={src || fallbackSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          {...props}
        />
      )}
    </div>
  );
};
