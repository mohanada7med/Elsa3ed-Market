import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Info,
  MapPin,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers
} from 'lucide-react';
import { NubianGeometricPattern } from '../common/NubianGeometricPattern';

export interface TourHotspot {
  id: string;
  yaw: number; // horizontal angle in degrees (0 to 360)
  pitch: number; // vertical angle in degrees (-90 to 90)
  title: string;
  description: string;
  tag: string;
}

export interface PanoramicTourItem {
  id: string;
  title: string;
  slug: string;
  governorate: string;
  location: string;
  historicalPeriod: string;
  panoramaImage: string; // High-res equirectangular or cylindrical image
  thumbnailImage: string;
  shortDescription: string;
  detailedInsight: string;
  hotspots: TourHotspot[];
  coordinates: { lat: number; lng: number };
}

export const PANORAMIC_TOURS: PanoramicTourItem[] = [
  {
    id: 'tour-1',
    title: 'معبد دندرة وسقف الزودياك',
    slug: 'dendera-temple',
    governorate: 'قنا',
    location: 'دندرة، غرب مدينة قنا',
    historicalPeriod: 'العصر البطلمي والروماني (حتحور)',
    panoramaImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=2600&q=85',
    thumbnailImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80',
    shortDescription: 'أحد أبهى معابد مصر القديمة وأكثرها حفظاً لألوانها الفلكية الزرقاء وسقف دائرة البروج السماوية.',
    detailedInsight: 'يتميز معبد حتحور بدندرة بصالة الأعمدة المكونة من 24 عموداً تعلوها رؤوس حتحورية ذات أربعة وجوه، وسقف مزين بالكامل بنقوش فلكية استثنائية تمثل رحلة الإله رع والنجوم ومنازل القمر.',
    hotspots: [
      {
        id: 'h-1',
        yaw: 45,
        pitch: 35,
        title: 'سقف الزودياك الفلكي الأزرق',
        description: 'نقش دائري فريد يرسم الأبراج السماوية الاثني عشر وحركة الكواكب، وهو أقدم تقويم فلكي تفصيلي موثق في العالم القديم.',
        tag: 'فلك وعمارة'
      },
      {
        id: 'h-2',
        yaw: 180,
        pitch: -5,
        title: 'الأعمدة الحتحورية الأربعة والعشرون',
        description: 'أعمدة شاهقة تبرز وجه الإلهة حتحور رمز الجمال والموسيقى والأمومة، حافظت على نقوشها الملونة الأصلية رغم مرور آلاف السنين.',
        tag: 'عمارة فرعونية'
      },
      {
        id: 'h-3',
        yaw: 290,
        pitch: 10,
        title: 'السرداب السري للمعبد',
        description: 'ممرات ضيقة في جدران المعبد كانت مخصصة لحفظ أواني العبادة الذهبية والتماثيل المقدسة أثناء الاحتفالات الدينية السنوية.',
        tag: 'أسرار المعبد'
      }
    ],
    coordinates: { lat: 26.1425, lng: 32.6703 }
  },
  {
    id: 'tour-2',
    title: 'معبد أبو سمبل الكبير وصرح رمسيس الثاني',
    slug: 'abu-simbel',
    governorate: 'أسوان',
    location: 'أبو سمبل، جنوب بحيرة ناصر',
    historicalPeriod: 'الدولة الحديثة (الأسرة الـ 19)',
    panoramaImage: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=2600&q=85',
    thumbnailImage: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80',
    shortDescription: 'أعظم معبد منحوت في الصخر في التاريخ، تشهد واجهته على هيبة رمسيس الثاني وأعجوبة تعامد الشمس السنوي.',
    detailedInsight: 'نُحت معبد أبو سمبل في عمق الجبل الصخري تخليداً لانتصار رمسيس الثاني في معركة قادش، وتتعامد الشمس على وجه الملك داخل قدس الأقداس مرتين سنوياً في 22 أكتوبر و22 فبراير في هندسة فلكية معجزة.',
    hotspots: [
      {
        id: 'h-4',
        yaw: 0,
        pitch: 0,
        title: 'التماثيل الملكية الأربعة الشامخة',
        description: 'أربعة تماثيل عملاقة للملك رمسيس الثاني يصل ارتفاع كل منها إلى 20 متراً، منقوشة في قلب صخر جبل مرو على ضفاف النيل.',
        tag: 'نحت صخري'
      },
      {
        id: 'h-5',
        yaw: 90,
        pitch: -15,
        title: 'صالة المعبد الداخلية والأعمدة الأوزيرية',
        description: 'ثمانية أعمدة ضخمة تصور رمسيس الثاني في الهيئة الأوزيرية محاطة بمشاهد بطولية من معركة قادش وسيرته الحربية.',
        tag: 'تاريخ حربي'
      },
      {
        id: 'h-6',
        yaw: 220,
        pitch: -8,
        title: 'بحيرة ناصر والنيل الخالد',
        description: 'الإطلالة الطبيعية الساحرة على مياه بحيرة ناصر بعد عملية نقل المعبد التاريخية الملحمية تحت إشراف منظمة اليونسكو عام 1968.',
        tag: 'إنقاذ الآثار'
      }
    ],
    coordinates: { lat: 22.3372, lng: 31.6258 }
  },
  {
    id: 'tour-3',
    title: 'صالة الأعمدة الكبرى بمعبد الكرنك',
    slug: 'karnak-hypostyle-hall',
    governorate: 'الأقصر',
    location: 'الكرنك، شرق النيل بالأقصر',
    historicalPeriod: 'الدولة الحديثة (طيبة العاصمة)',
    panoramaImage: 'https://images.unsplash.com/photo-1544885935-98dd03b09034?auto=format&fit=crop&w=2600&q=85',
    thumbnailImage: 'https://images.unsplash.com/photo-1544885935-98dd03b09034?auto=format&fit=crop&w=600&q=80',
    shortDescription: 'غابة الأعمدة الصخرية الأسطورية المكونة من 134 عموداً برديّا شاهقاً تجسد أوج القوة المعمارية المصرية القديمة.',
    detailedInsight: 'تعتبر صالة الأعمدة بالكرنك إحدى عجائب العمارة العالمية؛ تمتد الأعمدة المركزية بارتفاع 21 متراً وتيجان مفتوحة تتسع لـ 50 شخصاً للوقوف فوق كل تاج عمود.',
    hotspots: [
      {
        id: 'h-7',
        yaw: 15,
        pitch: 25,
        title: 'الأعمدة البردية المركزية الشاهقة',
        description: '12 عموداً مركزياً عملاقاً بتيجان مفتوحة تمثل نبات البردي النيلي في رمزيته للخلق والتجدد الأبدي.',
        tag: 'عمارة طيبية'
      },
      {
        id: 'h-8',
        yaw: 160,
        pitch: 40,
        title: 'شبابيك الإضاءة العلوية (Clerestory)',
        description: 'فتحات حجرية مشبكة أعلى الصالة صُممت لتسمح بنفاذ حزم ضوء شمسية درامية تسقط على نقوش الملوك والآلهة.',
        tag: 'هندسة الضوء'
      }
    ],
    coordinates: { lat: 25.7188, lng: 32.6573 }
  },
  {
    id: 'tour-4',
    title: 'معبد فيلة وجزيرة إيزيس العائمة',
    slug: 'philae-temple',
    governorate: 'أسوان',
    location: 'جزيرة أجيليكا، أسوان',
    historicalPeriod: 'العصر البطلمي واليوناني الروماني',
    panoramaImage: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=2600&q=85',
    thumbnailImage: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=600&q=80',
    shortDescription: 'درة النيل الرابضة بين الجزر الغرانيتية، ومركز عبادة إيزيس وموطن آخر نص هيروغليفي كُتب في التاريخ.',
    detailedInsight: 'يقع المعبد وسط مياه الشلال الأول بالنيل في بيئة طبيعية نادرة تجمع صخور الجرانيت الوردي مع زرقة المياه الصافية وخضرة النخيل النوبي.',
    hotspots: [
      {
        id: 'h-9',
        yaw: 50,
        pitch: 10,
        title: 'مقصورة تراجان الكلاسيكية (سرير فرعون)',
        description: 'كشك معماري شهير يتألف من 14 عموداً بتيجان زهرية، بني لرسو مواكب الإلهة إيزيس القادمة عبر النيل.',
        tag: 'معالم فيلة'
      },
      {
        id: 'h-10',
        yaw: 280,
        pitch: 0,
        title: 'بوابة إيزيس ونقش آخر هيروغليفية',
        description: 'على هذا الجدار تم نقش آخر نص هيروغليفي مسجل في التاريخ الإنساني عام 394 ميلادية قبل اندثار الكتابة القديمة.',
        tag: 'تاريخ لغوي'
      }
    ],
    coordinates: { lat: 24.0253, lng: 32.8844 }
  },
  {
    id: 'tour-5',
    title: 'القرية النوبية التراثية بجزيرة هيسا',
    slug: 'nubian-village-heissa',
    governorate: 'أسوان',
    location: 'جزيرة هيسا، جنوب خزان أسوان',
    historicalPeriod: 'التراث النوبي الحي عبر العصور',
    panoramaImage: 'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?auto=format&fit=crop&w=2600&q=85',
    thumbnailImage: 'https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?auto=format&fit=crop&w=600&q=80',
    shortDescription: 'بيوت القباب الطينية الملونة بالأزرق والأصفر النيلي، ورائحة الشاي بالنعناع ونغمات الطنبور الأصيلة.',
    detailedInsight: 'جزيرة هيسا من أقدم جزر النوبة الصامدة وسط النيل؛ تحافظ منازلها على طراز العمارة البيئية الطينية ذات القباب الباردة صيفاً، وزخارف الطيور والزهور التي تعبر عن الهوية النوبية العريقة.',
    hotspots: [
      {
        id: 'h-11',
        yaw: 30,
        pitch: -5,
        title: 'عمارة القباب والتهوية الطبيعية',
        description: 'قباب مبنية من الطوب اللبن تسمح للهواء الساخن بالصعود والتبريد التلقائي لداخل البيت دون الحاجة لمكيفات.',
        tag: 'عمارة بيئية'
      },
      {
        id: 'h-12',
        yaw: 210,
        pitch: 5,
        title: 'النقوش الجدارية وألوان الحناء والطبيعة',
        description: 'رسومات هندسية ومثلثات مستوحاة من التمساح النيلي ورموز الخصوبة والبركة الموروثة من أجداد النوبة.',
        tag: 'فنون تلقائية'
      }
    ],
    coordinates: { lat: 24.015, lng: 32.872 }
  },
  {
    id: 'tour-6',
    title: 'معبد سيتي الأول وقدس الأقداس بأبيدوس',
    slug: 'abydos-seti-temple',
    governorate: 'سوهاج',
    location: 'أبيدوس (العرابة المدفونة)، البلينا، سوهاج',
    historicalPeriod: 'الدولة الحديثة (الأسرة الـ 19)',
    panoramaImage: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=2600&q=85',
    thumbnailImage: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=600&q=80',
    shortDescription: 'مهد ملوك مصر ومقر مقاصير الآلهة السبع وقائمة ملوك أبيدوس التاريخية المنقوشة بأعلى درجات الدقة الفنية.',
    detailedInsight: 'معبد أبيدوس بني على شكل حرف L نادر في العمارة المصرية القديمة، ونقوشه الجدارية البارزة المصنوعة من الحجر الجيري الأبيض تعتبر الأجمل والأكثر نقاءً وإتقاناً في كل آثار مصر.',
    hotspots: [
      {
        id: 'h-13',
        yaw: 40,
        pitch: 0,
        title: 'قائمة ملوك أبيدوس الملكية',
        description: 'جدار تاريخي يضم خراطيش 76 ملكاً من ملوك مصر ابتداءً من الملك مينا موحد القطرين حتى الملك سيتي الأول.',
        tag: 'سجل الملوك'
      },
      {
        id: 'h-14',
        yaw: 170,
        pitch: -10,
        title: 'الأوزيريون (قبر أوزوريس الرمزي)',
        description: 'مبنى ضخم من كتل الغرانيت الأحمر المهيبة غاطس تحت منسوب المياه الجوفية خلف المعبد، ويعد لغزاً معمارياً مدهشاً.',
        tag: 'أسرار أبيدوس'
      }
    ],
    coordinates: { lat: 26.1847, lng: 31.9189 }
  },
  {
    id: 'tour-7',
    title: 'الدير المحرق وجبل قسقام التاريخي',
    slug: 'al-muharraq-monastery',
    governorate: 'أسيوط',
    location: 'جبل قسقام، القوصية، أسيوط',
    historicalPeriod: 'القرن الرابع الميلادي (محطة العائلة المقدسة)',
    panoramaImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2600&q=85',
    thumbnailImage: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    shortDescription: 'أطول محطة استقرت بها العائلة المقدسة في صعيد مصر (أكثر من 6 أشهر)، وكنيسة العذراء العتيقة المنحوتة في الصخر.',
    detailedInsight: 'يعد الدير المحرق من أقدم الأديرة العامرة في العالم المسيحي، ويضم حصناً قديماً لحماية الرهبان ومكتبة مخطوطات نادرة تعود لقرون طويلة.',
    hotspots: [
      {
        id: 'h-15',
        yaw: 60,
        pitch: 0,
        title: 'مذبح كنيسة العذراء القديمة',
        description: 'المكان الذي وضع فيه السيد المسيح رأسه المبارك وفق التقليد الكنسي المتوارث، وله حجر أصلي مقدس.',
        tag: 'تراث مسيحي'
      },
      {
        id: 'h-16',
        yaw: 240,
        pitch: 20,
        title: 'حصن الدير المحرق الدفاعي',
        description: 'برج مربع شُيد في القرن السادس الميلادي ليلجأ إليه الرهبان أثناء الغزوات، ومزود بجسر خشبي متحرك وبئر ماء داخلي.',
        tag: 'عمارة دفاعية'
      }
    ],
    coordinates: { lat: 27.4328, lng: 30.7719 }
  },
  {
    id: 'tour-8',
    title: 'تل العمارنة وعاصمة إخناتون الملكية',
    slug: 'tell-el-amarna',
    governorate: 'المنيا',
    location: 'دير مواس، شرق النيل، المنيا',
    historicalPeriod: 'الدولة الحديثة (عصر العمارنة والتوحيد)',
    panoramaImage: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=2600&q=85',
    thumbnailImage: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?auto=format&fit=crop&w=600&q=80',
    shortDescription: 'أخت آتون (أفق قرص الشمس)، المدينة التي أسسها إخناتون ونفرتيتي وشهدت ولادة أول ديانة توحيدية وفن واقعي حر.',
    detailedInsight: 'تحيط بالمدينة جبال صخرية شاهقة شكلت لوحات حدودية نُقشت عليها نصوص الملك إخناتون، وتميزت مقابرها بنقوش واقعية تفيض بالحياة والعاطفة الإنسانية.',
    hotspots: [
      {
        id: 'h-17',
        yaw: 75,
        pitch: 15,
        title: 'قصر الملكة نفرتيتي ومعبد آتون الكبير',
        description: 'بقايا الصرح الذي بُني بلا سقف لكي تفيض أشعة قرص الشمس الحية على المصلين بحرية ونور.',
        tag: 'عصر التوحيد'
      },
      {
        id: 'h-18',
        yaw: 220,
        pitch: -5,
        title: 'ورشة النحات تحتمس وتمثال نفرتيتي',
        description: 'المكان التاريخي الذي عُثر فيه على رأس الملكة نفرتيتي الشهير المعروض حالياً في برلين، وأدوات النحت القديمة.',
        tag: 'فنون عالمية'
      }
    ],
    coordinates: { lat: 27.6469, lng: 30.9022 }
  }
];

export const PanoramicToursPage: React.FC = () => {
  const { setActivePage } = useApp();
  const [selectedTourIndex, setSelectedTourIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<TourHotspot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isSoundMuted, setIsSoundMuted] = useState(true);
  const [fov, setFov] = useState(75); // Field of View (zoom)

  const currentTour = PANORAMIC_TOURS[selectedTourIndex] || PANORAMIC_TOURS[0];

  // Panorama Viewer Canvas & Interaction State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ osc1?: OscillatorNode; gainNode?: GainNode; filter?: BiquadFilterNode } | null>(null);

  // Rotation angles
  const yawRef = useRef<number>(0);
  const pitchRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });

  // Load panorama image onto canvas
  useEffect(() => {
    let isCancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentTour.panoramaImage;
    img.onload = () => {
      if (!isCancelled) {
        imageObjRef.current = img;
        drawPanorama();
      }
    };
    return () => {
      isCancelled = true;
    };
  }, [currentTour.panoramaImage]);

  // Web Audio Synthesizer for Nile / Temple Ambience
  useEffect(() => {
    if (!isSoundMuted) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // White noise generator filtered for gentle river breeze & water
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start(0);

        audioNodesRef.current = { gainNode, filter };
      } catch (err) {
        console.warn('Web Audio ambience failed:', err);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [isSoundMuted]);

  // Main Render Loop (Equirectangular / Cylindrical perspective projection)
  const drawPanorama = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageObjRef.current;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (img && img.complete) {
      // Calculate horizontal slice offset from yaw (0 to 360 degrees)
      const yawNorm = ((yawRef.current % 360) + 360) % 360;
      const xPercent = yawNorm / 360;
      const imgX = xPercent * img.width;

      // Vertical pitch offset (-45 to +45 clamped)
      const pitchClamped = Math.max(-45, Math.min(45, pitchRef.current));
      const pitchY = (pitchClamped / 90) * (height * 0.4);

      // Zoom scale based on FOV (smaller FOV = larger zoom)
      const zoom = 75 / fov;
      const drawWidth = width * zoom * 1.5;
      const drawHeight = height * zoom * 1.3;
      const drawY = (height - drawHeight) / 2 + pitchY;

      // Draw two seamless wrapping slices
      const destX1 = -((imgX / img.width) * drawWidth) % drawWidth;
      const destX2 = destX1 + drawWidth;

      ctx.drawImage(img, destX1, drawY, drawWidth, drawHeight);
      ctx.drawImage(img, destX2, drawY, drawWidth, drawHeight);
      if (destX1 > 0) {
        ctx.drawImage(img, destX1 - drawWidth, drawY, drawWidth, drawHeight);
      }
    } else {
      // Subtle atmospheric placeholder gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#1E1915');
      grad.addColorStop(0.5, '#382D24');
      grad.addColorStop(1, '#1A1410');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#DFB588';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('جاري تحميل المشهد البانورامي عالي الدقة...', width / 2, height / 2);
    }
  }, [fov]);

  // Animation Loop (handles inertia & auto-rotation)
  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      if (!isDraggingRef.current) {
        if (isAutoRotate) {
          yawRef.current += 0.08; // slow smooth auto-orbit
        } else {
          // Apply gentle friction to manual velocity
          yawRef.current += velocityRef.current.vx;
          pitchRef.current += velocityRef.current.vy;
          velocityRef.current.vx *= 0.92;
          velocityRef.current.vy *= 0.92;
        }
      }

      drawPanorama();
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [drawPanorama, isAutoRotate]);

  // Resize canvas with devicePixelRatio
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width * (window.devicePixelRatio || 1);
        canvas.height = rect.height * (window.devicePixelRatio || 1);
        drawPanorama();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawPanorama]);

  // Pointer / Touch Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { vx: 0, vy: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;

    yawRef.current -= dx * 0.25;
    pitchRef.current += dy * 0.2;
    velocityRef.current = { vx: -dx * 0.15, vy: dy * 0.12 };

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setFov((prev) => Math.max(40, Math.min(100, prev + e.deltaY * 0.05)));
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Zoom helpers
  const zoomIn = () => setFov((prev) => Math.max(40, prev - 10));
  const zoomOut = () => setFov((prev) => Math.min(100, prev + 10));

  return (
    <div className="min-h-screen bg-[#110E0C] text-[#EDE6DF] transition-colors pb-24 select-none">
      {/* =========================================================
          TOP BAR & NAVIGATION
          ========================================================= */}
      <div className="bg-[#1A1410] border-b border-[#2C231C] px-4 sm:px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActivePage('places')}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#D1A877] hover:text-[#E9CBA4] transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} className="rotate-180" />
              قائمة المعالم
            </button>

            <span className="h-4 w-px bg-[#352B23]" />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8C5D30]/25 text-[#E2B98A] text-xs font-black">
              <Compass size={14} className="animate-spin-slow" />
              جولات بانورامية 360° تفاعلية
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Ambient Sound Toggle */}
            <button
              type="button"
              onClick={() => setIsSoundMuted((prev) => !prev)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                !isSoundMuted
                  ? 'bg-amber-600/20 border-amber-500/50 text-amber-300'
                  : 'bg-[#221B15] border-[#362B21] text-[#9E8E7E] hover:text-[#EDE6DF]'
              }`}
              title={isSoundMuted ? 'تشغيل أصوات الأجواء النيلية والتراثية' : 'كتم الصوت'}
            >
              {!isSoundMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="hidden sm:inline">أجواء النيل</span>
            </button>

            {/* Auto-rotate Toggle */}
            <button
              type="button"
              onClick={() => setIsAutoRotate((prev) => !prev)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isAutoRotate
                  ? 'bg-amber-600/20 border-amber-500/50 text-amber-300'
                  : 'bg-[#221B15] border-[#362B21] text-[#9E8E7E] hover:text-[#EDE6DF]'
              }`}
              title={isAutoRotate ? 'إيقاف التدوير التلقائي' : 'تشغيل التدوير التلقائي'}
            >
              {isAutoRotate ? <Pause size={16} /> : <Play size={16} />}
              <span className="hidden sm:inline">دوران تلقائي</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          PANORAMIC VIEWER STAGE (360 Canvas)
          ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div
          ref={containerRef}
          className={`relative w-full rounded-3xl overflow-hidden bg-black border border-[#2E241E] shadow-2xl transition-all ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : 'h-[60vh] sm:h-[68vh] min-h-[420px]'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
        >
          {/* Main 360 Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing block"
          />

          {/* Nubian Pattern Watermark Subtle Overlay */}
          <div className="absolute top-4 right-4 pointer-events-none opacity-40">
            <NubianGeometricPattern opacity={0.15} />
          </div>

          {/* Floating Landmark Info Card (Top-Right) */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-[#16110E]/90 backdrop-blur-md border border-[#3A2E24] p-4 rounded-2xl max-w-sm pointer-events-none shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-[#DFB588]" />
              <span className="text-[11px] font-bold text-[#D5A976]">
                {currentTour.governorate} — {currentTour.location}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white font-serif leading-tight">
              {currentTour.title}
            </h2>
            <p className="text-[11px] text-[#A69585] mt-1 line-clamp-2">
              {currentTour.shortDescription}
            </p>
          </div>

          {/* Hotspot Floating Marker Buttons */}
          <div className="absolute inset-0 pointer-events-none">
            {currentTour.hotspots.map((hs, index) => {
              // Calculate screen position based on yaw relative to viewer
              const relativeYaw = ((hs.yaw - yawRef.current) % 360 + 360) % 360;
              // Visible if within FOV arc
              const isVisible = relativeYaw < 55 || relativeYaw > 305;
              const screenXPercent =
                relativeYaw < 55
                  ? 50 + (relativeYaw / 55) * 45
                  : 50 - ((360 - relativeYaw) / 55) * 45;

              const screenYPercent = 50 - (hs.pitch / 50) * 35;

              if (!isVisible) return null;

              return (
                <div
                  key={hs.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-transform hover:scale-110"
                  style={{
                    left: `${screenXPercent}%`,
                    top: `${screenYPercent}%`
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHotspot(hs);
                    }}
                    className="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/90 text-black shadow-lg cursor-pointer border-2 border-white/80 animate-pulse hover:animate-none"
                    title={hs.title}
                  >
                    <Info size={15} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                  </button>

                  <div className="mt-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-amber-500/30 text-[10px] font-black text-amber-200 whitespace-nowrap shadow-md">
                    {hs.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Viewer Controls (Zoom, Fullscreen, Drag Guide) */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-2 bg-[#17120E]/85 backdrop-blur-md border border-[#382B21] p-1.5 rounded-2xl shadow-xl z-20">
            <button
              type="button"
              onClick={zoomIn}
              className="p-2 rounded-xl text-[#DFB588] hover:bg-white/10 transition-colors cursor-pointer"
              title="تكبير المشهد"
            >
              <ZoomIn size={17} />
            </button>
            <button
              type="button"
              onClick={zoomOut}
              className="p-2 rounded-xl text-[#DFB588] hover:bg-white/10 transition-colors cursor-pointer"
              title="تصغير المشهد"
            >
              <ZoomOut size={17} />
            </button>
            <span className="h-4 w-px bg-[#362B21]" />
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-[#DFB588] hover:bg-white/10 transition-colors cursor-pointer"
              title={isFullscreen ? 'إنهاء الشاشة الكاملة' : 'ملء الشاشة'}
            >
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
          </div>

          {/* Visual Compass & Drag Hint */}
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-sm border border-white/10 text-[11px] text-[#A69585] pointer-events-none">
            <Compass size={14} className="text-[#DFB588]" />
            <span>اسحب بالماوس أو اللمس للالتفاف 360°</span>
          </div>
        </div>

        {/* =========================================================
            HOTSPOT MODAL / DETAIL DRAWER
            ========================================================= */}
        {activeHotspot && (
          <div className="mt-4 p-5 rounded-3xl bg-[#1E1713] border border-[#3C2E23] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-fadeIn">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black">
                  {activeHotspot.tag}
                </span>
                <h4 className="text-base font-black text-white font-serif">
                  {activeHotspot.title}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-[#C4B4A4] leading-relaxed max-w-3xl">
                {activeHotspot.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveHotspot(null)}
              className="px-4 py-2 rounded-xl bg-[#2A2019] text-xs font-bold text-[#E2D2C3] hover:bg-[#382B21] transition-colors cursor-pointer shrink-0"
            >
              إغلاق الإيضاح
            </button>
          </div>
        )}

        {/* =========================================================
            LANDMARK THUMBNAILS CAROUSEL / SELECTOR
            ========================================================= */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-[#DFB588]" />
              <h3 className="text-base font-black text-[#EDE6DF] font-serif">
                جولات المعالم البانورامية المتوفرة ({PANORAMIC_TOURS.length})
              </h3>
            </div>
            <span className="text-xs text-[#9E8E7E]">
              اختر مَعلماً لتبدأ جولته فوراً
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {PANORAMIC_TOURS.map((tour, idx) => {
              const isSelected = idx === selectedTourIndex;
              return (
                <button
                  key={tour.id}
                  type="button"
                  onClick={() => {
                    setSelectedTourIndex(idx);
                    setActiveHotspot(null);
                    yawRef.current = 0;
                    pitchRef.current = 0;
                  }}
                  className={`group relative rounded-2xl overflow-hidden border text-right transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/40 shadow-lg scale-[1.02]'
                      : 'border-[#2D231C] opacity-75 hover:opacity-100 hover:border-[#423328]'
                  }`}
                >
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-[#221B16]">
                    <img
                      src={tour.thumbnailImage}
                      alt={tour.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-bold text-amber-200">
                      {tour.governorate}
                    </span>
                  </div>

                  <div className="p-2 bg-[#17120E]">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {tour.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================
            DEEP HISTORICAL INSIGHT & CULTURAL STORY
            ========================================================= */}
        <div className="mt-10 rounded-3xl border border-[#2B211A] bg-[#17120E] p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#292018]">
            <div>
              <span className="text-xs font-bold text-amber-400 block mb-1">
                عن هذا المعلم الصعيدي
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-serif">
                {currentTour.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setActivePage('places')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8C5D30] hover:bg-[#A36D39] text-white text-xs font-black transition-all shadow-md cursor-pointer"
            >
              <span>استكشف كافة معالم صعيد مصر</span>
              <ExternalLink size={14} />
            </button>
          </div>

          <p className="text-sm text-[#C9B9A9] leading-relaxed">
            {currentTour.detailedInsight}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#1F1813] border border-[#30251D]">
              <span className="text-[11px] text-[#8F7F70] block">المحافظة والموقع:</span>
              <span className="text-xs font-bold text-white">{currentTour.governorate} — {currentTour.location}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#1F1813] border border-[#30251D]">
              <span className="text-[11px] text-[#8F7F70] block">العصر التاريخي:</span>
              <span className="text-xs font-bold text-white">{currentTour.historicalPeriod}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#1F1813] border border-[#30251D]">
              <span className="text-[11px] text-[#8F7F70] block">نقاط الشرح التفاعلية:</span>
              <span className="text-xs font-bold text-amber-300">{currentTour.hotspots.length} نقاط استكشاف بالبانوراما</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
