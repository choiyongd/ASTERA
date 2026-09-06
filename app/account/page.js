import { redirect } from "next/navigation";
import Link from "next/link";
import NavBar from "../nav-bar";
import LogoutButton from "./logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_member, membership_expires_at")
    .eq("id", user.id)
    .single();

  const isMember =
    profile?.is_member && profile?.membership_expires_at && new Date(profile.membership_expires_at) > new Date();

  return (
    <>
      <NavBar />
      <div className="wrap page-hero">
        <h1>내 계정</h1>
        <p>{user.email}님, 환영해요.</p>
      </div>
      <div className="wrap" style={{ paddingBottom: 90 }}>
        <div className="account-grid">
          <div className="info-card">
            <div className="label">멤버십 상태</div>
            {isMember ? (
              <>
                <div className="value">이용 중</div>
                <span className="badge-member">
                  {new Date(profile.membership_expires_at).toLocaleDateString("ko-KR")} 까지
                </span>
              </>
            ) : (
              <>
                <div className="value">미가입</div>
                <span className="badge-guest">워크북 미이용</span>
              </>
            )}
          </div>
          <div className="info-card">
            <div className="label">계정</div>
            <div className="value" style={{ fontSize: 16 }}>{user.email}</div>
          </div>
        </div>

        <div className="hero-actions" style={{ marginTop: 26 }}>
          {!isMember && (
            <Link className="primary" href="/checkout">
              워크북 멤버십 시작하기
            </Link>
          )}
          <Link className="secondary" href="/workbook">
            워크북 바로가기
          </Link>
          <LogoutButton />
        </div>
      </div>
    </>
  );
}
