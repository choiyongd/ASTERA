// Run with a protected local Firebase service account, never in a public browser.
// node --env-file=.env.local scripts/set-admin.mjs admin@example.com
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
const email = process.argv[2];
if (!email || !email.includes("@"))
  throw new Error("관리자 가입 이메일을 지정해주세요.");
if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  throw new Error(
    "보호된 로컬 환경에 Firebase 서비스 계정 설정이 필요합니다. 비밀 키를 대화에 붙여넣지 마세요.",
  );
const credential = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
if (credential.project_id !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  throw new Error("Firebase 프로젝트가 일치하지 않습니다.");
const app = initializeApp({ credential: cert(credential) }),
  user = await getAuth(app).getUserByEmail(email);
if (!user.emailVerified)
  throw new Error("해당 계정의 이메일 인증부터 완료해주세요.");
await getFirestore(app)
  .collection("learning_admins")
  .doc(user.uid)
  .set({ user_id: user.uid, created_at: new Date().toISOString() });
console.log("지정한 계정을 ASTERA 자료 관리자로 설정했습니다.");
