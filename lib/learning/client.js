"use client";
export async function learningRequest(url, body, method = "POST") {
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-Astera-Action": "1" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error || "요청을 처리하지 못했어요.");
    error.status = response.status;
    throw error;
  }
  return result;
}
