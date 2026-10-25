import { getLabTopic } from "./catalog.mjs";
import { ACTIVITIES } from "./activities.mjs";
import { COURSE_STEPS } from "./course.mjs";
import { LAB_STEPS } from "./topics.js";

const commonFields = {
  initial: {
    label: "지금은 어떻게 생각하나요?",
    hint: "맞고 틀림을 서두르지 않아도 괜찮아요. 나의 생각을 한 문장으로 남겨요.",
  },
  initialReason: {
    label: "왜 그렇게 생각하나요?",
    hint: "내 경험이나 알고 있는 사실을 떠올려보세요.",
  },
  prediction: { label: "시험하기 전, 무엇이 달라질까요?", hint: "" },
  interpretation: {
    label: "비교한 기록은 무엇을 보여주나요?",
    hint: "선택한 근거의 차이를 구체적으로 설명해보세요.",
  },
  uncertainty: {
    label: "아직 모르는 점과 더 확인할 것은?",
    hint: "이 자료가 설명하지 못한 조건이나 다른 해석도 생각해보세요.",
  },
  creation: { label: "", hint: "" },
  creationReason: {
    label: "왜 이렇게 만들거나 제안했나요?",
    hint: "관찰한 근거와 새롭게 상상한 부분을 나누어 설명해보세요.",
  },
  final: { label: "지금 이 질문에 어떻게 답하겠어요?", hint: "" },
  finalReason: {
    label: "처음 생각과 무엇이 같거나 달라졌나요? 왜 그런가요?",
    hint: "관찰한 근거를 연결해 설명해보세요.",
  },
  nextQuestion: {
    label: "다음에 더 탐구하고 싶은 질문은?",
    hint: "누가 빠졌을까? 조건을 더 바꾸면? 다른 상황에서도 같을까?",
  },
};
export const LAB_FIELD_STAGES = {
  initial: 0,
  initialReason: 0,
  prediction: 2,
  interpretation: 2,
  uncertainty: 2,
  priorityReason: 2,
  priority: 2,
  evidence: 2,
  adaptation: 3,
  creation: 3,
  creationReason: 3,
  adaptationReason: 3,
  final: 4,
  finalReason: 4,
  nextQuestion: 4,
};
const scienceConcepts = [
  {
    title: "액체 물",
    body: "지구 생명의 몸속에서는 물이 여러 반응을 도와요. 수증기나 얼음을 보았다고 액체 물까지 확인한 것은 아니에요.",
  },
  {
    title: "이용할 수 있는 에너지",
    body: "빛뿐 아니라 화학 반응도 에너지원이 될 수 있어요. 지구의 깊은 바다에는 햇빛 없이 살아가는 생태계도 있어요.",
  },
  {
    title: "필요한 물질과 환경",
    body: "탄소 등 몸을 만들 물질과 적절한 주변 조건을 함께 봐요. 온도 하나만으로 행성 전체를 판단하기는 어려워요.",
  },
];
export function defaultLabContent(id) {
  const topic = getLabTopic(id);
  if (!topic) throw new Error("LAB 주제를 찾을 수 없어요.");
  if (id === "science-001")
    return {
      question: topic.title,
      intro: "6개 탐사 토큰. 3개의 후보 행성. 어떤 단서부터 찾을까요?",
      steps: LAB_STEPS.map((step, index) => ({
        ...step,
        guide: [
          "답을 서두르지 않아도 괜찮아요. 지금 떠오르는 생각에서 시작해요.",
          "지구에서 알려진 생명을 기준으로, 과학자는 액체 물, 이용할 수 있는 에너지, 필요한 물질을 살펴봐요. 그러나 이런 조건이 있다고 생명이 발견된 것은 아니에요.",
          "가상 탐사선으로 조사할 행성과 항목을 골라보세요. 토큰을 전부 쓸 필요는 없어요. 단서를 2개 이상 조사하고, 다음 탐사 우선순위를 정해요.",
          "선택한 행성에 생명이 산다면 어떤 모습일까요? 지구 생명에서 배운 것을 바탕으로 상상해보세요. 사람처럼 생길 필요는 없어요.",
          "처음 생각과 지금 생각을 비교해요. 관찰한 단서가 나의 판단에 어떤 도움을 주었나요?",
        ][index],
        partner: [
          "그 생각을 더 믿게 하거나 바꾸게 할 단서는 무엇일까요?",
          "",
          "얼음 아래도 살펴볼까요? 한 가지 신호를 다른 관찰과 비교해보세요. 남은 토큰으로 무엇을 더 확인할 수 있을까요?",
          "그림이나 더 많은 특징은 워크북에 자유롭게 남겨보세요. 무엇을 관찰했고 무엇을 상상했는지 나누어 설명하면 좋아요.",
          "처음 생각을 바꾸어도, 유지해도 괜찮아요. 중요한 것은 어떤 단서를 살펴보았고 어떤 이유를 설명할 수 있는지예요.",
        ][index],
      })),
      fields: {
        initial: { label: "지금은 어떻게 생각하나요?", hint: "" },
        initialReason: {
          label: "왜 그렇게 생각하나요?",
          hint: "알고 있는 사실, 경험, 궁금한 점 중 하나를 떠올려보세요.",
        },
        priority: { label: "다음에 더 탐사할 곳은?", hint: "" },
        evidence: {
          label: "내 판단을 뒷받침하는 관찰을 골라주세요.",
          hint: "",
        },
        adaptation: {
          label: "환경과 연결할 몸의 특징을 골라보세요.",
          hint: "",
        },
        priorityReason: {
          label: "이 행성을 더 탐사하려는 이유는?",
          hint: "고른 관찰을 이유와 연결해보세요. 선택한 행성을 조사한 단서가 하나 이상 필요해요.",
        },
        uncertainty: {
          label: "아직 모르거나 더 확인해야 하는 것은?",
          hint: "같은 단서를 설명하는 다른 가능성도 생각해보세요.",
        },
        adaptationReason: {
          label: "왜 이런 특징이 필요할까요?",
          hint: "‘이 행성은 ___한 환경이라서, ___한 특징이 도움이 될 것 같아요.’처럼 연결해보세요. 불확실한 환경이라면 ‘만약’이라는 조건을 붙여도 좋아요.",
        },
        final: {
          label: "다시 질문해요. 우주에 우리만 살고 있을까요?",
          hint: "",
        },
        finalReason: {
          label: "지금은 왜 그렇게 생각하나요?",
          hint: "관찰한 단서와 아직 모르는 점을 함께 써보세요. 생각이 그대로여도 이유가 더 깊어질 수 있어요.",
        },
        nextQuestion: {
          label: "다음에 탐구하고 싶은 질문은?",
          hint: "예: 같은 신호가 계속 나와도 생명이라고 말하려면 무엇을 더 확인해야 할까?",
        },
      },
      scene: "",
      concepts: structuredClone(scienceConcepts),
      reading:
        "산소나 메탄을 찾았다면? 지구에서는 생명이 이런 물질을 만들기도 해요. 하지만 빛이나 암석의 반응도 비슷한 흔적을 만들 수 있어요. 과학자는 같은 자료를 설명하는 다른 방법과 장비 오류를 함께 확인해요.",
      check: {
        question: "행성에서 물의 단서를 찾았어요. 무엇을 말할 수 있을까요?",
        options: [
          { id: "proof", label: "생명이 있다는 것이 확실해요" },
          { id: "clue", label: "생명이 살 조건을 더 조사할 이유가 생겼어요" },
        ],
        feedback:
          "맞아요. 조건을 찾는 일과 생명의 존재를 확인하는 일은 구분해야 해요.",
        wrongFeedback:
          "물은 중요한 단서예요. 하지만 생명 없이도 물이 있는 곳이 있어요. 다른 설명을 다시 생각해보세요.",
      },
    };
  const activity = ACTIVITIES[id];
  return {
    question: topic.title,
    intro: topic.activity,
    steps: COURSE_STEPS.map((step, index) => ({
      ...step,
      guide:
        index === 2
          ? "예측을 남기고 서로 다른 조건을 2개 이상 시험해보세요. 비교 기록을 읽고 내 설명에 사용할 근거를 골라요."
          : "",
      partner:
        index === 0
          ? "무엇을 확인하면 내 생각을 더 믿거나 바꿀 수 있을까요?"
          : index === 4
            ? "생각이 달라졌거나 그대로여도 괜찮아요. 어떤 근거가 내 판단을 도왔나요?"
            : "",
    })),
    fields: {
      ...structuredClone(commonFields),
      prediction: { ...commonFields.prediction, hint: activity.predictionHint },
      creation: { label: activity.creationTitle, hint: activity.creationHint },
      final: { ...commonFields.final, hint: topic.title },
    },
    scene: activity.scene,
    concepts: structuredClone(activity.concepts),
    reading: activity.reading,
    check: {
      question: activity.check.question,
      options: structuredClone(activity.check.options),
      feedback: activity.check.feedback,
      wrongFeedback: "자료를 다시 살펴봐요. " + activity.check.feedback,
    },
  };
}
function clean(value, max, name, required = false) {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new Error(name + " 입력 형식과 길이를 확인해주세요.");
  return value.trim();
}
export function validateLabContent(input, id) {
  const base = defaultLabContent(id);
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("LAB 편집 내용을 확인해주세요.");
  if (!Array.isArray(input.steps) || input.steps.length !== 5)
    throw new Error("5단계 안내가 필요해요.");
  if (
    !input.fields ||
    !Array.isArray(input.concepts) ||
    input.concepts.length !== base.concepts.length ||
    !input.check ||
    !Array.isArray(input.check.options) ||
    input.check.options.length !== base.check.options.length
  )
    throw new Error("발문과 개념 문항의 구성을 확인해주세요.");
  const content = {
    question: clean(input.question, 200, "핵심 질문", true),
    intro: clean(input.intro, 1000, "주제 소개", true),
    steps: base.steps.map((s, i) => ({
      label: s.label,
      title: clean(input.steps[i]?.title, 200, "단계 제목", true),
      hint: clean(input.steps[i]?.hint, 500, "단계 요약"),
      guide: clean(input.steps[i]?.guide, 4000, "단계 안내"),
      partner: clean(input.steps[i]?.partner, 2000, "생각을 돕는 질문"),
    })),
    fields: Object.fromEntries(
      Object.keys(base.fields).map((key) => [
        key,
        {
          label: clean(input.fields[key]?.label, 500, "발문", true),
          hint: clean(input.fields[key]?.hint, 2000, "답변 도움말"),
        },
      ]),
    ),
    scene: clean(input.scene, 4000, "탐구 상황"),
    concepts: base.concepts.map((_, i) => ({
      title: clean(input.concepts[i]?.title, 200, "개념 제목", true),
      body: clean(input.concepts[i]?.body, 4000, "개념 설명", true),
    })),
    reading: clean(input.reading, 12000, "읽기 자료", true),
    check: {
      question: clean(input.check.question, 2000, "개념 확인 질문", true),
      options: base.check.options.map((option, i) => {
        if (input.check.options[i]?.id !== option.id)
          throw new Error("선택지의 연결 정보를 바꿀 수 없어요.");
        return {
          id: option.id,
          label: clean(input.check.options[i].label, 2000, "선택지", true),
        };
      }),
      feedback: clean(input.check.feedback, 2000, "정답 피드백", true),
      wrongFeedback: clean(
        input.check.wrongFeedback,
        2000,
        "다시 생각하기 피드백",
        true,
      ),
    },
  };
  if (JSON.stringify(content).length > 100000)
    throw new Error("편집 내용이 너무 길어요.");
  return content;
}
export function applyLabContent(topic, activity, content) {
  return {
    topic: { ...topic, title: content.question, activity: content.intro },
    activity: activity
      ? {
          ...activity,
          scene: content.scene,
          concepts: content.concepts,
          reading: content.reading,
          check: { ...activity.check, ...content.check },
          predictionHint: content.fields.prediction.hint,
          creationTitle: content.fields.creation.label,
          creationHint: content.fields.creation.hint,
        }
      : null,
  };
}
