import { UniverseIcon } from "./universe-icons";

// 콘텐츠 썸네일. 같은 일러스트가 여러 카드에 반복되지 않도록
// 유니버스별 색과 아이콘, 콘텐츠 코드로 구성된 타일을 사용합니다.
export default function ContentTile({ item, className = "" }) {
  // 같은 유니버스의 콘텐츠끼리 타일이 똑같아 보이지 않도록
  // 콘텐츠 번호로 그라디언트 방향과 아이콘 배치를 바꿉니다.
  const variant = Number(item.code.split(" ")[1]) % 4;

  return (
    <div className={`ctile tint-${item.universe.toLowerCase()} cv-${variant} ${className}`.trim()}>
      <span className="ctile-code">{item.code}</span>
      <UniverseIcon name={item.universe} size={112} className="ctile-glyph" />
    </div>
  );
}
