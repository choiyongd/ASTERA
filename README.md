# ASTERA — 회원가입/결제 포함 실서비스 버전

기존 랜딩페이지 디자인을 그대로 옮기고, 아래 기능을 새로 붙인 Next.js 프로젝트입니다.

- 이메일 회원가입 / 로그인 (Supabase Auth)
- 로그인 + 멤버십 여부에 따른 워크북 콘텐츠 잠금
- 토스페이먼츠 결제위젯 연동 (테스트 모드) — 결제 성공 시 멤버십 자동 활성화
- 뉴스레터 구독 이메일 실제 DB 저장

자세한 설정 방법(Supabase 프로젝트 생성, 토스페이먼츠 키 발급, 배포, 실결제 전환)은
**`SETUP_GUIDE.md`** 를 순서대로 따라하시면 됩니다.

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local   # 값을 채운 뒤 실행
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.
