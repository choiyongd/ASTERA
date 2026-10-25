'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { restoreSession } from '@/lib/firebase/client';
import { firebaseConfigured } from '@/lib/firebase/config';
export default function SessionBridge() {
  const router = useRouter();
  useEffect(() => {
    if (!firebaseConfigured()) return;
    const changed = () => router.refresh();
    const renew = (force = false) => restoreSession(force).catch(() => {});
    const focus = () => { void renew(); };
    const visible = () => { if (document.visibilityState === 'visible') void renew(); };
    window.addEventListener('astera:session-synced', changed);
    window.addEventListener('focus', focus);
    document.addEventListener('visibilitychange', visible);
    const interval = window.setInterval(() => { void renew(true); }, 30 * 60 * 1000);
    void renew();
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('astera:session-synced', changed);
      window.removeEventListener('focus', focus);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [router]);
  return null;
}
