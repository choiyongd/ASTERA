const text = (value, max) => typeof value === "string" && value.trim() && value.length <= max;
const visuals = ["windmill", "map-equator", "map-pole", "polygon-4", "polygon-6", "polygon-12"];
const http = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
};

export function validateReadingDeck(deck) {
  if (deck === undefined) return undefined;
  const invalid = () => { throw new Error("읽기 카드의 내용과 출처를 확인해주세요."); };
  if (!deck || deck.version !== 1 || !text(deck.source, 260) ||
      !Array.isArray(deck.references) || deck.references.length > 15 ||
      !Array.isArray(deck.cards) || deck.cards.length < 2 || deck.cards.length > 5)
    invalid();

  return {
    version: 1,
    source: deck.source.trim(),
    references: deck.references.map((r) => {
      if (!r || !text(r.title, 240) || typeof r.url !== "string" ||
          r.url.length > 1000 || !http(r.url) ||
          typeof r.license !== "string" || r.license.length > 100)
        invalid();
      return { title: r.title.trim(), url: r.url, license: r.license.trim() };
    }),
    cards: deck.cards.map((c) => {
      if (!c || !["concept", "compare", "sequence", "apply"].includes(c.kind) ||
          !text(c.title, 95) || !text(c.body, 650) ||
          !Array.isArray(c.panels) || c.panels.length > 4)
        invalid();
      if (["compare", "sequence"].includes(c.kind) && c.panels.length < 2) invalid();
      return {
        kind: c.kind, title: c.title.trim(), body: c.body.trim(),
        panels: c.panels.map((p) => {
          if (!p || !text(p.label, 75) || !text(p.text, 420)) invalid();
          if (p.visual !== undefined && !visuals.includes(p.visual)) invalid();
          return { label: p.label.trim(), text: p.text.trim(), ...(p.visual && { visual: p.visual }) };
        }),
      };
    }),
  };
}
