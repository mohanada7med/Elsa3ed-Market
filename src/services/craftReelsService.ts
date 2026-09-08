import {
  CraftReel,
  CraftReelComment,
} from '../types.ts';

import { api } from './api.ts';

const REELS_STORAGE_KEY =
  'saeed_craft_reels_data';

const REEL_LIKES_KEY =
  'saeed_user_liked_reels';

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
  emoji?: string;
}> = [];

export const craftReelsService = {
  /*
   * ============================================================
   * LOCAL CACHE
   * ============================================================
   */

  getReels(): CraftReel[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const stored =
        localStorage.getItem(
          REELS_STORAGE_KEY
        );

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch (error) {
      console.warn(
        '[CraftReels] Failed to read cache:',
        error
      );

      return [];
    }
  },

  saveReels(
    reels: CraftReel[]
  ): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(
        REELS_STORAGE_KEY,
        JSON.stringify(reels)
      );
    } catch (error) {
      console.warn(
        '[CraftReels] Failed to save cache:',
        error
      );
    }
  },

  /*
   * ============================================================
   * FETCH REELS
   * ============================================================
   */

  async fetchReelsFromDb(
    filters?: {
      sellerId?: string;
      governorate?: string;
      craftType?: string;
      contentType?: string;
      search?: string;
      featuredOnly?: boolean;
    }
  ): Promise<CraftReel[]> {
    try {
      const reels =
        await api.getReels(filters);

      if (Array.isArray(reels)) {
        /*
         * Update cache only for the main unfiltered
         * feed.
         */
        const hasFilters =
          !!filters &&
          (
            !!filters.sellerId ||
            !!filters.governorate ||
            !!filters.craftType ||
            !!filters.contentType ||
            !!filters.search ||
            !!filters.featuredOnly
          );

        if (!hasFilters) {
          this.saveReels(reels);
        }

        return reels;
      }
    } catch (error) {
      console.warn(
        '[CraftReels] Failed to fetch reels from DB:',
        error
      );
    }

    return this.getReels();
  },

  /*
   * ============================================================
   * FETCH REAL COMMENTS
   * ============================================================
   *
   * Uses the reels API and extracts the comments
   * belonging to the requested Reel.
   *
   * If your API already has a dedicated comments endpoint,
   * this can later be replaced with that endpoint.
   */

  async fetchReelComments(
    reelId: string
  ): Promise<CraftReelComment[]> {
    try {
      const reels =
        await api.getReels();

      if (!Array.isArray(reels)) {
        throw new Error(
          'Invalid reels response'
        );
      }

      const reel = reels.find(
        (item) => item.id === reelId
      );

      if (!reel) {
        return [];
      }

      const comments =
        Array.isArray(reel.comments)
          ? reel.comments
          : [];

      /*
       * Update the local cache with the fresh
       * server version of this Reel.
       */
      const cached =
        this.getReels();

      const updatedCache =
        cached.map((item) =>
          item.id === reelId
            ? {
              ...item,
              comments,
            }
            : item
        );

      this.saveReels(updatedCache);

      return comments;
    } catch (error) {
      console.error(
        '[CraftReels] Failed to fetch reel comments:',
        error
      );

      /*
       * Fallback only for displaying already cached
       * comments. We NEVER create comments locally.
       */
      const cached =
        this.getReels();

      const reel =
        cached.find(
          (item) => item.id === reelId
        );

      return reel?.comments || [];
    }
  },

  /*
   * ============================================================
   * SELLER REELS
   * ============================================================
   */

  getReelsBySeller(
    sellerId: string
  ): CraftReel[] {
    return this.getReels().filter(
      (reel) =>
        reel.sellerId === sellerId
    );
  },

  /*
   * ============================================================
   * CREATE REEL
   * ============================================================
   */

  async addReelAsync(
    user: {
      id?: string;
      role?: string;
      sellerId?: string;
      name?: string;
    },
    newReelData: Omit<
      CraftReel,
      | 'id'
      | 'likesCount'
      | 'viewsCount'
      | 'sharesCount'
      | 'comments'
      | 'createdAt'
    >
  ): Promise<CraftReel> {
    try {
      const created =
        await api.createReel(
          user,
          newReelData
        );

      const current =
        this.getReels();

      this.saveReels([
        created,
        ...current.filter(
          (reel) =>
            reel.id !== created.id
        ),
      ]);

      return created;
    } catch (error) {
      console.warn(
        '[CraftReels] API creation failed, falling back to local store:',
        error
      );

      return this.addReel(
        newReelData
      );
    }
  },

  addReel(
    newReelData: Omit<
      CraftReel,
      | 'id'
      | 'likesCount'
      | 'viewsCount'
      | 'sharesCount'
      | 'comments'
      | 'createdAt'
    >
  ): CraftReel {
    const reels =
      this.getReels();

    const newReel: CraftReel = {
      ...newReelData,

      id:
        `reel-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,

      likesCount: 0,
      viewsCount: 1,
      sharesCount: 0,
      comments: [],

      createdAt:
        new Date()
          .toISOString()
          .split('T')[0],
    };

    this.saveReels([
      newReel,
      ...reels,
    ]);

    return newReel;
  },

  /*
   * ============================================================
   * UPDATE REEL
   * ============================================================
   */

  async updateReelAsync(
    user: {
      id?: string;
      role?: string;
      sellerId?: string;
    },
    reelId: string,
    updates: Partial<CraftReel>
  ): Promise<CraftReel | null> {
    try {
      const updated =
        await api.updateReel(
          user,
          reelId,
          updates
        );

      const current =
        this.getReels();

      const newReels =
        current.map(
          (reel) =>
            reel.id === reelId
              ? updated
              : reel
        );

      this.saveReels(
        newReels
      );

      return updated;
    } catch (error) {
      console.warn(
        '[CraftReels] API update failed:',
        error
      );

      return this.updateReel(
        reelId,
        updates
      );
    }
  },

  updateReel(
    reelId: string,
    updates: Partial<CraftReel>
  ): CraftReel | null {
    const reels =
      this.getReels();

    let updatedItem:
      | CraftReel
      | null = null;

    const updated =
      reels.map((reel) => {
        if (reel.id !== reelId) {
          return reel;
        }

        updatedItem = {
          ...reel,
          ...updates,
        };

        return updatedItem;
      });

    if (updatedItem) {
      this.saveReels(
        updated
      );
    }

    return updatedItem;
  },

  /*
   * ============================================================
   * DELETE REEL
   * ============================================================
   */

  async deleteReelAsync(
    user: {
      id?: string;
      role?: string;
      sellerId?: string;
    },
    reelId: string
  ): Promise<boolean> {
    try {
      await api.deleteReel(
        user,
        reelId
      );
    } catch (error) {
      console.warn(
        '[CraftReels] API delete failed:',
        error
      );
    }

    return this.deleteReel(
      reelId
    );
  },

  deleteReel(
    reelId: string
  ): boolean {
    const reels =
      this.getReels();

    const filtered =
      reels.filter(
        (reel) =>
          reel.id !== reelId
      );

    if (
      filtered.length !==
      reels.length
    ) {
      this.saveReels(
        filtered
      );

      return true;
    }

    return false;
  },

  /*
   * ============================================================
   * BULK DELETE
   * ============================================================
   */

  async bulkDeleteReelsAsync(
    user: {
      id?: string;
      role?: string;
      sellerId?: string;
    },
    reelIds: string[]
  ): Promise<boolean> {
    try {
      await api.bulkDeleteReels(
        user,
        reelIds
      );
    } catch (error) {
      console.warn(
        '[CraftReels] API bulk delete failed:',
        error
      );
    }

    return this.bulkDeleteReels(
      reelIds
    );
  },

  bulkDeleteReels(
    reelIds: string[]
  ): boolean {
    const reels =
      this.getReels();

    const filtered =
      reels.filter(
        (reel) =>
          !reelIds.includes(
            reel.id
          )
      );

    if (
      filtered.length !==
      reels.length
    ) {
      this.saveReels(
        filtered
      );

      return true;
    }

    return false;
  },

  /*
   * ============================================================
   * LIKES
   * ============================================================
   */

  getUserLikedReels(): string[] {
    if (
      typeof window === 'undefined'
    ) {
      return [];
    }

    try {
      const stored =
        localStorage.getItem(
          REEL_LIKES_KEY
        );

      return stored
        ? JSON.parse(stored)
        : [];
    } catch {
      return [];
    }
  },

  toggleLikeReel(
    reelId: string
  ): {
    isLiked: boolean;
    newLikesCount: number;
  } {
    const reels =
      this.getReels();

    const likedReelIds =
      this.getUserLikedReels();

    const isCurrentlyLiked =
      likedReelIds.includes(
        reelId
      );

    let updatedLikedIds:
      string[];

    let newLikesCount = 0;

    if (
      isCurrentlyLiked
    ) {
      updatedLikedIds =
        likedReelIds.filter(
          (id) =>
            id !== reelId
        );
    } else {
      updatedLikedIds = [
        ...likedReelIds,
        reelId,
      ];
    }

    try {
      localStorage.setItem(
        REEL_LIKES_KEY,
        JSON.stringify(
          updatedLikedIds
        )
      );
    } catch { }

    const updatedReels =
      reels.map((reel) => {
        if (
          reel.id !== reelId
        ) {
          return reel;
        }

        const count =
          isCurrentlyLiked
            ? Math.max(
              0,
              reel.likesCount - 1
            )
            : reel.likesCount + 1;

        newLikesCount =
          count;

        return {
          ...reel,
          likesCount:
            count,
        };
      });

    this.saveReels(
      updatedReels
    );

    api.likeReel(
      reelId,
      !isCurrentlyLiked
    ).catch((error) => {
      console.warn(
        '[CraftReels] Like API failed:',
        error
      );
    });

    return {
      isLiked:
        !isCurrentlyLiked,
      newLikesCount,
    };
  },

  /*
   * ============================================================
   * VIEWS
   * ============================================================
   */

  incrementViews(
    reelId: string
  ): void {
    const reels =
      this.getReels();

    const updatedReels =
      reels.map((reel) => {
        if (
          reel.id !== reelId
        ) {
          return reel;
        }

        return {
          ...reel,
          viewsCount:
            reel.viewsCount + 1,
        };
      });

    this.saveReels(
      updatedReels
    );

    api.incrementReelView(
      reelId
    ).catch((error) => {
      console.warn(
        '[CraftReels] View API failed:',
        error
      );
    });
  },

  /*
   * ============================================================
   * SHARES
   * ============================================================
   */

  incrementShares(
    reelId: string
  ): void {
    const reels =
      this.getReels();

    const updatedReels =
      reels.map((reel) => {
        if (
          reel.id !== reelId
        ) {
          return reel;
        }

        return {
          ...reel,
          sharesCount:
            reel.sharesCount + 1,
        };
      });

    this.saveReels(
      updatedReels
    );

    api.incrementReelShare(
      reelId
    ).catch((error) => {
      console.warn(
        '[CraftReels] Share API failed:',
        error
      );
    });
  },

  /*
   * ============================================================
   * REAL COMMENTS
   * ============================================================
   */

  async addComment(
    reelId: string,
    params: {
      userName: string;
      comment: string;
      userAvatar?: string;
      governorate?: string;
    }
  ): Promise<CraftReelComment> {
    const text =
      params.comment?.trim();

    if (!text) {
      throw new Error(
        'COMMENT_EMPTY'
      );
    }

    if (!reelId) {
      throw new Error(
        'REEL_ID_REQUIRED'
      );
    }

    try {
      /*
       * IMPORTANT:
       *
       * The API is now the source of truth.
       *
       * Nothing is written to localStorage
       * before this request succeeds.
       */
      const created =
        await api.addReelComment(
          reelId,
          {
            ...params,
            comment: text,
          }
        );

      if (!created) {
        throw new Error(
          'COMMENT_CREATE_FAILED'
        );
      }

      /*
       * Update local cache ONLY after
       * successful DB insertion.
       */
      const reels =
        this.getReels();

      const updatedReels =
        reels.map((reel) => {
          if (
            reel.id !== reelId
          ) {
            return reel;
          }

          return {
            ...reel,
            comments: [
              created,
              ...(reel.comments || []).filter(
                (comment) =>
                  comment.id !==
                  created.id
              ),
            ],
          };
        });

      this.saveReels(
        updatedReels
      );

      return created;
    } catch (error) {
      console.error(
        '[CraftReels] Failed to create real comment:',
        error
      );

      /*
       * VERY IMPORTANT:
       *
       * We don't create a fake local comment here.
       */
      throw error;
    }
  },
};