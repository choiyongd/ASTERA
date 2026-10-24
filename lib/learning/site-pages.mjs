export function validateSitePage(input, publish = false) {
  const clean = (value, max) => {
    if (typeof value !== "string" || value.length > max)
      throw new Error("페이지 입력 길이와 형식을 확인해주세요.");
    return value.trim();
  };
  if (!input || typeof input !== "object")
    throw new Error("페이지 형식을 확인해주세요.");
  const result = {
    title: clean(input.title, 150),
    slug: clean(input.slug, 80),
    summary: clean(input.summary, 500),
    sections: [],
  };
  if (!result.title) throw new Error("페이지 제목을 입력해주세요.");
  if (result.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result.slug))
    throw new Error("페이지 주소는 영문 소문자·숫자·하이픈으로 입력해주세요.");
  if (
    !Array.isArray(input.sections) ||
    input.sections.length < 1 ||
    input.sections.length > 15
  )
    throw new Error("본문 섹션은 1~15개로 작성해주세요.");
  result.sections = input.sections.map((section) => ({
    heading: clean(section.heading, 150),
    body: clean(section.body, 10000),
  }));
  if (
    publish &&
    (!result.slug ||
      !result.summary ||
      result.sections.some((section) => !section.heading || !section.body))
  )
    throw new Error("주소·소개와 모든 섹션의 제목·본문을 입력해주세요.");
  return result;
}
