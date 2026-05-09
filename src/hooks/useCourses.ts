import { useMemo } from 'react';
import { algorithms as staticAlgorithms } from '../data/algorithms';
import { storageService } from '../services/storageService';
import type { Algorithm } from '../types';

export function useCourses(): Algorithm[] {
  return useMemo(() => {
    const custom = storageService.getCustomCourses();
    return [...staticAlgorithms, ...custom];
  }, []);
}

export function useCourseById(id: string): Algorithm | undefined {
  return useMemo(() => {
    const all = [...staticAlgorithms, ...storageService.getCustomCourses()];
    return all.find((a) => a.id === id);
  }, [id]);
}
