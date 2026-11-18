import Link from "next/link";
import NavBar from "../nav-bar";
import { membershipSalesReady } from "@/lib/membership-status";
import CheckoutClient from "./checkout-client";

export const metadata = { title: "워크북 멤버십 | ASTERA" };
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  if (membershipSalesReady()) return <CheckoutClient />;
  return <><NavBar /><main className="wrap page-hero">
    <h1>워크북 멤버십을 준비하고 있어요</h1>
    <p>먼저 무료 워크북 미리보기와 LAB을 이용해 보세요.</p>
    <div className="hero-actions">
      <Link className="primary" href="/workbook">워크북 미리보기</Link>
      <Link className="secondary" href="/lab">무료 LAB 둘러보기</Link>
    </div>
  </main></>;
}
