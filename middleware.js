import { NextResponse } from "next/server";
// Firebase 토큰과 자료 권한은 서버 페이지와 API에서 검증합니다.
export function middleware() {
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*", "/learn/:path*"] };
