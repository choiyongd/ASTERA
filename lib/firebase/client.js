"use client";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onIdTokenChanged,
  sendEmailVerification,
} from "firebase/auth";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { firebaseConfig, firebaseConfigured } from "./config";
export function firebaseClient() {
  if (!firebaseConfigured())
    throw new Error(
      "Firebase 연결 설정을 준비하고 있어요. 잠시 후 다시 이용해주세요.",
    );
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return { app, auth: getAuth(app), storage: getStorage(app) };
}
async function syncSession(user) {
  const response = await fetch("/api/auth/session", {
    method: user ? "POST" : "DELETE",
    headers: { "Content-Type": "application/json", "X-Astera-Action": "1" },
    body: user
      ? JSON.stringify({ idToken: await user.getIdToken() })
      : undefined,
  });
  if (!response.ok)
    throw new Error("로그인 상태를 저장하지 못했어요. 다시 로그인해주세요.");
}
const asUser = (user) =>
  user
    ? { id: user.uid, email: user.email, emailVerified: user.emailVerified }
    : null;
export async function restoreSession() {
  const { auth } = firebaseClient();
  await auth.authStateReady();
  if (auth.currentUser) await syncSession(auth.currentUser);
  return asUser(auth.currentUser);
}
export function createClient() {
  return {
    auth: {
      async getUser() {
        const { auth } = firebaseClient();
        await auth.authStateReady();
        return { data: { user: asUser(auth.currentUser) } };
      },
      async signInWithPassword({ email, password }) {
        try {
          const { user } = await signInWithEmailAndPassword(
            firebaseClient().auth,
            email,
            password,
          );
          await syncSession(user);
          return { data: { user: asUser(user) }, error: null };
        } catch {
          return {
            error: { message: "이메일·비밀번호와 로그인 설정을 확인해주세요." },
          };
        }
      },
      async signUp({ email, password }) {
        try {
          const { user } = await createUserWithEmailAndPassword(
            firebaseClient().auth,
            email,
            password,
          );
          await sendEmailVerification(user);
          await syncSession(user);
          return { data: { user: asUser(user), session: null }, error: null };
        } catch (e) {
          return {
            data: {},
            error: {
              message:
                e.code === "auth/email-already-in-use"
                  ? "이미 가입한 이메일이에요. 로그인해주세요."
                  : "가입을 완료하지 못했어요. 이메일과 비밀번호, 서비스 연결을 확인해주세요.",
            },
          };
        }
      },
      async signOut() {
        await syncSession(null);
        await signOut(firebaseClient().auth);
      },
      onAuthStateChange(callback) {
        let active = true;
        const unsubscribe = onIdTokenChanged(
          firebaseClient().auth,
          async (user) => {
            try {
              await syncSession(user);
              if (active)
                callback("TOKEN_CHANGED", user ? { user: asUser(user) } : null);
            } catch {
              if (active) callback("SESSION_ERROR", null);
            }
          },
        );
        return {
          data: {
            subscription: {
              unsubscribe() {
                active = false;
                unsubscribe();
              },
            },
          },
        };
      },
    },
  };
}
export function uploadLearningFile(path, file, onProgress) {
  if (!firebaseClient().storage)
    throw new Error("파일 저장소 연결이 필요해요. 관리자에게 문의해주세요.");
  const task = uploadBytesResumable(ref(firebaseClient().storage, path), file, {
    contentType: file.name.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : "text/html",
  });
  return new Promise((resolve, reject) =>
    task.on(
      "state_changed",
      (snapshot) =>
        onProgress?.(
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        ),
      reject,
      () => resolve(),
    ),
  );
}
