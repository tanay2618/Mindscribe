// Mirrors the 7 emotion classes the backend classifier was trained on
// (see mindscribe_curated_5k.csv / MindScribePipeline.tone_map).
export const EMOTIONS = {
  joy: { label: "Joy", color: "var(--emotion-joy)" },
  sadness: { label: "Sadness", color: "var(--emotion-sadness)" },
  fear: { label: "Fear", color: "var(--emotion-fear)" },
  anger: { label: "Anger", color: "var(--emotion-anger)" },
  surprise: { label: "Surprise", color: "var(--emotion-surprise)" },
  anxious: { label: "Anxious", color: "var(--emotion-anxious)" },
  neutral: { label: "Neutral", color: "var(--emotion-neutral)" }
};

export function emotionColor(key) {
  return EMOTIONS[key]?.color ?? "var(--emotion-neutral)";
}
