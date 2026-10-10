import Link from "next/link";

export default function BrandFooter() {
  return (
    <footer>
      <div className="wrap footerline">
        <Link className="footer-brand" href="/" aria-label="ASTERA 홈">
          <img src="/brand/astera_logo_primary_transparent.png" alt="ASTERA · Where Questions Open Worlds" width={200} height={45} loading="lazy" />
        </Link>
        <div className="footer-links"><Link href="/about">ASTERA 소개</Link><Link href="/lab">ASTERA LAB</Link><span>Beta · 2026</span></div>
      </div>
    </footer>
  );
}
