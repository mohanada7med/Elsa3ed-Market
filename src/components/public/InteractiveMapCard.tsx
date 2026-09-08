import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapGovernorateData, MapMarkerItem } from '../../types';
import { HeritageGeometricMarker } from '../common/HeritageGeometricMarker';
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Compass,
  Ship,
  Sparkles,
  ArrowLeft,
  ShoppingBag,
  Landmark,
  Hammer,
  Utensils,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Layers,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InteractiveMapCardProps {
  governorates: MapGovernorateData[];
  markers: MapMarkerItem[];
  selectedGov: MapGovernorateData;
  onSelectGovernorate: (gov: MapGovernorateData) => void;
  selectedMarker?: MapMarkerItem | null;
  onSelectMarker: (marker: MapMarkerItem | null) => void;
  onNavigateToDossier: (slug: string) => void;
  onShopGovernorate: (govName: string) => void;
  className?: string;
}

// Upper Egypt Geographical Bounding Box
// Latitude: 23.6° N (Lake Nasser / Aswan) to 29.8° N (Fayoum / Beni Suef)
// Longitude: 28.0° E (Western Oases) to 33.6° E (Eastern Mountains / Nile Bend)
const MAP_BOUNDS = {
  minLat: 23.6,
  maxLat: 29.8,
  minLng: 28.0,
  maxLng: 33.6
};

// Canvas virtual dimensions
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 800;

export const InteractiveMapCard: React.FC<InteractiveMapCardProps> = ({
  governorates,
  markers,
  selectedGov,
  onSelectGovernorate,
  selectedMarker,
  onSelectMarker,
  onNavigateToDossier,
  onShopGovernorate,
  className = ''
}) => {
  // Map Viewport (Pan & Zoom)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter state
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpandedHeight, setIsExpandedHeight] = useState<boolean>(false);

  // Inspected Item (either a clicked Marker or a clicked Governorate)
  // Only populated upon explicit user interaction (click/tap)
  const [inspectedItem, setInspectedItem] = useState<{
    type: 'marker' | 'governorate';
    data: MapMarkerItem | MapGovernorateData;
  } | null>(null);

  // Sync if selectedMarker is set from outside
  useEffect(() => {
    if (selectedMarker) {
      setInspectedItem({ type: 'marker', data: selectedMarker });
    }
  }, [selectedMarker]);

  // Hovered item for micro tooltip on desktop
  const [hoveredMarker, setHoveredMarker] = useState<MapMarkerItem | null>(null);
  const [hoveredGov, setHoveredGov] = useState<MapGovernorateData | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Touch gesture state for mobile pinch-to-zoom and pan
  const touchStartRef = useRef<{
    touches: number;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
    initialDistance: number | null;
    initialZoom: number;
  }>({
    touches: 0,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
    initialDistance: null,
    initialZoom: 1
  });

  // Function to project real GPS (Lat, Lng) to Canvas coordinates (x, y)
  const projectCoords = (lat: number, lng: number): { x: number; y: number } => {
    // Invert lat because higher lat is North (top of map)
    const normY = (MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
    const normX = (lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);

    // Padding inside canvas: 70px X, 60px Y
    const padX = 70;
    const padY = 60;
    const availW = CANVAS_WIDTH - padX * 2;
    const availH = CANVAS_HEIGHT - padY * 2;

    const x = padX + normX * availW;
    const y = padY + normY * availH;
    return { x, y };
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.35, 2.6));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.35, 0.85));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Center on a specific governorate with smooth camera glide transition
  const centerOnGovernorate = (gov: MapGovernorateData) => {
    setIsDragging(false);
    const coords = gov.coordinates || { lat: 26.0, lng: 32.0 };
    const pt = projectCoords(coords.lat, coords.lng);
    const targetX = (CANVAS_WIDTH / 2 - pt.x) * 0.72;
    const targetY = (CANVAS_HEIGHT / 2 - pt.y) * 0.72;
    setPan({ x: targetX, y: targetY });
    setZoom(1.35);
  };

  // Center on a specific landmark or craft marker with smooth camera glide transition
  const centerOnMarker = (marker: MapMarkerItem) => {
    setIsDragging(false);
    const pt = projectCoords(marker.lat, marker.lng);
    const targetX = (CANVAS_WIDTH / 2 - pt.x) * 0.82;
    const targetY = (CANVAS_HEIGHT / 2 - pt.y) * 0.82;
    setPan({ x: targetX, y: targetY });
    setZoom(1.48);
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.interactive-marker')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch handlers for mobile devices (single finger pan, two fingers pinch-zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.interactive-marker')) {
      return;
    }
    if (e.touches.length === 1) {
      touchStartRef.current = {
        touches: 1,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startPanX: pan.x,
        startPanY: pan.y,
        initialDistance: null,
        initialZoom: zoom
      };
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = {
        touches: 2,
        startX: 0,
        startY: 0,
        startPanX: pan.x,
        startPanY: pan.y,
        initialDistance: dist,
        initialZoom: zoom
      };
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStartRef.current.touches === 1) {
      const dx = e.touches[0].clientX - touchStartRef.current.startX;
      const dy = e.touches[0].clientY - touchStartRef.current.startY;
      setPan({
        x: touchStartRef.current.startPanX + dx,
        y: touchStartRef.current.startPanY + dy
      });
    } else if (e.touches.length === 2 && touchStartRef.current.initialDistance) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartRef.current.initialDistance;
      const newZoom = Math.min(Math.max(touchStartRef.current.initialZoom * ratio, 0.85), 2.6);
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartRef.current.touches = 0;
    touchStartRef.current.initialDistance = null;
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0012;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.85), 2.6));
  };

  // Filtered Markers
  const filteredMarkers = useMemo(() => {
    return markers.filter((marker) => {
      // Category filter
      if (activeCategory !== 'all' && marker.type !== activeCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = marker.title.toLowerCase().includes(q);
        const matchesGov = marker.governorateName?.toLowerCase().includes(q);
        const matchesDesc = marker.shortDescription?.toLowerCase().includes(q);
        return matchesTitle || matchesGov || matchesDesc;
      }
      return true;
    });
  }, [markers, activeCategory, searchQuery]);

  // Derived detail for the active inspected item
  const itemData = useMemo(() => {
    if (!inspectedItem) return null;
    if (inspectedItem.type === 'marker') {
      const marker = inspectedItem.data as MapMarkerItem;
      return {
        title: marker.title,
        typeLabel: marker.typeLabel || (marker.type === 'place' ? 'صرح أثري' : marker.type === 'craft' ? 'حرفة يدوية' : 'سفرة وخيرات'),
        markerType: marker.type,
        governorateName: marker.governorateName,
        slug: marker.slug,
        coverImage: marker.coverImage || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600',
        shortDescription: marker.shortDescription || 'معلم تراثي أصيل مسجل ضمن أطلس صعيد مصر الحرفي والثقافي.',
        highlights: [marker.cityName, marker.category].filter(Boolean) as string[],
        isGovernorate: false,
        stats: undefined
      };
    } else {
      const gov = inspectedItem.data as MapGovernorateData;
      return {
        title: `محافظة ${gov.name}`,
        typeLabel: 'عاصمة ومحافظة',
        markerType: 'governorate',
        governorateName: gov.name,
        slug: gov.slug,
        coverImage: gov.coverImage || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600',
        shortDescription: gov.shortIntro || 'إحدى محافظات صعيد مصر العريقة ذات التاريخ التليد، والحرف اليدوية الأصيلة، والمعالم الخالدة.',
        highlights: gov.famousFor || [],
        isGovernorate: true,
        stats: gov.stats
      };
    }
  }, [inspectedItem]);

  const handleDismissInspector = () => {
    setInspectedItem(null);
    onSelectMarker(null);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-[2rem] bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-xl overflow-hidden select-none transition-all duration-300 ${
        isExpandedHeight ? 'h-[620px] sm:h-[750px]' : 'h-[440px] sm:h-[540px] md:h-[620px]'
      } ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* =========================================================
          1. TOP FLOATING GLASSMORPHIC CONTROL BAR (RESPONSIVE)
          Search, Category Chips, Zoom and Height Controls
         ========================================================= */}
      <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 z-30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none">
        {/* Left/Start: Search and Category Pills (Pointer events enabled) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pointer-events-auto">
          {/* Glass Search Input */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#211d18]/50 dark:text-[#f5f0e7]/50 absolute right-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالخريطة..."
              className="w-28 sm:w-44 bg-white/90 dark:bg-[#151513]/90 backdrop-blur-md text-xs font-bold text-[#211d18] dark:text-[#f5f0e7] rounded-xl pl-6 pr-8 py-1.5 sm:py-2 border border-black/10 dark:border-white/10 shadow-xs outline-none focus:w-36 sm:focus:w-52 transition-all focus:border-[#9a6a35]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2 text-[#211d18]/50 dark:text-[#f5f0e7]/50 hover:text-[#9a6a35] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Marker Filter Chips (Scrollable on small screens) */}
          <div className="flex items-center gap-1 bg-white/90 dark:bg-[#151513]/90 backdrop-blur-md p-1 rounded-xl border border-black/10 dark:border-white/10 shadow-xs overflow-x-auto no-scrollbar max-w-[210px] sm:max-w-none">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-[#9a6a35] text-white shadow-xs'
                  : 'text-[#211d18]/70 dark:text-[#f5f0e7]/70 hover:text-[#211d18] dark:hover:text-[#f5f0e7]'
              }`}
            >
              الكل ({markers.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('place')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'place'
                  ? 'bg-[#9a6a35] text-white shadow-xs'
                  : 'text-[#211d18]/70 dark:text-[#f5f0e7]/70 hover:text-[#211d18] dark:hover:text-[#f5f0e7]'
              }`}
              title="الصروح والمعالم"
            >
              <Landmark className="w-3 h-3" />
              <span className="hidden sm:inline">صروح</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('craft')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'craft'
                  ? 'bg-[#9a6a35] text-white shadow-xs'
                  : 'text-[#211d18]/70 dark:text-[#f5f0e7]/70 hover:text-[#211d18] dark:hover:text-[#f5f0e7]'
              }`}
              title="الحرف والورش"
            >
              <Hammer className="w-3 h-3" />
              <span className="hidden sm:inline">حرف</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('food')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'food'
                  ? 'bg-[#9a6a35] text-white shadow-xs'
                  : 'text-[#211d18]/70 dark:text-[#f5f0e7]/70 hover:text-[#211d18] dark:hover:text-[#f5f0e7]'
              }`}
              title="سفرة وخيرات البلد"
            >
              <Utensils className="w-3 h-3" />
              <span className="hidden sm:inline">سفرة</span>
            </button>
          </div>
        </div>

        {/* Right/End: Zoom & Navigation Tools (Pointer events enabled) */}
        <div className="flex items-center gap-1 self-end sm:self-auto pointer-events-auto bg-white/90 dark:bg-[#151513]/90 backdrop-blur-md p-1 rounded-xl border border-black/10 dark:border-white/10 shadow-xs">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] transition-colors cursor-pointer"
            title="تكبير الخريطة"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] transition-colors cursor-pointer"
            title="تصغير الخريطة"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] transition-colors cursor-pointer"
            title="إعادة ضبط الرؤية"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <div className="hidden sm:block w-[1px] h-4 bg-black/10 dark:border-white/10" />

          <button
            type="button"
            onClick={() => setIsExpandedHeight((prev) => !prev)}
            className="hidden sm:block p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] transition-colors cursor-pointer"
            title={isExpandedHeight ? 'تصغير حجم البطاقة' : 'توسيع حجم البطاقة'}
          >
            {isExpandedHeight ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* =========================================================
          2. FLOATING STATION SELECTION RIBBON (مسار النيل السريع)
          Hidden on small screens (md:block) to prevent clutter!
         ========================================================= */}
      <div className="hidden md:block absolute bottom-4 inset-x-4 z-30 pointer-events-none">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 bg-white/95 dark:bg-[#151513]/95 backdrop-blur-xl p-2 rounded-2xl border border-black/10 dark:border-white/10 shadow-lg pointer-events-auto">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 text-xs font-black text-[#9a6a35] dark:text-[#d5a56d] shrink-0 border-l border-black/10 dark:border-white/10">
            <Ship className="w-4 h-4" />
            <span>محطات النيل:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1">
            {governorates.map((gov, idx) => {
              const isCurrent = selectedGov?.id === gov.id || selectedGov?.name === gov.name;
              return (
                <button
                  key={gov.id || idx}
                  type="button"
                  onClick={() => {
                    setInspectedItem({ type: 'governorate', data: gov });
                    onSelectGovernorate(gov);
                    centerOnGovernorate(gov);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                    isCurrent
                      ? 'bg-[#9a6a35] text-white border-[#9a6a35] shadow-xs scale-105'
                      : 'bg-black/5 dark:bg-white/5 text-[#211d18]/80 dark:text-[#f5f0e7]/80 border-black/10 dark:border-white/10 hover:border-[#9a6a35]'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-[#9a6a35] text-white text-[10px] font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{gov.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================
          3. MAIN INTERACTIVE SVG CANVAS (الخريطة التفاعلية)
          Features Nile River, Topography, Regional Areas & Markers
         ========================================================= */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        <svg
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="w-full h-full select-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%',
            transition: isDragging
              ? 'none'
              : 'transform 750ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <defs>
            {/* Authentic Topographic Desert Texture Pattern */}
            <linearGradient id="desertBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F9F4EC" />
              <stop offset="50%" stopColor="#F4ECE0" />
              <stop offset="100%" stopColor="#EDE0CE" />
            </linearGradient>

            {/* Dark Desert Gradient */}
            <linearGradient id="desertBgDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1B1613" />
              <stop offset="50%" stopColor="#181310" />
              <stop offset="100%" stopColor="#14100E" />
            </linearGradient>

            {/* Nile River Lapis Blue Gradient */}
            <linearGradient id="nileRiverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2A82A8" />
              <stop offset="35%" stopColor="#1F698C" />
              <stop offset="70%" stopColor="#1B5B7D" />
              <stop offset="100%" stopColor="#164A66" />
            </linearGradient>

            {/* Nile Valley Lush Green Ribbon Gradient */}
            <linearGradient id="valleyGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CDE8D8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#B3DCBF" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#9BCDA9" stopOpacity="0.8" />
            </linearGradient>

            {/* Lake Nasser Gradient */}
            <linearGradient id="lakeNasserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1B5B7D" />
              <stop offset="100%" stopColor="#123B52" />
            </linearGradient>

            {/* Drop Shadow for River and Land */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Desert Sands */}
          <rect
            x="0"
            y="0"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="url(#desertBg)"
            className="dark:hidden"
          />
          <rect
            x="0"
            y="0"
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            fill="url(#desertBgDark)"
            className="hidden dark:block"
          />

          {/* Topographic Contour Lines (خطوط كونتور تضاريس الصحراء) */}
          <g opacity="0.18" stroke="#8C6E54" strokeWidth="0.8" fill="none">
            <path d="M50 120 C180 140, 240 260, 160 380 C110 460, 80 580, 190 700" />
            <path d="M120 80 C280 120, 310 280, 220 440 C170 540, 150 640, 260 760" />
            <path d="M780 80 C700 200, 740 380, 840 500 C910 600, 860 720, 950 780" />
            <path d="M850 40 C790 180, 820 340, 920 460 C980 540, 960 680, 980 750" />
          </g>

          {/* Western Desert Oases Shading (الوادي الجديد: الواحات الغربية) */}
          <g opacity="0.45">
            {/* Kharga / Dakhla Oasis Grove Area */}
            <ellipse cx="380" cy="530" rx="140" ry="90" fill="#E6D7BD" className="dark:fill-[#2A211B]" />
            <ellipse cx="380" cy="530" rx="90" ry="50" fill="#D9C7A5" className="dark:fill-[#332820]" />
            {/* Palm Grove icons in oasis */}
            <text x="355" y="525" fontSize="16" opacity="0.65">🌴</text>
            <text x="385" y="540" fontSize="18" opacity="0.75">🌴</text>
            <text x="365" y="555" fontSize="14" opacity="0.65">🌴</text>
            <text
              x="380"
              y="580"
              textAnchor="middle"
              className="text-[12px] font-bold fill-[#7A644D] dark:fill-[#B8A38E]"
            >
              واحات الوادي الجديد (الصحراء الغربية)
            </text>
          </g>

          {/* Eastern Desert Mountain Ridges (سلسلة جبال البحر الأحمر والصحراء الشرقية) */}
          <g opacity="0.35">
            <path
              d="M750 180 L790 230 L830 200 L870 270 L910 240 L950 320"
              stroke="#B38B6D"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
            />
            <text
              x="870"
              y="220"
              className="text-[11px] font-bold fill-[#8A684C] dark:fill-[#C4A992]"
            >
              الصحراء الشرقية
            </text>
          </g>

          {/* =========================================================
              THE NILE VALLEY FERTILE BELT (الشريط الزراعي الأخضر)
              Flowing behind the Nile River
             ========================================================= */}
          <path
            d="
              M 525 80
              C 520 130, 505 180, 500 230
              C 495 280, 505 320, 530 360
              C 555 400, 570 440, 610 470
              C 650 500, 715 510, 735 550
              C 750 580, 740 620, 725 660
              C 715 690, 725 720, 740 750
            "
            stroke="url(#valleyGreenGrad)"
            strokeWidth="38"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />

          {/* =========================================================
              THE SACRED NILE RIVER (مجرى نهر النيل الخالد)
              Flows from South (Aswan / Lake Nasser) to North
              Features the dramatic East bend at Qena (ثنية قنا)
             ========================================================= */}
          <path
            d="
              M 525 80
              C 520 130, 505 180, 500 230
              C 495 280, 505 320, 530 360
              C 555 400, 570 440, 610 470
              C 650 500, 715 510, 735 550
              C 750 580, 740 620, 725 660
              C 715 690, 725 720, 740 750
            "
            stroke="url(#nileRiverGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
            filter="url(#softGlow)"
          />

          {/* Lake Nasser at the South end (بحيرة ناصر) */}
          <path
            d="M 735 745 C 750 760, 765 775, 755 800 C 740 815, 720 805, 710 785 C 700 765, 720 750, 735 745 Z"
            fill="url(#lakeNasserGrad)"
            opacity="0.9"
          />
          <text
            x="770"
            y="785"
            className="text-[10px] font-bold fill-[#1F698C] dark:fill-[#58A5CC]"
          >
            بحيرة ناصر
          </text>

          {/* Traditional Felucca Sailboats on the Nile (مراكب شراعية نيلية) */}
          <g opacity="0.8">
            {/* Felucca near Minya */}
            <path d="M 508 270 L 514 258 L 517 270 Z" fill="#FFFFFF" stroke="#8C4A28" strokeWidth="0.5" />
            <path d="M 505 271 L 520 271 L 518 274 L 507 274 Z" fill="#8C4A28" />

            {/* Felucca near Luxor */}
            <path d="M 726 630 L 733 617 L 736 630 Z" fill="#FFFFFF" stroke="#8C4A28" strokeWidth="0.5" />
            <path d="M 723 631 L 739 631 L 737 634 L 725 634 Z" fill="#8C4A28" />

            {/* Felucca near Aswan */}
            <path d="M 731 710 L 738 697 L 741 710 Z" fill="#FFFFFF" stroke="#8C4A28" strokeWidth="0.5" />
            <path d="M 728 711 L 744 711 L 742 714 L 730 714 Z" fill="#8C4A28" />
          </g>

          {/* =========================================================
              GOVERNORATE CLICKABLE REGION BADGES (عواصم ومحافظات الصعيد)
              Rendered with Royal Octagonal Heritage Geometric Seals
             ========================================================= */}
          {governorates.map((gov) => {
            const coords = gov.coordinates || { lat: 26.0, lng: 32.0 };
            const pt = projectCoords(coords.lat, coords.lng);
            const isSelected = selectedGov?.id === gov.id || selectedGov?.name === gov.name;
            const isHovered = hoveredGov?.id === gov.id;

            return (
              <foreignObject
                key={`gov-node-${gov.id}`}
                x={pt.x - 48}
                y={pt.y - 64}
                width="96"
                height="88"
                className="overflow-visible pointer-events-auto interactive-marker"
              >
                <div className="w-full h-full flex flex-col items-center justify-end">
                  <HeritageGeometricMarker
                    id={`gov-${gov.id}`}
                    type="governorate"
                    shape="octagon"
                    title={gov.name}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    size={isSelected ? 'lg' : 'md'}
                    showLabel={false}
                    onClick={() => {
                      setInspectedItem({ type: 'governorate', data: gov });
                      onSelectGovernorate(gov);
                      centerOnGovernorate(gov);
                    }}
                    onMouseEnter={() => setHoveredGov(gov)}
                    onMouseLeave={() => setHoveredGov(null)}
                  />
                  {/* Governorate Name Badge underneath with smooth transition */}
                  <button
                    type="button"
                    onClick={() => {
                      setInspectedItem({ type: 'governorate', data: gov });
                      onSelectGovernorate(gov);
                      centerOnGovernorate(gov);
                    }}
                    className={`mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer shadow-xs whitespace-nowrap transition-all duration-300 border select-none ${
                      isSelected
                        ? 'bg-[#8A2508] text-white border-amber-400 scale-105 shadow-md ring-2 ring-amber-300/40'
                        : 'bg-white/95 dark:bg-[#201A16]/95 text-[#241E1A] dark:text-[#F7F3EE] border-[#E0D5C3] dark:border-[#3D3128] hover:border-[#8A2508]'
                    }`}
                  >
                    {gov.name}
                  </button>
                </div>
              </foreignObject>
            );
          })}

          {/* =========================================================
              MINIATURE HERITAGE GEOMETRIC MARKERS (مؤشرات الأشكال التراثية)
              Plotted dynamically across Upper Egypt using GPS coordinates
             ========================================================= */}
          {filteredMarkers.map((marker) => {
            const pt = projectCoords(marker.lat, marker.lng);
            const isSelected = selectedMarker?.id === marker.id;
            const isHovered = hoveredMarker?.id === marker.id;

            return (
              <foreignObject
                key={`marker-obj-${marker.id}`}
                x={pt.x - 40}
                y={pt.y - 56}
                width="80"
                height="66"
                className="overflow-visible pointer-events-auto interactive-marker"
              >
                <div className="w-full h-full flex items-end justify-center">
                  <HeritageGeometricMarker
                    id={marker.id}
                    type={marker.type}
                    title={marker.title}
                    governorateName={marker.governorateName}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    size={isSelected ? 'lg' : 'md'}
                    showLabel={false} // Handled cleanly by the floating inspector card / bottom sheet
                    onClick={() => {
                      setInspectedItem({ type: 'marker', data: marker });
                      onSelectMarker(marker);
                      centerOnMarker(marker);
                      // Also find matching governorate if exists
                      const matchingGov = governorates.find(
                        (g) => g.id === marker.governorateId || g.name === marker.governorateName
                      );
                      if (matchingGov) {
                        onSelectGovernorate(matchingGov);
                      }
                    }}
                    onMouseEnter={() => setHoveredMarker(marker)}
                    onMouseLeave={() => setHoveredMarker(null)}
                  />
                </div>
              </foreignObject>
            );
          })}
        </svg>
      </div>

      {/* =========================================================
          4. DESKTOP FLOATING INSPECTOR (ONLY SHOWN WHEN SELECTED)
          Shown on desktop (hidden sm:block), appears when an item is tapped
         ========================================================= */}
      <AnimatePresence>
        {itemData && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="hidden sm:block absolute top-20 left-4 z-40 max-w-[320px] w-full bg-white/95 dark:bg-[#151513]/95 backdrop-blur-xl rounded-[1.5rem] border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden pointer-events-auto"
          >
            {/* Header: Photo banner */}
            <div className="relative h-28 overflow-hidden bg-stone-900">
              <img
                src={itemData.coverImage}
                alt={itemData.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Close Button */}
              <button
                type="button"
                onClick={handleDismissInspector}
                className="absolute top-2.5 left-2.5 p-1 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                title="إغلاق بطاقة المعاينة"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Category Badge & Governorate */}
              <div className="absolute bottom-2.5 right-3 left-3 text-white">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#9a6a35] text-white text-[10px] font-black">
                    {itemData.typeLabel}
                  </span>
                  {itemData.governorateName && (
                    <span className="text-[11px] text-amber-200 font-bold">
                      • {itemData.governorateName}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-black font-heritage leading-tight drop-shadow-md truncate">
                  {itemData.title}
                </h4>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-3.5 space-y-2.5">
              <p className="text-xs text-[#211d18]/80 dark:text-[#f5f0e7]/80 leading-relaxed line-clamp-2">
                {itemData.shortDescription}
              </p>

              {/* Tags / Highlights */}
              {itemData.highlights && itemData.highlights.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {itemData.highlights.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[9px] font-bold text-[#211d18]/70 dark:text-[#f5f0e7]/70"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Action Buttons */}
              <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (itemData.slug) onNavigateToDossier(itemData.slug);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>فتح الدليل الكامل</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (itemData.governorateName) onShopGovernorate(itemData.governorateName);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-black/10 dark:border-white/10"
                  title="تسوّق منتجات الورشة"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#9a6a35]" />
                  <span>المتجر</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================
          5. MOBILE BOTTOM SHEET (المنبثق السفلي للشاشات الصغيرة)
          Appears smoothly from the bottom when any landmark or
          governorate is tapped on mobile devices (sm:hidden)
         ========================================================= */}
      <AnimatePresence>
        {itemData && (
          <>
            {/* Backdrop Tap to Dismiss */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleDismissInspector}
              className="sm:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
            />

            {/* Bottom Sheet Modal */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="sm:hidden fixed inset-x-0 bottom-0 z-50 bg-white/95 dark:bg-[#151513]/95 backdrop-blur-2xl rounded-t-[2rem] border-t border-black/10 dark:border-white/10 shadow-2xl overflow-hidden max-h-[82vh] flex flex-col pointer-events-auto"
            >
              {/* Drag Handle Indicator */}
              <div
                className="pt-3 pb-1.5 flex justify-center cursor-pointer"
                onClick={handleDismissInspector}
              >
                <div className="w-12 h-1.5 rounded-full bg-black/20 dark:bg-white/20" />
              </div>

              {/* Sheet Scrollable Body */}
              <div className="overflow-y-auto p-4 space-y-3.5 flex-1">
                {/* Visual Banner with Pottery Badge */}
                <div className="relative h-36 rounded-2xl overflow-hidden bg-stone-900 shadow-inner">
                  <img
                    src={itemData.coverImage}
                    alt={itemData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={handleDismissInspector}
                    className="absolute top-2.5 left-2.5 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                    title="إغلاق النافذة"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Badges on image */}
                  <div className="absolute bottom-2.5 right-3 left-3 text-white">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#9a6a35] text-white text-[11px] font-black">
                        {itemData.typeLabel}
                      </span>
                      {itemData.governorateName && (
                        <span className="text-xs text-amber-200 font-bold">
                          • {itemData.governorateName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black font-heritage leading-tight drop-shadow-md">
                      {itemData.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#211d18]/80 dark:text-[#f5f0e7]/80 leading-relaxed">
                  {itemData.shortDescription}
                </p>

                {/* Highlights */}
                {itemData.highlights && itemData.highlights.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {itemData.highlights.slice(0, 4).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[10px] font-bold text-[#211d18]/70 dark:text-[#f5f0e7]/70"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* If governorate, show 3 stats pills */}
                {itemData.stats && (
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-black/10 dark:border-white/10">
                      <span className="block text-base font-black text-[#9a6a35] dark:text-[#d5a56d]">{itemData.stats.placesCount || 0}</span>
                      <span className="text-[10px] text-[#211d18]/60 dark:text-[#f5f0e7]/60 font-bold">معالم وصروح</span>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-black/10 dark:border-white/10">
                      <span className="block text-base font-black text-[#9a6a35] dark:text-[#d5a56d]">{itemData.stats.craftsCount || 0}</span>
                      <span className="text-[10px] text-[#211d18]/60 dark:text-[#f5f0e7]/60 font-bold">حرف وورش</span>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-2 rounded-xl border border-black/10 dark:border-white/10">
                      <span className="block text-base font-black text-[#9a6a35] dark:text-[#d5a56d]">{itemData.stats.productsCount || 0}</span>
                      <span className="text-[10px] text-[#211d18]/60 dark:text-[#f5f0e7]/60 font-bold">منتجات بالسوق</span>
                    </div>
                  </div>
                )}

                {/* Thumb-friendly CTA Buttons */}
                <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (itemData.slug) onNavigateToDossier(itemData.slug);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                  >
                    <Landmark className="w-4 h-4" />
                    <span>فتح الدليل التوثيقي</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (itemData.governorateName) onShopGovernorate(itemData.governorateName);
                    }}
                    className="py-3 px-4 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-black/10 dark:border-white/10"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#9a6a35]" />
                    <span>تسوّق</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
