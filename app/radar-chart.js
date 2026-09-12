// 나의 탐구 지도에 쓰이는 간단한 레이더(스파이더) 차트.
// 외부 차트 라이브러리 없이 순수 SVG 좌표 계산만으로 그립니다.
function pointAt(cx, cy, radius, index, total) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

export default function RadarChart({ labels, values, size = 260, dimmed = false }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 34;
  const rings = [0.25, 0.5, 0.75, 1];

  const dataPoints = values.map((v, i) => pointAt(cx, cy, maxR * Math.max(0, Math.min(1, v)), i, values.length));
  const dataPath = dataPoints.map((p) => p.join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" role="img" aria-label="나의 탐구 관심 분포 레이더 차트">
      {rings.map((r) => {
        const pts = labels.map((_, i) => pointAt(cx, cy, maxR * r, i, labels.length).join(",")).join(" ");
        return <polygon key={r} points={pts} fill="none" stroke="var(--line)" strokeWidth="1" />;
      })}
      {labels.map((_, i) => {
        const [x, y] = pointAt(cx, cy, maxR, i, labels.length);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth="1" />;
      })}
      {!dimmed && (
        <>
          <polygon points={dataPath} fill="var(--blue)" fillOpacity="0.2" stroke="var(--blue)" strokeWidth="2" strokeLinejoin="round" />
          {dataPoints.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.2" fill="var(--blue-dark)" />
          ))}
        </>
      )}
      {labels.map((label, i) => {
        const [x, y] = pointAt(cx, cy, maxR + 20, i, labels.length);
        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10.5"
            fontWeight="700"
            fill="var(--muted)"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
