# ASTERA Firebase 운영 연결

웹 화면은 기존 Vercel `astera` 프로젝트를 사용합니다. 로그인은 Firebase Authentication, 자료·발행본·학습 기록은 Firestore, PDF와 단일 HTML 파일은 Cloud Storage를 사용합니다. 학습 기능은 FirebaseServerApp으로 로그인한 사용자의 권한을 이어받아 동작합니다.

## Firebase 프로젝트 연결

1. ASTERA 전용 Firebase 프로젝트와 웹 앱을 선택하거나 만듭니다. 다른 앱의 데이터베이스를 재사용하지 않습니다.
2. Authentication에서 이메일/비밀번호 제공자를 켭니다. 인증 도메인에 실제 Vercel 도메인을 등록합니다.
3. Firestore 기본 `(default)` 데이터베이스를 생성합니다. `firestore.rules`와 `firestore.indexes.json`을 배포합니다.
4. Storage 버킷을 생성합니다. Cloud Storage 사용에는 Blaze 요금제 연결이 필요합니다. 비용과 결제 계정 연결은 프로젝트 소유자가 확인한 뒤 진행합니다. `storage.rules`를 배포하고 Storage 규칙에서 Firestore를 조회하도록 서비스 간 권한을 승인합니다.
5. Firebase 웹 앱 설정에서 아래 공개 설정을 Vercel Production/Preview 환경과 로컬 `.env.local`에 등록합니다. 웹 설정은 공개 값입니다. 서비스 계정의 비밀 키는 공개 환경 변수에 넣지 않습니다.

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

로컬에서는 `npm ci`, `npm run dev`를 실행합니다. 환경 변수 변경 후 다시 빌드·배포합니다.

## 관리자 지정과 로그인

1. 지정된 관리자 이메일로 ASTERA에 회원가입하고 인증 메일의 링크를 완료합니다. 비밀번호는 본인이 직접 정하며 대화에 보내지 않습니다.
2. Firebase Authentication에서 해당 계정의 UID를 확인합니다.
3. Firebase Console의 Firestore에서 `learning_admins` 컬렉션에 UID를 문서 ID로 하는 문서를 만듭니다. `user_id` 필드에도 같은 UID 문자열을 넣습니다. 이 컬렉션은 브라우저에서 수정할 수 없습니다.
4. 다시 로그인해 `/admin/login`으로 들어갑니다. 이메일 인증과 역할 문서가 모두 있어야 관리자 권한이 생깁니다.

보호된 서버 서비스 계정을 이미 설정한 경우 `scripts/set-admin.mjs`를 사용할 수도 있습니다. 서비스 계정은 공개 저장소에 올리지 않습니다.

```text
node --env-file=.env.local scripts/set-admin.mjs 관리자이메일
```

이 스크립트는 `FIREBASE_SERVICE_ACCOUNT_JSON`으로 프로젝트를 확인하고, 이메일 인증을 마친 기존 가입 계정만 관리자로 지정합니다. 학습 기능 자체에는 서비스 계정 키가 필요하지 않습니다.

## 관리자 기능

- `/admin`: 주제·학습 목표·5단계 안내·PDF·웹앱 관리. 초안과 발행본을 구분하고 발행 이력을 보존합니다.
- `/admin/pages`: 공지·소개·이용 가이드 등 별도 안내 페이지의 작성·수정·미리보기·발행·공개 중단. 발행본은 `/pages`와 `/pages/주소`에 반영됩니다. 기존 홈페이지 레이아웃과 프로그램 수정은 소스 배포로 반영합니다.
- `/admin/members`: 가입 회원과 학습 진행·완료 수, 최근 활동을 확인합니다.

## 첫 학습 발행

1. 새 주제를 만들고 이름을 입력해 초안을 저장합니다.
2. PDF(25MB 이하), 단일 HTML 웹앱(2MB 이하), 외부 HTTPS 웹앱 또는 기존 ASTERA LAB을 연결합니다.
3. 주소·소개·목표와 5단계의 안내·질문을 채웁니다. 단계 시간은 질문 2분, 개념 4분, 탐색 8분, 응용 4분, 성찰 2분입니다.
4. 무료 체험·회원 공개·멤버십 전용 중 선택합니다. 무료 체험 주제 수는 운영자가 지정합니다.
5. 저장본 미리보기 후 발행합니다. `/learn`에 반영되며, 자료 발행에는 재배포가 필요 없습니다.

발행한 주소는 고정됩니다. 파일 교체는 새 파일로 올리고 연결을 바꾸어 다시 발행합니다. 이전 파일을 덮어쓰지 않습니다. 이전 버전을 초안으로 불러와 복구할 수 있습니다. 공개 중단 시 새 파일 접근은 차단되며, 이미 내려받은 파일은 회수되지 않습니다.

## 회원 마이페이지와 지표

- `/account`: 최근 학습, 이어 학습, 유니버스별 완료율, 역량 자기평가 변화, 누적 학습 흐름.
- `/learn/records`: 버전별 학습 이력과 본인이 남긴 답변. 이전 발행본 기록도 보관합니다.
- 완료율은 현재 발행된 과정을 기준으로 계산합니다. 새 발행본은 다시 학습할 수 있습니다.
- 역량은 근거로 생각하기·문제 해결하기·새롭게 만들기·생각 설명하기의 4가지 자기평가입니다. 학습 전후 1~5점 응답을 비교합니다. 시험 성적이나 객관적인 진단 결과로 표시하지 않습니다.
- 같은 주제를 반복한 경우 최신 완료 기록만 역량 평균에 반영합니다. 데이터가 없으면 빈 상태를 보여줍니다.
- 비회원 기록은 해당 브라우저에만 저장하며 로그인 시 자동 이전하지 않습니다. 기록 내려받기와 기기 기록 지우기를 제공합니다.

## 파일 지원 범위

HTML은 CSS와 JavaScript를 파일 안에 포함한 단일 파일입니다. 외부 스크립트·네트워크·폼 제출을 차단한 sandbox에서 실행합니다. 서버 통신·로그인·여러 파일 빌드가 필요한 웹앱은 HTTPS 주소로 연결합니다. 외부 사이트는 삽입을 제한할 수 있어 새 창 링크도 제공합니다. ZIP 서버 호스팅은 이번 범위에 포함하지 않습니다.

## 결제와 뉴스레터

기존 토스 요금과 결제 화면은 유지하되, Firebase 서버의 주문·멤버십 갱신과 뉴스레터 저장에는 보호된 `FIREBASE_SERVICE_ACCOUNT_JSON` 및 실제 토스 서버 설정이 필요합니다. 설정 전에는 준비 중 오류를 반환하며 결제 성공이나 저장 성공을 꾸며내지 않습니다. 실제 결제 검증은 별도 설정 후 진행합니다.

## 검증

- `npm test`: 기존 LAB·학습 화면·진도·자기평가·그래프 집계·페이지 입력 검증.
- `npm run build`: Next.js 전체 빌드.
- `npm run test:rules`: Firebase Firestore/Storage 에뮬레이터에서 실제 규칙을 검사합니다. Java 21+가 필요합니다. 테스트 프로젝트는 `demo-astera`이며 운영 데이터에 쓰지 않습니다.

운영 Firebase 프로젝트가 연결되면 실제 회원가입 → 이메일 인증 → 관리자 지정 → 업로드 → 발행 → 회원 학습 → 마이페이지 그래프 흐름을 별도로 확인합니다.

## 현재 운영 연결 상태

ASTERA 전용 프로젝트 `astera-learning-choiyongd`, 웹 앱 `ASTERA Web`, Standard 기본 데이터베이스(서울 `asia-northeast3`)와 이메일 로그인 설정을 배포했습니다. 사용자의 요청으로 Storage 파일 업로드는 보류하며 `FIREBASE_UPLOADS_ENABLED=false`로 설정합니다. 현재는 외부 웹앱 주소와 기존 LAB을 연결할 수 있습니다. 향후 Storage를 활성화하고 규칙을 배포한 뒤 이 값을 true로 바꾸고 재배포해야 새 파일 업로드를 허용합니다.
