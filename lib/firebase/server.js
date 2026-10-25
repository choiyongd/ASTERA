import "server-only";
import { initializeServerApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { cookies, headers } from "next/headers";
import { firebaseConfig, firebaseConfigured } from "./config";
import { FirebaseStore } from "./store";
import { usableSessionToken } from "./session-token.mjs";
export async function firebaseSession(tokenOverride) {
  if (!firebaseConfigured())
    return { configured: false, db: null, user: null, token: null };
  const token = tokenOverride ?? (await cookies()).get("astera_session")?.value;
  const sessionExpired = Boolean(token) && !usableSessionToken(token);
  const freshToken = sessionExpired ? undefined : token;
  const app = initializeServerApp(firebaseConfig, {
    authIdToken: freshToken || undefined,
    releaseOnDeref: await headers(),
  });
  const auth = getAuth(app);
  await auth.authStateReady();
  const current = auth.currentUser;
  return {
    configured: true,
    sessionExpired,
    db: new FirebaseStore(getFirestore(app), current?.uid || null),
    user: current
      ? {
          id: current.uid,
          email: current.email,
          emailVerified: current.emailVerified,
        }
      : null,
    token: current ? freshToken : null,
  };
}
export async function firebaseFile(path, token, range) {
  const response = await fetch(
    `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(firebaseConfig.storageBucket)}/o/${encodeURIComponent(path)}?alt=media`,
    {
      headers: {
        ...(token ? { Authorization: `Firebase ${token}` } : {}),
        ...(range ? { Range: range } : {}),
      },
      cache: "no-store",
    },
  );
  if (!response.ok)
    throw Object.assign(
      new Error(
        "파일을 불러오지 못했어요. 파일 저장소 연결과 이용 권한을 확인해주세요.",
      ),
      { status: response.status === 403 ? 403 : 503 },
    );
  return response;
}
