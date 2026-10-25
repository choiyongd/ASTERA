"use client";
import { restoreSession } from "@/lib/firebase/client";
export async function learningRequest(url, body, method = "POST") {
  const send = () => fetch(url, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-Astera-Action": "1" },
    body: JSON.stringify(body),
  });
  let response = await send();
  if (response.status === 401 && await restoreSession(true)) response = await send();
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error || "요청을 처리하지 못했어요.");
    error.status = response.status;
    throw error;
  }
  return result;
}
