'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthInitializer() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Attendre que Zustand persist restaure l'état depuis localStorage
    // This ensures the store is rehydrated before any components use it
    setIsHydrated(true);
  }, []);

  // Return null until hydration is complete
  if (!isHydrated) {
    return null;
  }

  return null;
}

// Export a hook to check if store is hydrated
export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

