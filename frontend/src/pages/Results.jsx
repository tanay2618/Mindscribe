import { Link } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext.jsx";
import { EMOTIONS, emotionColor } from "../constants/emotions.js";

export default function Results() {
  const { result, entryText } = useAnalysis();

  if (!result) {
    return (
      <section className="container empty-state">
        <h1 style={{ fontSize: "1.6rem" }}>No entry to reflect on yet</h1>
        <p className="empty-state__body">
          Write a journal entry first and MindScribe will return a reading here.
        </p>
        <Link to="/journal" className="btn btn--primary">
          Go to journal
        </Link>
      </section>
    );
  }

  const { report } = result;
  const emotionLabel = EMOTIONS[report.dominant_emotion]?.label ?? report.dominant_emotion;

  return (
    <section className="results">
      <div className="container">
        <p className="hero__eyebrow">Your reading</p>

        <div className="results__emotion">
          <span
            className="results__emotion-swatch"
            style={{ background: emotionColor(report.dominant_emotion) }}
          />
          <h1 className="results__emotion-label">{emotionLabel}</h1>
        </div>
        <p className="results__tone">{report.writing_tone}</p>

        {entryText && (
          <div className="results__section">
            <p className="results__section-label">What you wrote</p>
            <p className="entry-quote">"{entryText}"</p>
          </div>
        )}

        <div className="results__section">
          <p className="results__section-label">Emotional words that stood out</p>
          <ul className="tag-list">
            {report.key_emotional_words.length > 0 ? (
              report.key_emotional_words.map((word) => (
                <li key={word} className="tag">
                  {word}
                </li>
              ))
            ) : (
              <li className="muted-line">Nothing distinct enough to flag.</li>
            )}
          </ul>
        </div>

        <div className="results__section">
          <p className="results__section-label">Themes this entry touches on</p>
          <ul className="tag-list">
            {report.possible_themes.map((theme) => (
              <li key={theme} className="tag">
                {theme}
              </li>
            ))}
          </ul>
        </div>

        <div className="results__actions">
          <Link to="/pipeline" className="btn btn--ghost">
            See the full pipeline trace
          </Link>
          <Link to="/journal" className="btn btn--ghost">
            Write another entry
          </Link>
        </div>
      </div>
    </section>
  );
}
