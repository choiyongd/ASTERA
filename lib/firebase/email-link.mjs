export function verificationPath(input, authDomain, appOrigin) {
  if (typeof input !== "string" || input.length > 8192)
    throw new Error("메일에 있는 인증 링크 전체를 붙여넣어주세요.");
  let url;
  try {
    url = new URL(input.trim().replaceAll("&amp;", "&"));
  } catch {
    throw new Error("메일에 있는 인증 링크 전체를 붙여넣어주세요.");
  }
  const allowed =
    url.protocol === "https:" &&
    (url.hostname === authDomain ||
      url.origin === appOrigin ||
      url.origin === "https://astera-mu.vercel.app");
  if (!allowed || !["/__/auth/action", "/auth/action"].includes(url.pathname))
    throw new Error("ASTERA에서 받은 이메일 인증 링크를 사용해주세요.");
  const mode = url.searchParams.get("mode"),
    code = url.searchParams.get("oobCode");
  if (mode && mode !== "verifyEmail")
    throw new Error("이메일 인증용 링크를 사용해주세요.");
  if (!code || !/^[A-Za-z0-9_-]{10,2048}$/.test(code))
    throw new Error(
      "인증 코드가 빠져 있어요. 메일의 전체 링크를 복사하거나 새 메일을 요청해주세요.",
    );
  return "/auth/action?mode=verifyEmail&oobCode=" + encodeURIComponent(code);
}
