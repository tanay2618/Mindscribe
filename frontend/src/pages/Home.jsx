import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmotionBadge from "../components/EmotionBadge.jsx";

const SAMPLE_ENTRIES = [
  { text: "Careful, he's a hero, apparently — everyone in the room agreed but me.", emotion: "joy" },
  { text: "I keep replaying the meeting. I don't think I said the right thing.", emotion: "anxious" },
  { text: "The house has been quiet since she left for college.", emotion: "sadness" },
  { text: "Didn't expect the results today. Still sitting with it.", emotion: "surprise" }
];

export default function Home() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SAMPLE_ENTRIES.length);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const sample = SAMPLE_ENTRIES[index];

  return (
    <>
      <section className="hero">
        <div className="container">
          <p className="hero__eyebrow">A journal that reads between the lines</p>
          <h1 className="hero__title">Write freely. Understand what you're feeling.</h1>
          <p className="hero__lede">
            MindScribe takes a plain journal entry and returns a clean, private reflection on
            its emotional tone — with the full 8-stage language pipeline behind that reflection
            available to inspect, not hidden inside a black box.
          </p>
          <div className="hero__actions">
            <Link to="/journal" className="btn btn--primary">
              Start writing
            </Link>
            <a href="#how-it-works" className="btn btn--ghost">
              How it works
            </a>
          </div>

          <div className="hero__excerpt" key={index}>
            <p className="hero__excerpt-text">"{sample.text}"</p>
            <EmotionBadge emotion={sample.emotion} />
          </div>
        </div>
      </section>

      <section className="steps" id="how-it-works">
        <div className="container">
          <h2 style={{ fontSize: "1.5rem" }}>Three steps, one honest reading</h2>
          <ol className="steps__list">
            <li>
              <span className="step__index">01</span>
              <h3 className="step__title">Write</h3>
              <p className="step__body">
                Put down whatever's on your mind. No prompts, no word minimums — the same way
                you'd write in a paper journal.
              </p>
            </li>
            <li>
              <span className="step__index">02</span>
              <h3 className="step__title">Analyze</h3>
              <p className="step__body">
                The entry runs through tokenization, lemmatization, tagging, and a trained
                classifier — entirely on the text you wrote, nothing else.
              </p>
            </li>
            <li>
              <span className="step__index">03</span>
              <h3 className="step__title">Reflect</h3>
              <p className="step__body">
                You get a dominant emotion, a tone, and the themes it picked up on — described
                plainly, with no scores or percentages attached.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="engine-note">
        <div className="container">
          <h2 style={{ fontSize: "1.3rem" }}>Built to be checked, not just trusted</h2>
          <p className="engine-note__body">
            Underneath the reflection is a classical NLP pipeline: tokenization, stopword
            removal, lemmatization, POS tagging, named-entity recognition, n-gram extraction,
            corpus similarity, and word-sense disambiguation. Every stage's intermediate output
            is kept and shown in full after each entry, so the reasoning behind a reading is
            never a black box.
          </p>
        </div>
      </section>
    </>
  );
}
