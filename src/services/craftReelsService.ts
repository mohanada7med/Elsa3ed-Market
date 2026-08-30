import { CraftReel, CraftReelComment } from '../types.ts';

const REELS_STORAGE_KEY = 'saeed_craft_reels_data';
const REEL_LIKES_KEY = 'saeed_user_liked_reels';

export const INITIAL_CRAFT_REELS: CraftReel[] = [
  {
    id: 'reel-qena-pottery',
    title: 'سحر تشكيل القلة القناوية على الدولاب التراثي',
    artisanName: 'الأسطى حسني القناوي',
    artisanAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    workshopName: 'ورشة فخار القناوي الأصيل',
    sellerId: 'seller-qena-pottery',
    governorate: 'قنا',
    craftType: 'فخار وخزف طمي النيل',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-potter-shaping-a-clay-vase-41717-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    duration: '0:24',
    likesCount: 384,
    viewsCount: 4120,
    sharesCount: 92,
    productId: 'prod-qena-pot-1',
    productTitle: 'قلة قناوية فخار مسامي أصيل لتبريد المياه',
    productPrice: 140,
    productOriginalPrice: 180,
    productImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
    productRating: 4.9,
    inStock: true,
    description: 'سر القلة القناوية في مسامية طمي النيل الطبيعي وسرعة حركة الدولاب اليدوي.. كل حركة يد تحدد برودة ونقاء المياه وعذوبتها الطبيعية! 🏺🌿',
    hashtags: ['#فخار_قنا', '#طمي_النيل', '#صنع_في_مصر', '#تراث_الصعيد', '#قلة_قناوية'],
    musicTrack: 'نغم الربابة الصعيدي التراثي • مقام حجاز',
    isVerifiedArtisan: true,
    createdAt: '2026-08-20',
    comments: [
      {
        id: 'c1',
        userName: 'م. أحمد الشاذلي',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        governorate: 'القاهرة',
        comment: 'ما شاء الله تسلم إيد الأسطى حسني، اشتريت القلة المرة اللي فاتت والمياه طالعة منها ساقعة كأنها في تلاجة وطعمها يجنن!',
        createdAt: 'منذ يومين',
        likesCount: 24
      },
      {
        id: 'c2',
        userName: 'سارة عبد الرحمن',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        governorate: 'الإسكندرية',
        comment: 'فيديو ممتع جداً بيوضح عظمة الصنعة اليدوية.. طلبت اتنين هدايا لوالدتي.',
        createdAt: 'منذ 3 أيام',
        likesCount: 16
      }
    ]
  },
  {
    id: 'reel-akhmeem-loom',
    title: 'غزل خيوط الصوف على نول أخميم اليدوي العريق',
    artisanName: 'الحاجة فاطمة السوهاجية',
    artisanAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    workshopName: 'أنوال الحرير والكليم السوهاجي',
    sellerId: 'seller-akhmeem-loom',
    governorate: 'سوهاج',
    craftType: 'كليم وسجاد نول يدوي',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-weaving-fabric-on-a-loom-41724-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    duration: '0:28',
    likesCount: 520,
    viewsCount: 5890,
    sharesCount: 145,
    productId: 'prod-akhmeem-kilim-1',
    productTitle: 'سجادة كليم أخميمي صوف طبيعي 100% بنقوش هندسية',
    productPrice: 850,
    productOriginalPrice: 1100,
    productImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    productRating: 5.0,
    inStock: true,
    description: 'كل خيط على نول أخميم بيتشد بحب وصبر، بأصباغ نباتية طبيعية وألوان تدوم لعشرات السنين بدون بهتان! 🧶🧵',
    hashtags: ['#كليم_أخميم', '#نول_يدوي', '#صوف_طبيعي', '#سوهاج', '#ديكور_صعيدي'],
    musicTrack: 'إيقاع الدف والنول الصعيدي الأصيل',
    isVerifiedArtisan: true,
    createdAt: '2026-08-22',
    comments: [
      {
        id: 'c3',
        userName: 'د. منى كمال',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        governorate: 'الجيزة',
        comment: 'أخميم عاصمة النسيج في التاريخ، وفخورة جداً بوجود منصة بتعرض شغل الحاجة فاطمة بالشكل المشرّف ده!',
        createdAt: 'منذ يوم',
        likesCount: 31
      }
    ]
  },
  {
    id: 'reel-luxor-brass',
    title: 'دق ونقش الصواني النحاسية الأقصرية بالمطرقة والأزميل',
    artisanName: 'المعلم ربيع الأقصري',
    artisanAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    workshopName: 'خان المشغولات النحاسية التراثية',
    sellerId: 'seller-luxor-brass',
    governorate: 'الأقصر',
    craftType: 'نقش وزخرفة النحاس',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-goldsmith-engraving-a-pattern-on-metal-41738-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=800&q=80',
    duration: '0:22',
    likesCount: 467,
    viewsCount: 3910,
    sharesCount: 88,
    productId: 'prod-luxor-brass-tray',
    productTitle: 'صينية نحاس أحمر ثقيل منقوشة يدوياً بزخارف فرعونية وإسلامية',
    productPrice: 1250,
    productOriginalPrice: 1500,
    productImage: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=600&q=80',
    productRating: 4.8,
    inStock: true,
    description: 'دق النحاس بيحتاج أذن موسيقية وإيد ثابتة.. شوفوا صوت الأزميل وهو بيحفر أوراق اللوتس والنقوش التراثية ببراعة! ✨🔨',
    hashtags: ['#نحاس_الأقصر', '#نقش_نحاس', '#الأقصر', '#تحف_تراثية', '#صنع_بفخر_في_مصر'],
    musicTrack: 'تقاسيم عود صعيدية تراثية • مقام راست',
    isVerifiedArtisan: true,
    createdAt: '2026-08-25',
    comments: [
      {
        id: 'c4',
        userName: 'طارق الألفي',
        userAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
        governorate: 'بورسعيد',
        comment: 'صوت النحاس وطريقة الدق تفرح القلب.. قطعة فنية تليق بصالون أي بيت مصري أصيل.',
        createdAt: 'منذ 5 ساعات',
        likesCount: 19
      }
    ]
  },
  {
    id: 'reel-aswan-palmbasket',
    title: 'تجديل خوص النخيل النوبي وألوانه المبهجة',
    artisanName: 'مريم النوبية',
    artisanAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
    workshopName: 'بيت الخوص والمشغولات النوبية',
    sellerId: 'seller-aswan-palmbasket',
    governorate: 'أسوان',
    craftType: 'سعف وخوص النخيل الطبيعي',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-artisan-weaving-a-wicker-basket-41730-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=800&q=80',
    duration: '0:20',
    likesCount: 612,
    viewsCount: 6420,
    sharesCount: 178,
    productId: 'prod-aswan-basket-1',
    productTitle: 'طبق تقديم خوص نوبي ملون بحياكة يدوية محكمة',
    productPrice: 260,
    productOriginalPrice: 320,
    productImage: 'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=600&q=80',
    productRating: 4.9,
    inStock: true,
    description: 'من قرى غرب سهيل وجزر النوبة.. بنجمع سعف النخيل ونصبغه بألوان شمس الصعيد عشان نعمل أطباق وسلات لحفظ التمور والعيش الشمسي! 🌴☀️',
    hashtags: ['#خوص_النوبة', '#أسوان', '#سعف_النخيل', '#غرب_سهيل', '#هاند_ميد_صعيدي'],
    musicTrack: 'إيقاعات الدف والطنبور النوبي الأصيل',
    isVerifiedArtisan: true,
    createdAt: '2026-08-26',
    comments: [
      {
        id: 'c5',
        userName: 'ندى سليم',
        userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        governorate: 'المنصورة',
        comment: 'الألوان والبهجة النوبية ملهاش مثيل، اشتريت طقم كامل لتزيين حائط السفرة!',
        createdAt: 'منذ يومين',
        likesCount: 27
      }
    ]
  },
  {
    id: 'reel-assiut-tally',
    title: 'تطريز التلي الأسيوطي بشرائح الفضة الخالصة',
    artisanName: 'أم محمود الأسيوطية',
    artisanAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
    workshopName: 'تطريز التلي وشيلان جبل أسيوط',
    sellerId: 'seller-assiut-tally',
    governorate: 'أسيوط',
    craftType: 'تلي وتطريز فضة تراثي',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-sewing-a-fabric-with-a-needle-and-thread-41734-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    duration: '0:26',
    likesCount: 395,
    viewsCount: 4230,
    sharesCount: 110,
    productId: 'prod-assiut-tally-shawl',
    productTitle: 'شال تلي أسيوطي فاخر مطرز بشرائح الفضة الصافية يدوياً',
    productPrice: 1800,
    productOriginalPrice: 2200,
    productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    productRating: 5.0,
    inStock: true,
    description: 'حرفة التلي الأسيوطي النادرة.. عقد خيوط الفضة الخالصة على نسيج التل الأسود بحساب هندسي دقيق لكل غرزة.. تراث مصري خالص! 🪡✨',
    hashtags: ['#تلي_أسيوط', '#فضة_خالصة', '#تطريز_يدوي', '#شال_تلي', '#تراث_مصر'],
    musicTrack: 'أنغام الناي الصعيدي الشجي',
    isVerifiedArtisan: true,
    createdAt: '2026-08-27',
    comments: [
      {
        id: 'c6',
        userName: 'يسرا الجوهري',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        governorate: 'القاهرة',
        comment: 'التلي الأسيوطي ده كنز عالمي.. تسلم إيد الحرفيات الماهرات في أسيوط.',
        createdAt: 'منذ يوم',
        likesCount: 38
      }
    ]
  },
  {
    id: 'reel-sarsou-wood',
    title: 'خراطة ونحت أخشاب السرسوع الطبيعية بحجازة',
    artisanName: 'الأسطى رضوان الخراط',
    artisanAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    workshopName: 'مخرطة خشب السرسوع وحجازة',
    sellerId: 'seller-sarsou-wood',
    governorate: 'قنا',
    craftType: 'خراطة ونحت خشب السرسوع',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-carving-a-piece-of-wood-41720-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    duration: '0:25',
    likesCount: 330,
    viewsCount: 3600,
    sharesCount: 74,
    productId: 'prod-sarsou-incense-burner',
    productTitle: 'مبخرة خشب سرسوع حجازة منحوتة يدوياً بدهان زيت الكتان الطبيعي',
    productPrice: 320,
    productOriginalPrice: 400,
    productImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    productRating: 4.8,
    inStock: true,
    description: 'خشب السرسوع الصعيدي بيتميز بصلابته وعروقه البنية الساحرة.. بيتم تشكيله على المخرطة وتنعيمه بزيت بذر الكتان الطبيعي لحماية الخشب من الجفاف! 🪵💨',
    hashtags: ['#خشب_حجازة', '#سرسوع_قنا', '#خراطة_خشب', '#مبخرة_تراثية', '#قنا'],
    musicTrack: 'موال صعيدي تراثي مع المزمار البلدي',
    isVerifiedArtisan: true,
    createdAt: '2026-08-28',
    comments: [
      {
        id: 'c7',
        userName: 'مروان الباجوري',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        governorate: 'الفيوم',
        comment: 'ريحة خشب السرسوع الطبيعي لما تشغل فيه البخور بتعمل جو روحاني عظيم جداً.',
        createdAt: 'منذ يومين',
        likesCount: 14
      }
    ]
  }
];

export const HERITAGE_VIDEO_PRESETS = [
  {
    id: 'preset-pottery',
    title: 'تشكيل الفخار والخزف على الدولاب',
    craftType: 'فخار وخزف نيلي',
    governorate: 'قنا',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-potter-working-on-a-pottery-wheel-41718-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
    duration: '0:30',
    musicTrack: 'أنغام الناي الصعيدي مع الدف'
  },
  {
    id: 'preset-loom',
    title: 'غزل وحياكة الكليم على النول اليدوي',
    craftType: 'كليم وسجاد يدوي',
    governorate: 'سوهاج',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-weaving-threads-on-a-traditional-loom-41719-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
    duration: '0:28',
    musicTrack: 'موال نسيج الصعيد التراثي'
  },
  {
    id: 'preset-brass',
    title: 'طرق ونقش الزخارف الإسلامية على النحاس',
    craftType: 'مشغولات نحاسية',
    governorate: 'الأقصر',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-working-on-a-metal-piece-41721-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    duration: '0:35',
    musicTrack: 'طقطوقة صعيدية أصيلة'
  },
  {
    id: 'preset-wicker',
    title: 'تجديل الخوص وسلال سعف النخيل',
    craftType: 'خوص وسعف نخيل',
    governorate: 'أسوان',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-weaving-a-basket-with-straw-41722-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?auto=format&fit=crop&w=800&q=80',
    duration: '0:22',
    musicTrack: 'إيقاعات الدف والطنبورة النوبية'
  },
  {
    id: 'preset-wood',
    title: 'خراطة ونحت أخشاب السرسوع وحجازة',
    craftType: 'خراطة خشب السرسوع',
    governorate: 'قنا',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-carving-a-piece-of-wood-41720-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    duration: '0:25',
    musicTrack: 'موال صعيدي تراثي مع المزمار البلدي'
  }
];

export const craftReelsService = {
  getReels(): CraftReel[] {
    if (typeof window === 'undefined') return INITIAL_CRAFT_REELS;
    try {
      const stored = localStorage.getItem(REELS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(INITIAL_CRAFT_REELS));
        return INITIAL_CRAFT_REELS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_CRAFT_REELS;
    }
  },

  saveReels(reels: CraftReel[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(reels));
    } catch {}
  },

  getReelsBySeller(sellerId: string): CraftReel[] {
    const reels = this.getReels();
    return reels.filter((r) => r.sellerId === sellerId);
  },

  addReel(newReelData: Omit<CraftReel, 'id' | 'likesCount' | 'viewsCount' | 'sharesCount' | 'comments' | 'createdAt'>): CraftReel {
    const reels = this.getReels();
    const newReel: CraftReel = {
      ...newReelData,
      id: `reel-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      likesCount: 0,
      viewsCount: 1,
      sharesCount: 0,
      comments: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newReel, ...reels];
    this.saveReels(updated);
    return newReel;
  },

  updateReel(reelId: string, updates: Partial<CraftReel>): CraftReel | null {
    const reels = this.getReels();
    let updatedItem: CraftReel | null = null;
    const updated = reels.map((r) => {
      if (r.id === reelId) {
        updatedItem = { ...r, ...updates };
        return updatedItem;
      }
      return r;
    });

    if (updatedItem) {
      this.saveReels(updated);
    }
    return updatedItem;
  },

  deleteReel(reelId: string): boolean {
    const reels = this.getReels();
    const filtered = reels.filter((r) => r.id !== reelId);
    if (filtered.length !== reels.length) {
      this.saveReels(filtered);
      return true;
    }
    return false;
  },

  getUserLikedReels(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(REEL_LIKES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  toggleLikeReel(reelId: string): { isLiked: boolean; newLikesCount: number } {
    const reels = this.getReels();
    const likedReelIds = this.getUserLikedReels();
    const isCurrentlyLiked = likedReelIds.includes(reelId);

    let updatedLikedIds: string[];
    let newLikesCount = 0;

    if (isCurrentlyLiked) {
      updatedLikedIds = likedReelIds.filter((id) => id !== reelId);
    } else {
      updatedLikedIds = [...likedReelIds, reelId];
    }

    try {
      localStorage.setItem(REEL_LIKES_KEY, JSON.stringify(updatedLikedIds));
    } catch {}

    const updatedReels = reels.map((reel) => {
      if (reel.id === reelId) {
        const count = isCurrentlyLiked ? Math.max(0, reel.likesCount - 1) : reel.likesCount + 1;
        newLikesCount = count;
        return { ...reel, likesCount: count };
      }
      return reel;
    });

    this.saveReels(updatedReels);

    return {
      isLiked: !isCurrentlyLiked,
      newLikesCount
    };
  },

  incrementViews(reelId: string): void {
    const reels = this.getReels();
    const updatedReels = reels.map((reel) => {
      if (reel.id === reelId) {
        return { ...reel, viewsCount: reel.viewsCount + 1 };
      }
      return reel;
    });
    this.saveReels(updatedReels);
  },

  incrementShares(reelId: string): void {
    const reels = this.getReels();
    const updatedReels = reels.map((reel) => {
      if (reel.id === reelId) {
        return { ...reel, sharesCount: reel.sharesCount + 1 };
      }
      return reel;
    });
    this.saveReels(updatedReels);
  },

  addComment(reelId: string, params: { userName: string; comment: string; userAvatar?: string; governorate?: string }): CraftReelComment {
    const reels = this.getReels();
    const newComment: CraftReelComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userName: params.userName || 'محب للتراث الصعيدي',
      userAvatar: params.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      governorate: params.governorate || 'مصر',
      comment: params.comment,
      createdAt: 'الآن',
      likesCount: 0
    };

    const updatedReels = reels.map((reel) => {
      if (reel.id === reelId) {
        const existingComments = reel.comments || [];
        return {
          ...reel,
          comments: [newComment, ...existingComments]
        };
      }
      return reel;
    });

    this.saveReels(updatedReels);
    return newComment;
  }
};
