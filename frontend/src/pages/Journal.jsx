import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext.jsx";

const MIN_LENGTH = 5;

export default function Journal() {
  const [text, setText] = useState("");
  const { status, error, runAnalysis } = useAnalysis();
  const navigate = useNavigate();

  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const isTooShort = trimmed.length > 0 && trimmed.length < MIN_LENGTH;
  const canSubmit = trimmed.length >= MIN_LENGTH && status !== "loading";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await runAnalysis(trimmed);
      navigate("/results");
    } catch {
      // error state is already surfaced via context
    }
  }

  return (
    <section className="journal">
      <div className="container">
        <h1 style={{ fontSize: "1.8rem" }}>Today's entry</h1>
        <p style={{ color: "var(--ink-muted)", marginBottom: "32px" }}>
          Write as much or as little as you need. Nothing is saved until you submit it.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="journal__page">
            <textarea
              className="journal__textarea"
              placeholder="Start writing here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="Journal entry"
            />
            <div className="journal__meta">
              <span className="journal__count">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
              <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
                {status === "loading" ? "Analyzing…" : "Analyze entry"}
              </button>
            </div>
          </div>

          {isTooShort && (
            <p className="muted-line" style={{ marginTop: "12px" }}>
              A few more words will give the engine something to work with.
            </p>
          )}

          {status === "error" && error && <div className="journal__error">{error}</div>}
        </form>
      </div>
    </section>
  );
}
