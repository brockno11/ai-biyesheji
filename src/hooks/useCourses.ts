import { useMemo, useState, useEffect } from 'react';
import { algorithms as staticAlgorithms } from '../data/algorithms';
import { storageService } from '../services/storageService';
import type { Algorithm } from '../types';

export function useCourses(): Algorithm[] {
  // Version counter forces re-read of localStorage when custom courses change
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'ml-platform-custom-courses') setVersion((v) => v + 1);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Expose refresh for in-tab updates (called after admin saves)
  (window as unknown as Record<string, unknown>).__refreshCourses = () => setVersion((v) => v + 1);

  return useMemo(() => {
    const custom = storageService.getCustomCourses();
    return [...staticAlgorithms, ...custom];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);
}

export function useCourseById(id: string): Algorithm | undefined {
  return useMemo(() => {
    const all = [...staticAlgorithms, ...storageService.getCustomCourses()];
    return all.find((a) => a.id === id);
  }, [id]);
}
