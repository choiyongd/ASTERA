import "./globals.css";
import "./brand-intro.css";
import "./site-motion.css";
import BrandIntro from "./brand-intro";
import SiteMotion from "./site-motion";
import SessionBridge from "./session-bridge";

export const metadata = {
  title: "ASTERA — 궁금함이 배움이 되는 곳",
  description:
    "초등 3–6학년과 중학생을 위한 ASTERA. 과학·문학·철학·기술의 자료를 보고, 근거를 찾아 나의 생각을 남깁니다.",
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
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=Playfair+Display:ital@1&family=Noto+Serif+KR:wght@500;700&family=Cormorant+Garamond:wght@600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body><SessionBridge /><BrandIntro><a className="skip-to-content" href="#site-main">본문으로 바로 가기</a><div id="site-main" tabIndex={-1}><SiteMotion>{children}</SiteMotion></div></BrandIntro></body>
    </html>
  );
}
