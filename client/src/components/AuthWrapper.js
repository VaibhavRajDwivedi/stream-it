'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthWrapper({ children }) {
  const { checkAuth, authUser, isCheckingAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Triggers immediate authentication verification on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Evaluates routing constraints based on state mutations
  useEffect(() => {
    // Halts execution during active network verification
    if (isCheckingAuth) return;

    const isAuthRoute = pathname === '/login' || pathname === '/signup';

    // Enforces protected routing logic
    if (!authUser && !isAuthRoute) {
      router.push('/login');
    }
  }, [authUser, isCheckingAuth, pathname, router]);

  // Renders visual fallback avoiding asynchronous layout shifts
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Yields validated render tree
  return children;
}