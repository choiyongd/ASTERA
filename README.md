# ASTERA

Firebase 기반 온라인 탐구 학습 사이트입니다. 기존 브랜드 화면과 8개 유니버스 LAB을 유지하면서 자료 업로드, 과정 발행, 관리자 페이지, 회원 마이페이지를 제공합니다.

- 이메일 회원가입·로그인과 인증된 관리자 권한
- PDF·단일 HTML 웹앱·외부 웹앱·기존 LAB 연결
- 초안/미리보기/발행/이전 버전 복구
- 무료 체험·회원·멤버십 접근 범위
- 주제당 약 20분의 5단계 학습과 계정별 이어 학습
- 회원 학습 이력, 유니버스 완료율과 학습 전후 역량 자기평가 그래프
- 안내 페이지 관리와 회원 활동 현황

## 시작

Firebase 프로젝트, 인증·Firestore·Storage 설정과 관리자 지정은 **[docs/learning-setup.md](docs/learning-setup.md)** 순서로 진행합니다. 공개 웹 앱 설정을 `.env.local`에 넣고 실행합니다. 운영은 기존 Vercel 프로젝트를 사용합니다.

```text
npm ci
npm run dev
npm test
npm run build
```

관리자 로그인 `/admin/login`, 관리자 홈 `/admin`, 학습 `/learn`, 마이페이지 `/account`, 안내 페이지 `/pages`입니다. 실제로 발행한 자료가 없으면 학습 목록은 빈 상태로 표시합니다.

Cloud Storage에는 Blaze 요금제 연결이 필요합니다. 학습 기능은 Firebase 사용자의 권한과 보안 규칙으로 동작하며 서비스 계정 비밀 키를 브라우저에 사용하지 않습니다.

기존 `/lab`은 무료 체험으로 유지합니다. 기존 LAB의 브라우저 기록은 새 회원 과정으로 자동 이전하지 않습니다. `lib/supabase/`, `supabase/schema.sql`, 기존 `SETUP_GUIDE.md`는 이전 구현의 참고 자료이며 현재 앱의 계정·학습 경로는 Firebase를 사용합니다.
