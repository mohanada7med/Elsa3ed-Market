import { CraftReel, CraftReelComment } from '../types.ts';
import { api } from './api.ts';

const REELS_STORAGE_KEY = 'saeed_craft_reels_data';
const REEL_LIKES_KEY = 'saeed_user_liked_reels';

export const INITIAL_CRAFT_REELS: CraftReel[] = [];

export const HERITAGE_VIDEO_PRESETS: Array<{
  id: string;
  title: string;
  craftType: string;
  governorate: string;
  videoUrl: string;
  posterUrl: string;
  duration: string;
  musicTrack: string;
}> = [];

export const craftReelsService = {
  // Synchronous cached getter
  getReels(): CraftReel[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(REELS_STORAGE_KEY);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  // Direct database query with cache refresh
  async fetchReelsFromDb(filters?: {
    sellerId?: string;
    governorate?: string;
    craftType?: string;
    search?: string;
    featuredOnly?: boolean;
  }): Promise<CraftReel[]> {
    try {
      const reels = await api.getReels(filters);
      if (reels) {
        if (!filters || (!filters.sellerId && !filters.governorate && !filters.craftType && !filters.search)) {
          this.saveReels(reels);
        }
        return reels;
      }
    } catch (err) {
      console.warn('[CraftReels] Failed to fetch from DB, using cached reels:', err);
    }
    return this.getReels();
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

  async addReelAsync(
    user: { id?: string; role?: string; sellerId?: string; name?: string },
    newReelData: Omit<CraftReel, 'id' | 'likesCount' | 'viewsCount' | 'sharesCount' | 'comments' | 'createdAt'>
  ): Promise<CraftReel> {
    try {
      const created = await api.createReel(user, newReelData);
      const current = this.getReels();
      this.saveReels([created, ...current.filter((r) => r.id !== created.id)]);
      return created;
    } catch (err: any) {
      console.warn('[CraftReels] API creation failed, falling back to local store:', err);
      return this.addReel(newReelData);
    }
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

  async updateReelAsync(
    user: { id?: string; role?: string; sellerId?: string },
    reelId: string,
    updates: Partial<CraftReel>
  ): Promise<CraftReel | null> {
    try {
      const updated = await api.updateReel(user, reelId, updates);
      const current = this.getReels();
      const newReels = current.map((r) => (r.id === reelId ? updated : r));
      this.saveReels(newReels);
      return updated;
    } catch (err: any) {
      console.warn('[CraftReels] API update failed, falling back to local store:', err);
      return this.updateReel(reelId, updates);
    }
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

  async deleteReelAsync(
    user: { id?: string; role?: string; sellerId?: string },
    reelId: string
  ): Promise<boolean> {
    try {
      await api.deleteReel(user, reelId);
    } catch (err) {
      console.warn('[CraftReels] API delete failed, applying local delete:', err);
    }
    return this.deleteReel(reelId);
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

  async bulkDeleteReelsAsync(
    user: { id?: string; role?: string; sellerId?: string },
    reelIds: string[]
  ): Promise<boolean> {
    try {
      await api.bulkDeleteReels(user, reelIds);
    } catch (err) {
      console.warn('[CraftReels] API bulk delete failed, applying local delete:', err);
    }
    return this.bulkDeleteReels(reelIds);
  },

  bulkDeleteReels(reelIds: string[]): boolean {
    const reels = this.getReels();
    const filtered = reels.filter((r) => !reelIds.includes(r.id));
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

    // Call API in background
    api.likeReel(reelId, !isCurrentlyLiked).catch(() => {});

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

    // Call API in background
    api.incrementReelView(reelId).catch(() => {});
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

    // Call API in background
    api.incrementReelShare(reelId).catch(() => {});
  },

  addComment(
    reelId: string,
    params: { userName: string; comment: string; userAvatar?: string; governorate?: string }
  ): CraftReelComment {
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

    // Call API in background
    api.addReelComment(reelId, params).catch(() => {});

    return newComment;
  }
};
