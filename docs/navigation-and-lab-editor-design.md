# 메뉴와 LAB 편집 설계
기존 ASTERA 디자인을 직접 구현 기준으로 고정한다. 네이비 헤더, 골드 현재 위치, IBM Plex Sans KR, 흰색 편집 패널을 유지한다. Refero 검색은 NO_SUBSCRIPTION이어서 기존 제품과 craft-details의 focus-visible, focus-within, 터치·키보드 지침을 참조했다.

| 결정 | 근거 | 적용 |
|---|---|---|
| 상단 메뉴 3개 그룹 | 사용자의 항목 축소 요구 | 탐구하기·학습하기·ASTERA 안내 |
| 마우스와 키보드 하위 메뉴 | 사용자 hover 요구·craft-details | hover/focus 열기, Escape/밖 클릭 닫기, Tab/아래키 이동 |
| 모바일 접이식 메뉴 | 작은 화면과 터치 제약 | native details/summary, 같은 목적지 제공 |
| 발문 편집과 실험 코드 구분 | 기존 LAB 데이터 모델 | 문구와 개념 문항만 편집; 실험 알고리즘·예산·단계 검증 유지 |
| 초안·미리보기·발행 | 기존 학습 CMS 방식 | 저장은 비공개, 발행본만 공개 LAB에 적용 |
| 기존 LAB와 20분 학습 연결 | 사용자의 시스템 구조 질문 | 주제별 편집 탭과 연결 과정·자료 관리 링크 |
