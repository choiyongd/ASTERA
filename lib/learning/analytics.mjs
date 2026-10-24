import { UNIVERSES, COMPETENCIES } from "./domain.mjs";
export function learningAnalytics(catalog, records) {
  const current = new Map(catalog.map((c) => [c.release_id, c]));
  const latest = new Map();
  for (const r of records.filter((r) => r.completed)) {
    const key = r.lesson_id || r.release_id;
    if (!latest.has(key) || r.updated_at > latest.get(key).updated_at)
      latest.set(key, r);
  }
  const completed = [...latest.values()],
    assessed = completed.filter(
      (r) =>
        r.assessment?.pre?.length === 4 &&
        r.assessment?.post?.length === 4 &&
        r.assessment?.pre?.every((v) => v >= 1 && v <= 5) &&
        r.assessment?.post?.every((v) => v >= 1 && v <= 5),
    );
  const universes = UNIVERSES.map((universe) => {
    const topics = catalog.filter((c) => c.universe === universe);
    const finished = records.filter(
      (r) =>
        r.completed &&
        current.has(r.release_id) &&
        current.get(r.release_id).universe === universe,
    ).length;
    return {
      universe,
      total: topics.length,
      completed: finished,
      percent: topics.length ? Math.round((finished / topics.length) * 100) : 0,
    };
  });
  const competencies = COMPETENCIES.map((c, index) => {
    const n = assessed.length;
    const pre = n
        ? assessed.reduce((s, r) => s + r.assessment.pre[index], 0) / n
        : null,
      post = n
        ? assessed.reduce((s, r) => s + r.assessment.post[index], 0) / n
        : null;
    return { ...c, pre, post, change: n ? post - pre : null, count: n };
  });
  const timeline = completed
    .map((r) => ({
      date: new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(r.updated_at)),
      title: r.title || "학습 완료",
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .reduce((list, item) => {
      const last = list.at(-1);
      if (last?.date === item.date) last.count++;
      else list.push({ date: item.date, count: 1 });
      return list;
    }, []);
  let cumulative = 0;
  for (const point of timeline) {
    cumulative += point.count;
    point.total = cumulative;
  }
  return {
    universes,
    competencies,
    timeline,
    totalCompleted: completed.length,
    inProgress: records.filter((r) => !r.completed && current.has(r.release_id))
      .length,
    assessedCount: assessed.length,
  };
}
