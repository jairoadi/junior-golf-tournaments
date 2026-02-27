'use client';

import { useState, useEffect } from 'react';

export interface BookmarkEntry {
  saved: boolean;
  enrolled: boolean;
}

export type BookmarksMap = Record<string, BookmarkEntry>;

const STORAGE_KEY = 'jg-bookmarks';

/**
 * Manages per-tournament bookmark state in localStorage.
 * Designed for easy swap to a backend API in the future —
 * all storage logic is isolated here; UI components just call update().
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarksMap>({});

  // Hydrate from localStorage on mount (skipped during SSR)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setBookmarks(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
  }, []);

  const update = (id: string, patch: Partial<BookmarkEntry>) => {
    setBookmarks((prev) => {
      const current = prev[id] ?? { saved: false, enrolled: false };
      const updated = { ...current, ...patch };
      const next = { ...prev };

      // Remove entry entirely if both flags are off
      if (!updated.saved && !updated.enrolled) {
        delete next[id];
      } else {
        next[id] = updated;
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  return { bookmarks, update };
}
