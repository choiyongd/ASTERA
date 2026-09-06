import "./globals.css";

export const metadata = {
  title: "ASTERA — 궁금함이 배움이 되는 곳",
  description:
    "7–17세를 위한 세상 이해 학습 플랫폼 ASTERA. 철학부터 AI, 경제, 예술, 공학, 오늘의 뉴스까지 질문하고 탐구합니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=Playfair+Display:ital@1&family=Noto+Serif+KR:wght@500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
