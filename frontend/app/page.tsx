'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.push('/login');
  }, [router]);

  // Show loading while redirecting
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div
          className="text-center"
          style={{ color: 'var(--text-primary)' }}
        >
        <div className="text-lg">Redirecting to login...</div>
      </div>
    </div>
  );
}
