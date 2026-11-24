import Link from "next/link";

export default function ApplicationRecords({ entries }) {
  return <section className="learning-panel learning-application-evidence" aria-labelledby="my-application-title">
    <h2 id="my-application-title">배운 것을 써 본 기록</h2>
    <p className="learning-hint">처음 쓴 생각, 탐색에서 남긴 근거, 새 상황에 써 본 답을 함께 읽어 봐요.</p>
    {entries.length ? <>
      <p>새 상황에 답을 남겨 마친 주제 {entries.length}개</p>
      {entries.slice(0, 3).map((entry) => <details key={entry.releaseId}>
        <summary>{entry.title}</summary>
        <dl>
          {[
            ["처음 쓴 생각", entry.initial],
            ["탐색에서 남긴 답", entry.evidence],
            ["새 상황에 써 본 답", entry.application],
          ].filter(([, answer]) => answer).map(([label, answer]) => <div key={label}>
            <dt><strong>{label}</strong></dt><dd className="learning-application-record">{answer}</dd>
          </div>)}
        </dl>
        <Link className="learning-text-link" href={`/learn/records#record-${entry.releaseId}`}>이 주제의 전체 답변 →</Link>
      </details>)}
    </> : <p className="learning-chart-empty">응용 단계의 답을 남기고 학습을 마치면 여기에 나타나요.</p>}
  </section>;
}
