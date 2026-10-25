import { newDraft, STAGES } from "../learning/domain.mjs";
export function lessonDraftFromLab(topic, content) {
  let shortened = false;
  const fit = (text, max) => {
    if (text.length <= max) return text;
    shortened = true;
    return text.slice(0, max - 1) + "…";
  };
  const prompts = [
    content.fields.initial.label,
    content.check.question,
    content.fields.interpretation?.label || content.fields.priorityReason.label,
    content.fields.creation?.label || content.fields.adaptationReason.label,
    content.fields.finalReason.label + " " + content.fields.nextQuestion.label,
  ];
  const bodies = [
    content.scene || content.intro,
    content.concepts.map((c) => c.title + "\n" + c.body).join("\n\n") +
      "\n\n" +
      content.reading,
    content.steps[2].guide || topic.activity,
    content.fields.creation?.hint || content.steps[3].guide,
    content.steps[4].guide || content.steps[4].partner,
  ];
  const draft = {
    ...newDraft(),
    title: fit(content.question, 150),
    slug: topic.slug,
    summary: fit(content.intro, 500),
    universe: topic.universe,
    ageGroup: topic.ageGroup || "10–12세",
    goals: topic.goals,
    stages: STAGES.map((stage, index) => ({
      ...stage,
      body: fit(bodies[index], 6000),
      prompt: fit(prompts[index], 500),
    })),
  };
  return { draft, shortened };
}
