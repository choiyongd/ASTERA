import "server-only";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
export const firebaseAdminConfigured = () =>
  Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
export function firebaseAdminDb() {
  if (!firebaseAdminConfigured())
    throw new Error("서버 결제·구독 연결을 준비하고 있어요.");
  const existing = getApps().find((app) => app.name === "astera-server");
  const account = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  if (account.project_id !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
    throw new Error("서버 프로젝트 설정을 확인해주세요.");
  return getFirestore(
    existing || initializeApp({ credential: cert(account) }, "astera-server"),
  );
}
