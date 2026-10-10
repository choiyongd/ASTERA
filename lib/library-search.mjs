export function filterLibrary(items, { query = "", type = "all", age = "전체", universe = null } = {}) {
  const normalize = value => String(value).normalize("NFKC").toLowerCase().replace(/\s+/g, "");
  const needle = normalize(query);
  return items.filter(item => {
    if (type !== "all" && item.type !== type) return false;
    if (age !== "전체" && item.ageGroup !== age) return false;
    if (universe && item.universe !== universe) return false;
    return !needle || normalize([item.title, item.code, item.summary, item.universe, item.universeKr, ...(item.tags || [])].join(" ")).includes(needle);
  });
}
