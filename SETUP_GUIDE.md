# ASTERA 실서비스 전환 가이드

이 문서는 프로그래밍을 몰라도 순서대로 따라할 수 있도록 정리했습니다.
막히는 단계가 있으면 그 화면을 캡처해서 다시 물어보시면 됩니다.

---

## 0. 지금 상태 요약

- 회원가입/로그인, 워크북 잠금, 결제까지 **전체 흐름이 코드로 이미 구현**되어 있습니다.
- 다만 아래 두 가지는 "사장님 소유"의 실제 계정이 있어야만 켤 수 있어서, 코드만으로는 대신할 수 없습니다.
  1. **회원 데이터베이스** → Supabase 계정 (무료로 즉시 생성 가능)
  2. **결제** → 토스페이먼츠 개발자센터 계정 (테스트는 무료·즉시 / 실결제는 사업자등록 후)
- 아래 순서대로 하면 오늘 중으로 "테스트 결제까지 되는" 상태를 만들 수 있고,
  사업자등록이 끝나면 3번(실키 교체)만 다시 하면 바로 실결제로 전환됩니다.

---

## 1. Supabase 프로젝트 만들기 (회원/DB) — 5분

1. https://supabase.com 접속 → GitHub 또는 이메일로 무료 가입
2. **New project** 클릭 → 프로젝트 이름(예: `astera`), 비밀번호, 리전(**Northeast Asia (Seoul)** 추천) 선택 후 생성
3. 왼쪽 메뉴 **SQL Editor** 클릭 → **New query**
4. 이 프로젝트의 `supabase/schema.sql` 파일 내용을 전부 복사해서 붙여넣고 **Run** 클릭
   - `profiles`(회원), `orders`(결제 내역), `subscribers`(뉴스레터) 테이블이 만들어집니다.
5. 왼쪽 메뉴 **Project Settings → API** 로 이동해서 아래 3개 값을 복사해둡니다.
   - `Project URL` → `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` 키 (⚠️ 절대 외부 공개 금지) → `SUPABASE_SERVICE_ROLE_KEY`
6. (선택, 테스트 편하게 하려면) **Authentication → Providers → Email** 에서
   "Confirm email" 옵션을 꺼두면 가입 즉시 로그인됩니다. 실서비스 전환 시에는 다시 켜는 걸 추천합니다.

---

## 2. 토스페이먼츠 테스트 키 발급 — 5분 (사업자등록 필요 없음)

1. https://developers.tosspayments.com 접속 → 회원가입 (사업자등록 없이 개인 이메일로 가능)
2. 로그인 후 **내 개발자센터 → 연동 정보 (또는 API 키)** 메뉴로 이동
3. 기본으로 생성돼 있는 **테스트 상점**의 키를 확인합니다.
   - `테스트 클라이언트 키` (`test_ck_...`) → `.env.local`의 `NEXT_PUBLIC_TOSS_CLIENT_KEY`
     (지금 코드에는 토스페이먼츠가 튜토리얼용으로 공개한 테스트 키가 기본값으로 이미 들어있어
     이 단계를 건너뛰어도 결제창 화면은 뜹니다.)
   - `테스트 시크릿 키` (`test_sk_...`) → `.env.local`의 `TOSS_SECRET_KEY`
     (이 값은 **본인 계정에서 직접 발급받아야** 하며, 서버 결제 승인에 반드시 필요합니다.)

이 상태에서는 실제 카드가 청구되지 않는 "가짜 결제 성공/실패"를 그대로 체험할 수 있어요.

---

## 3. 로컬에서 실행해보기 — 3분

```bash
npm install
cp .env.local.example .env.local
# .env.local 파일을 열어서 1번, 2번에서 받은 값으로 채워넣기
npm run dev
```

브라우저에서 http://localhost:3000 접속 → 회원가입 → 워크북 클릭 → 결제 버튼까지 눌러보세요.
카드번호는 토스페이먼츠 문서의 테스트 카드번호(`4330-0000-0000-0000` 등, 유효기간·CVC는 아무 값)를 쓰면 됩니다.

---

## 4. 실제로 띄우기: Vercel 배포 — 10분

1. 이 프로젝트 폴더를 GitHub 저장소로 올립니다 (GitHub 계정이 없다면 무료 가입).
   ```bash
   git init
   git add .
   git commit -m "astera initial"
   # GitHub에서 새 저장소를 만든 뒤 안내하는 명령어로 push
   ```
2. https://vercel.com 접속 → GitHub 계정으로 가입/로그인
3. **Add New → Project** → 방금 올린 저장소 선택 → **Import**
4. **Environment Variables** 항목에 `.env.local`에 채운 값들을 그대로 하나씩 추가
   - `NEXT_PUBLIC_SITE_URL` 만 배포 후 발급되는 실제 주소(예: `https://astera.vercel.app`)로 바꿔주세요.
5. **Deploy** 클릭 → 몇 분 뒤 실제 URL이 발급되며, 이제 링크를 아는 누구나 접속할 수 있습니다.
6. (선택) 나중에 `astera.com` 같은 자체 도메인을 사면 Vercel **Settings → Domains** 에서 연결할 수 있습니다.

---

## 5. 실제 결제(카드 청구)로 전환하기

사업자등록과 PG 계약이 끝나면 아래만 바꾸면 됩니다. 코드 수정은 필요 없습니다.

1. **사업자등록** — 국세청 홈택스 또는 세무서에서 (개인/간이/법인 중 선택)
2. **통신판매업 신고** — 정부24 또는 관할 구청 (온라인으로 콘텐츠·상품을 판매하려면 필요)
3. **토스페이먼츠 가맹점 심사 신청** — 개발자센터에서 "실 서비스 신청" → 사업자등록증, 통신판매업신고증 등 서류 제출 → 심사(보통 며칠) 후 승인
4. 승인되면 발급되는 **라이브 클라이언트 키(`live_ck_...`)/시크릿 키(`live_sk_...`)** 로 Vercel의 환경변수(`NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`)를 교체하고 재배포
5. Supabase **Authentication → Providers → Email** 에서 "Confirm email"을 켜서 실제 이메일 인증을 받도록 설정 추천

---

## 6. 알아두면 좋은 것들

- **가격 변경**: `lib/membership.js` 파일 하나만 고치면 멤버십 이름·가격·기간이 전부 바뀝니다.
- **콘텐츠 추가**: 지금은 워크북 콘텐츠가 1개(다리 설계) 예시로 들어있습니다. `app/workbook/page.js` 를 복사해서
  주제별 페이지를 늘려가는 방식으로 확장할 수 있고, 콘텐츠 양이 많아지면 Supabase에 `lessons` 테이블을 만들어
  DB에서 불러오는 구조로 바꾸는 걸 다음 단계로 추천합니다.
- **보안**: `SUPABASE_SERVICE_ROLE_KEY` 와 `TOSS_SECRET_KEY` 는 절대 브라우저 코드나 공개 저장소에 커밋하지 마세요.
  (`.env.local` 은 `.gitignore` 에 이미 포함되어 있어 git에는 안 올라갑니다.)
- **환불/취소**: 토스페이먼츠 개발자센터 대시보드에서 결제 건별로 취소·환불이 가능합니다. 자동화가 필요해지면
  결제 취소 API를 추가로 붙일 수 있습니다.
