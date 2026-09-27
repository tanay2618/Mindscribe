# MindScribe — Enterprise Emotion Analytics Platform

MindScribe is a web application that takes free-text journal entries and returns a detailed emotional analysis report—predicting dominant emotion, confidence scores, writing tone, key emotional keywords, and contextual themes. 

It combines a **TF-IDF + Logistic Regression** machine learning model trained on a curated 5,000-row emotion corpus with an explicit **8-Stage Natural Language Processing (NLP) Pipeline** for technical review.

---

## Key Features

- **Multi-Class Emotion Detection**: Classifies text into 7 target emotional states (`joy`, `sadness`, `anger`, `fear`, `surprise`, `anxious`, `neutral`).
- **Tone & Theme Extraction**: Identifies stylistic writing tone and contextual life themes (e.g., *Workplace Dynamics*, *Social & Interpersonal Relations*).
- **8-Stage NLP Pipeline Inspection**: Exposes intermediate transformations at each step of processing for technical review and model explainability.
- **Enterprise UI**: Built with a clean corporate visual hierarchy using a Trust Blue (`#2563EB`) design system.

---

## 8-Stage NLP Processing Pipeline

Every piece of text submitted to MindScribe passes through eight distinct NLP transformation stages:

1. **Tokenization**: Splits raw text into individual word and punctuation tokens (`nltk.word_tokenize`).
2. **Stopword Removal**: Filters out non-informative, high-frequency English stopwords (`nltk.corpus.stopwords`).
3. **Lemmatization**: Reduces tokens to dictionary root forms using WordNet (`nltk.stem.WordNetLemmatizer`).
4. **POS Tagging**: Assigns Part-of-Speech tags (e.g., Noun, Verb, Adjective) (`nltk.pos_tag`).
5. **Named Entity Recognition (NER)**: Locates and categorizes proper entities (People, Organizations, Locations) (`nltk.ne_chunk`).
6. **N-Gram Extraction**: Captures 2-word (bigrams) and 3-word (trigrams) phrase sequences for contextual expressions.
7. **Corpus Cosine Similarity**: Computes TF-IDF vector similarity against the 5,000-row dataset to find closest matches.
8. **Word Sense Disambiguation (WSD)**: Resolves word sense ambiguity based on sentence context using the Lesk algorithm (`nltk.wsd.lesk`).

---

## Tech Stack

### Backend
- **Framework**: FastAPI (Uvicorn server)
- **ML / Vectorization**: Scikit-Learn (TF-IDF Vectorizer + Multi-Class Logistic Regression)
- **NLP Libraries**: NLTK (Punkt, WordNet, POS Tagger, NE Chunker, Lesk)
- **Data Processing**: Pandas, NumPy

### Frontend
- **Framework**: React (Vite)
- **Styling**: Modern pure CSS (CSS Variables, Flexbox/Grid)

---

## Project Structure

```text
mindscribe/
├── backend/
│   ├── app.py                     # FastAPI REST server & endpoint definitions
│   ├── nlp_pipeline.py            # 8-stage NLP pipeline & inference logic
│   ├── mindscribe_model.pkl       # Trained Logistic Regression model artifact
│   ├── mindscribe_vectorizer.pkl  # Fitted TF-IDF Vectorizer artifact
│   ├── mindscribe_curated_5k.csv  # 5,000-row curated training dataset
│   └── requirements.txt           # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── main.jsx               # React entry point & App Shell
    │   ├── App.jsx                # Main interface & inline NLP Inspector
    │   └── index.css              # Global enterprise design system styles
    ├── package.json               # Frontend dependencies & scripts
    └── vite.config.js             # Vite build configuration
Getting Started
Prerequisites
Python: 3.9+ installed
Node.js: 18+ and npm installed
Setup Instructions
1. Clone the Repository
Bash

git clone https://github.com/your-username/mindscribe.git
cd mindscribe
2. Backend Setup (FastAPI)
Bash

cd backend

# Create & activate a virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app:app --reload --port 8000
The backend server will run at http://localhost:8000.

3. Frontend Setup (React / Vite)
Open a new terminal window:

Bash

cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
The frontend application will be accessible at http://localhost:5173.

API Reference
POST /analyze
Analyzes input free-text for emotion predictions and pipeline execution.

Request Body:

JSON

{
  "text": "My boss shouted at me today even though I completed all my tasks on time."
}
Response Body:

JSON

{
  "emotion": "anger",
  "confidence": 0.82,
  "probabilities": {
    "anger": 0.82,
    "anxious": 0.05,
    "fear": 0.03,
    "joy": 0.01,
    "neutral": 0.02,
    "sadness": 0.06,
    "surprise": 0.01
  },
  "keywords": ["shouted", "tasks"],
  "themes": ["Workplace & Career Dynamics", "Frustration & Unfair Treatment"],
  "tone": "Frustrated & Critical",
  "pipeline": {
    "tokens": ["My", "boss", "shouted", "..."],
    "filtered": ["boss", "shouted", "today", "..."],
    "lemmatized": ["boss", "shout", "today", "..."],
    "pos_tags": [["boss", "NN"], ["shouted", "VBD"]],
    "ner": ["No distinct named entities detected."],
    "ngrams": ["My boss", "boss shouted", "shouted at"],
    "similarity": [...],
    "wsd": {...}
  }
}
GET /health
Returns API health status.
