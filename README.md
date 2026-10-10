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

## ASTERA LAB (2026-10)

- `/lab`: 첫 8개 유니버스의 주제, 체험 가능 여부, 순차 개발 목록.
- `/lab/science-001`: 로그인 없이 5–10분 동안 체험하는 LIFE FINDER.
- 홈의 무료 LAB 버튼, 모바일 하단 LAB 메뉴, SCIENCE 001 상세 페이지에서 진입할 수 있습니다.
- 학습 흐름: 처음 생각 → 개념 확인 → 6개 토큰으로 관찰 → 환경에 맞춘 생명체 상상 → 처음/최종 생각 비교.
- 행성과 관찰 결과는 교육용 가상 자료입니다. 실제 관측 자료나 생명 확률 점수로 제시하지 않습니다.
- 기록은 `astera_lab_science_001_v1` 키로 현재 브라우저에만 저장됩니다. `.txt` 기록 저장과 인쇄를 지원합니다. 서버 저장, 학생 계정, 학급별 공유는 아직 제공하지 않습니다.
- 워크북·교사 가이드 PDF 연결은 실제 파일이 제공되면 추가합니다. 준비 중인 주제는 실행 버튼을 노출하지 않습니다.
- 공개 LAB 개발은 Supabase 키 없이도 가능하며, 기존 로그인/결제는 환경 설정이 필요합니다.

```bash
npm ci
npm test
npm run build
npm run dev
```

주제 목록은 `lib/lab/topics.js`, SCIENCE의 자료/전환/검증은 `lib/lab/science.mjs`, 앱 화면은 `app/lab/`에 있습니다. 다음 개발 주제는 TECH 001 · CHOICE LENS입니다. 자세한 설계와 범위는 `docs/astera-lab-design.md`를 참고하세요.
