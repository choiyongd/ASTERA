'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { restoreSession } from '@/lib/firebase/client';
export default function SessionRecovery() {
  const router=useRouter();
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function retry(){
    setBusy(true);setError('');
    try { await restoreSession(true); router.refresh(); }
    catch { setError('로그인 상태를 확인하지 못했어요. 연결을 확인한 뒤 다시 시도해주세요.'); }
    finally { setBusy(false); }
  }
  return <><button type="button" className="learning-button" disabled={busy} onClick={retry}>{busy?'로그인 상태 확인 중…':'로그인 상태 확인 후 다시 불러오기'}</button>{error&&<p role="alert">{error}</p>}</>;
}
