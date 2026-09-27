import { EMOTIONS, emotionColor } from "../constants/emotions.js";

export default function EmotionBadge({ emotion }) {
  const label = EMOTIONS[emotion]?.label ?? emotion;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.82rem",
        color: "var(--ink-muted)"
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: emotionColor(emotion)
        }}
      />
      {label}
    </span>
  );
}
