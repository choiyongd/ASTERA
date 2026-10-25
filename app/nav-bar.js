"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/firebase/client";
import { NAV_GROUPS, isCurrentLink } from "@/lib/navigation.mjs";
import {
  IconSearch,
  IconBell,
  IconUser,
  IconMenu,
  IconClose,
  IconHome,
  IconCompass,
  IconCheck,
} from "./icons";

export default function NavBar() {
  const [user, setUser] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);
  const [bellOpen, setBellOpen] = useState(false);
  const headerRef = useRef(null),
    bellRef = useRef(null);
  const pathname = usePathname(),
    router = useRouter();

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      !process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    ) {
      setUser(null);
      return;
    }
    let active = true;
    const client = createClient();
    client.auth
      .getUser()
      .then(({ data }) => {
        if (active) setUser(data.user ?? null);
      })
      .catch(() => {
        if (active) setUser(null);
      });
    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    function outside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target))
        setBellOpen(false);
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setOpenGroup(null);
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  useEffect(() => {
    setMenuOpen(false);
    setOpenGroup(null);
  }, [pathname]);
  function closeMenus() {
    setMenuOpen(false);
    setOpenGroup(null);
  }
  function goSearch() {
    closeMenus();
    if (pathname === "/") {
      document.getElementById("hero-search")?.focus();
      document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
    } else router.push("/#top");
  }
  function groupKey(event, id) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.currentTarget.querySelector("button")?.focus();
      setOpenGroup(null);
    } else if (event.key === "ArrowDown" && event.target.tagName === "BUTTON") {
      event.preventDefault();
      setOpenGroup(id);
      const group = event.currentTarget;
      requestAnimationFrame(() => group.querySelector("a")?.focus());
    }
  }
  return (
    <>
      <header
        className="topbar"
        ref={headerRef}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeMenus();
            setBellOpen(false);
          }
        }}
      >
        <div className="wrap nav">
          <Link
            className="brand"
            href="/"
            aria-label="ASTERA 홈"
            onClick={closeMenus}
          >
            <img
              className="brand-logo"
              src="/brand/astera_logo_reversed_transparent.png"
              alt="ASTERA"
              width={160}
              height={36}
            />
            <span className="beta-badge">BETA</span>
          </Link>
          <nav className="navlinks" aria-label="상단 메뉴">
            {NAV_GROUPS.map((group) => (
              <div
                className="nav-group"
                key={group.id}
                onMouseEnter={() => setOpenGroup(group.id)}
                onMouseLeave={() => setOpenGroup(null)}
                onFocusCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget))
                    setOpenGroup(group.id);
                }}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget))
                    setOpenGroup(null);
                }}
                onKeyDown={(event) => groupKey(event, group.id)}
              >
                <button
                  className="nav-group-trigger"
                  type="button"
                  aria-expanded={openGroup === group.id}
                  aria-controls={"nav-" + group.id}
                  data-current={
                    group.items.some((item) =>
                      isCurrentLink(pathname, item.href),
                    ) || undefined
                  }
                  onClick={() => setOpenGroup(group.id)}
                >
                  {group.label}
                  <span className="nav-chevron" aria-hidden="true" />
                </button>
                <div
                  className="nav-dropdown"
                  id={"nav-" + group.id}
                  hidden={openGroup !== group.id}
                >
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={
                        item.secondary ? "nav-secondary-item" : undefined
                      }
                      aria-current={
                        isCurrentLink(pathname, item.href) ? "page" : undefined
                      }
                      onClick={closeMenus}
                    >
                      <b>{item.label}</b>
                      {item.hint && <small>{item.hint}</small>}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="nav-actions">
            <button className="icon-btn" aria-label="검색" onClick={goSearch}>
              <IconSearch width={19} height={19} />
            </button>
            {user === undefined && (
              <span className="pill" style={{ visibility: "hidden" }}>
                회원가입
              </span>
            )}
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
                  <button
                    className="icon-btn"
                    aria-label="알림"
                    aria-expanded={bellOpen}
                    onClick={() => setBellOpen((value) => !value)}
                  >
                    <IconBell width={19} height={19} />
                  </button>
                  {bellOpen && (
                    <div className="bell-drop">
                      <b>알림</b>
                      <p>아직 새 알림이 없어요.</p>
                    </div>
                  )}
                </div>
                <Link
                  className="avatar-btn"
                  href="/account"
                  aria-label="마이페이지"
                >
                  <IconUser width={17} height={17} />
                </Link>
              </>
            )}
            <button
              className="icon-btn menu-btn"
              aria-label="메뉴"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => {
                setMenuOpen((value) => !value);
                setOpenGroup(null);
              }}
            >
              {menuOpen ? (
                <IconClose width={19} height={19} />
              ) : (
                <IconMenu width={19} height={19} />
              )}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            className="mobile-menu"
            id="mobile-menu"
            aria-label="모바일 전체 메뉴"
          >
            {NAV_GROUPS.map((group, index) => (
              <details
                className="mobile-nav-group"
                key={group.id}
                name="mobile-navigation"
                open={index === 0}
              >
                <summary>
                  {group.label}
                  <span className="nav-chevron" aria-hidden="true" />
                </summary>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={
                      isCurrentLink(pathname, item.href) ? "page" : undefined
                    }
                    onClick={closeMenus}
                  >
                    {item.label}
                  </Link>
                ))}
              </details>
            ))}
            <div className="mobile-menu-divider" />
            {user ? (
              <Link href="/account" onClick={closeMenus}>
                마이페이지
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={closeMenus}>
                  로그인
                </Link>
                <Link href="/signup" onClick={closeMenus}>
                  회원가입
                </Link>
              </>
            )}
          </nav>
        )}
      </header>
      <nav className="tabbar" aria-label="모바일 하단 메뉴">
        {[
          ["/", "홈", IconHome],
          ["/lab", "LAB", IconCompass],
          ["/learn", "학습", IconCompass],
          ["/learn/records", "기록", IconCheck],
          ["/account", "MY", IconUser],
        ].map(([href, label, Icon]) => {
          const current =
            href === "/" ? pathname === "/" : isCurrentLink(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={current ? "active" : ""}
              aria-current={current ? "page" : undefined}
            >
              <Icon width={20} height={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
