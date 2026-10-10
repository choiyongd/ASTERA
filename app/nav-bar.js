"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconSearch, IconBell, IconUser, IconMenu, IconClose, IconHome, IconCompass, IconCheck, IconChat } from "./icons";

export default function NavBar() {
  const [user, setUser] = useState(undefined); // undefined = 확인 중
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Public LAB activities must work even before auth configuration is installed.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setUser(null);
      return;
    }
    let active = true;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => { if (active) setUser(data.user ?? null); }).catch(() => { if (active) setUser(null); });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function goSearch() {
    if (pathname === "/") {
      document.getElementById("hero-search")?.focus();
      document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#top");
    }
  }

  const NAV_LINKS = [
    { href: "/about", label: "ASTERA 소개" },
    { href: "/#discover", label: "탐험하기" },
    { href: "/#universes", label: "유니버스" },
    { href: "/lab", label: "ASTERA LAB" },
    { href: "/#products", label: "학습도구" },
    { href: "/#community", label: "커뮤니티" },
    { href: "/pricing", label: "요금제" },
  ];
  const isCurrent = (href) => href === "/lab" ? pathname.startsWith("/lab") : pathname === href;

  return (
    <>
      <header className="topbar">
        <div className="wrap nav">
          <Link className="brand" href="/" aria-label="ASTERA 홈">
            <img className="brand-logo" src="/brand/astera_logo_reversed_transparent.png" alt="ASTERA" width={160} height={36} />
            <span className="beta-badge">BETA</span>
          </Link>

          <nav className="navlinks" aria-label="상단 메뉴">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} href={l.href} aria-current={isCurrent(l.href) ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <button className="icon-btn" aria-label="검색" onClick={goSearch}>
              <IconSearch width={19} height={19} />
            </button>

            {user === undefined && <span className="pill" style={{ visibility: "hidden" }}>회원가입</span>}

            {user === null && (
              <>
                <Link className="navlinks-login" href="/login">
                  로그인
                </Link>
                <Link className="pill" href="/signup">
                  회원가입
                </Link>
              </>
            )}

            {user && (
              <>
                <div className="bell-wrap" ref={bellRef}>
                  <button className="icon-btn" aria-label="알림" onClick={() => setBellOpen((v) => !v)}>
                    <IconBell width={19} height={19} />
                  </button>
                  {bellOpen && (
                    <div className="bell-drop">
                      <b>알림</b>
                      <p>아직 새 알림이 없어요.</p>
                    </div>
                  )}
                </div>
                <Link className="avatar-btn" href="/account" aria-label="내 계정">
                  <IconUser width={17} height={17} />
                </Link>
              </>
            )}

            <button className="icon-btn menu-btn" aria-label="메뉴" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <IconClose width={19} height={19} /> : <IconMenu width={19} height={19} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-menu" id="mobile-menu">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} href={l.href} aria-current={isCurrent(l.href) ? "page" : undefined} onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="mobile-menu-divider" />
            {user ? (
              <Link href="/account" onClick={() => setMenuOpen(false)}>
                내 계정
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  로그인
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)}>
                  회원가입
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      <nav className="tabbar" aria-label="모바일 하단 메뉴">
        <Link href="/" className={pathname === "/" ? "active" : ""}>
          <IconHome width={20} height={20} />
          <span>홈</span>
        </Link>
        <Link href="/lab" className={pathname.startsWith("/lab") ? "active" : ""} aria-current={pathname.startsWith("/lab") ? "page" : undefined}>
          <IconCompass width={20} height={20} />
          <span>LAB</span>
        </Link>
        <Link href="/account" className={pathname === "/account" ? "active" : ""}>
          <IconCheck width={20} height={20} />
          <span>내 활동</span>
        </Link>
        <Link href="/#community">
          <IconChat width={20} height={20} />
          <span>커뮤니티</span>
        </Link>
        <Link href="/account" className={pathname === "/account" ? "active" : ""}>
          <IconUser width={20} height={20} />
          <span>MY</span>
        </Link>
      </nav>
    </>
  );
}
