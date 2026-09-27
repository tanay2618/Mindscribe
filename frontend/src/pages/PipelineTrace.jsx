import { Link } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext.jsx";

function ChipList({ items, muted = false }) {
  if (!items || items.length === 0) {
    return <p className="muted-line">None found.</p>;
  }
  return (
    <ul className="chip-list">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className={`chip${muted ? " chip--muted" : ""}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PipelineTrace() {
  const { result, entryText } = useAnalysis();

  if (!result) {
    return (
      <section className="container empty-state">
        <h1 style={{ fontSize: "1.6rem" }}>No trace to show yet</h1>
        <p className="empty-state__body">
          The pipeline trace is generated the moment you analyze an entry.
        </p>
        <Link to="/journal" className="btn btn--primary">
          Go to journal
        </Link>
      </section>
    );
  }

  const p = result.pipeline;
  const s1 = p.stage_1_tokenization;
  const s2 = p.stage_2_stopword_removal;
  const s3 = p.stage_3_lemmatization;
  const s4 = p.stage_4_pos_tagging;
  const s5 = p.stage_5_ner;
  const s6 = p.stage_6_ngrams;
  const s7 = p.stage_7_corpus_similarity;
  const s8 = p.stage_8_wsd;

  return (
    <section className="trace">
      <div className="container container--wide">
        <p className="hero__eyebrow">Explainability</p>
        <h1 style={{ fontSize: "1.8rem" }}>Pipeline trace</h1>
        <p className="trace__intro">
          Every intermediate step the engine took to reach its reading of{" "}
          {entryText ? <em>"{entryText.length > 60 ? `${entryText.slice(0, 60)}…` : entryText}"</em> : "this entry"}.
        </p>

        {/* Stage 1 */}
        <div className="trace__stage">
          <span className="trace__index">01</span>
          <div>
            <h2 className="trace__stage-title">Tokenization</h2>
            <p className="trace__stage-desc">
              {s1.token_count} tokens across {s1.sentences.length}{" "}
              {s1.sentences.length === 1 ? "sentence" : "sentences"}.
            </p>
            <div className="trace__grid">
              <div>
                <p className="trace__field-label">Sentences</p>
                {s1.sentences.map((sentence, i) => (
                  <p key={i} className="muted-line" style={{ marginBottom: "6px" }}>
                    {sentence}
                  </p>
                ))}
              </div>
              <div>
                <p className="trace__field-label">Tokens</p>
                <ChipList items={s1.tokens} />
              </div>
            </div>
          </div>
        </div>

        {/* Stage 2 */}
        <div className="trace__stage">
          <span className="trace__index">02</span>
          <div>
            <h2 className="trace__stage-title">Stopword removal</h2>
            <p className="trace__stage-desc">
              {s2.content_word_count} content words kept, {s2.removed_stopwords.length} stopwords
              dropped.
            </p>
            <div className="trace__grid">
              <div>
                <p className="trace__field-label">Preserved content words</p>
                <ChipList items={s2.preserved_content_words} />
              </div>
              <div>
                <p className="trace__field-label">Removed stopwords</p>
                <ChipList items={s2.removed_stopwords} muted />
              </div>
            </div>
          </div>
        </div>

        {/* Stage 3 */}
        <div className="trace__stage">
          <span className="trace__index">03</span>
          <div>
            <h2 className="trace__stage-title">Lemmatization</h2>
            <p className="trace__stage-desc">Each token reduced to its dictionary root form.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Original</th>
                  <th>Lemma</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {s3.map((row, i) => (
                  <tr key={i}>
                    <td>{row.original}</td>
                    <td>{row.lemma}</td>
                    <td>{row.pos_category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stage 4 */}
        <div className="trace__stage">
          <span className="trace__index">04</span>
          <div>
            <h2 className="trace__stage-title">Part-of-speech tagging</h2>
            <p className="trace__stage-desc">Grammatical role assigned to every token.</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Tag</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {s4.map((row, i) => (
                  <tr key={i}>
                    <td>{row.token}</td>
                    <td>{row.pos_code}</td>
                    <td>{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stage 5 */}
        <div className="trace__stage">
          <span className="trace__index">05</span>
          <div>
            <h2 className="trace__stage-title">Named-entity recognition</h2>
            <p className="trace__stage-desc">People, places, and organizations detected in the entry.</p>
            {s5.length === 0 ? (
              <p className="muted-line">No named entities detected in this entry.</p>
            ) : (
              <ul className="chip-list">
                {s5.map((ent, i) => (
                  <li key={i} className="chip">
                    {ent.entity} · {ent.type}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Stage 6 */}
        <div className="trace__stage">
          <span className="trace__index">06</span>
          <div>
            <h2 className="trace__stage-title">N-gram extraction</h2>
            <p className="trace__stage-desc">Recurring word pairs and triples from the content words.</p>
            <div className="trace__grid">
              <div>
                <p className="trace__field-label">Bigrams</p>
                <ChipList items={s6.bigrams} />
              </div>
              <div>
                <p className="trace__field-label">Trigrams</p>
                <ChipList items={s6.trigrams} />
              </div>
            </div>
          </div>
        </div>

        {/* Stage 7 */}
        <div className="trace__stage">
          <span className="trace__index">07</span>
          <div>
            <h2 className="trace__stage-title">Corpus similarity</h2>
            <p className="trace__stage-desc">
              The closest entries from the 5,000-row training corpus, by cosine similarity.
            </p>
            {s7.map((match, i) => (
              <div key={i} className="match-card">
                <span className="match-card__score">
                  similarity {match.similarity_score.toFixed(4)} · labeled {match.corpus_emotion}
                </span>
                <p className="match-card__text">"{match.corpus_text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stage 8 */}
        <div className="trace__stage">
          <span className="trace__index">08</span>
          <div>
            <h2 className="trace__stage-title">Word-sense disambiguation</h2>
            <p className="trace__stage-desc">
              Which specific meaning of an ambiguous word applies, given the surrounding context.
            </p>
            {s8.length === 0 ? (
              <p className="muted-line">No ambiguous words needed disambiguation in this entry.</p>
            ) : (
              s8.map((row, i) => (
                <div key={i} className="match-card">
                  <span className="match-card__score">
                    "{row.target_word}" → {row.selected_synset}
                  </span>
                  <p className="match-card__text" style={{ fontStyle: "normal" }}>
                    {row.contextual_definition}
                  </p>
                  {row.example_usage && row.example_usage !== "N/A" && (
                    <p className="muted-line">e.g. "{row.example_usage}"</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="results__actions">
          <Link to="/results" className="btn btn--ghost">
            Back to results
          </Link>
          <Link to="/journal" className="btn btn--ghost">
            Write another entry
          </Link>
        </div>
      </div>
    </section>
  );
}
