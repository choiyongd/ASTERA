const ANSWER_DIVIDER = "\n\n더 생각한 답\n";

export function splitPrompt(text = "") {
  const match = text.match(/\n\n중학생 더 생각하기(?:\(선택\))?\s*\n/);
  if (!match) return { main: text, extra: "" };
  return {
    main: text.slice(0, match.index).replace(/^기본 질문\s*\n/, "").trim(),
    extra: text.slice(match.index + match[0].length).trim(),
  };
}

export function splitReading(text = "") {
  const index = text.indexOf("\n\n더 읽기 · A");
  if (index < 0) return { main: text, extra: "" };
  return {
    main: text.slice(0, index).replace(/\n\n(?:이어서 )?더 읽[\s\S]*$/, "").trim(),
    extra: text.slice(index + 2),
  };
}

export function splitAnswer(text = "") {
  if (text.startsWith("더 생각한 답\n")) return { main: "", extra: text.slice("더 생각한 답\n".length) };
  const index = text.indexOf(ANSWER_DIVIDER);
  return index < 0
    ? { main: text, extra: "" }
    : { main: text.slice(0, index), extra: text.slice(index + ANSWER_DIVIDER.length) };
}

export function joinAnswer(main, extra) {
  return extra ? `${main}${ANSWER_DIVIDER}${extra}` : main;
}
