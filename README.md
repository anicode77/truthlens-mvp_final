# TruthLens

## Problem Statement

People make decisions every day influenced by emotional manipulation they can't see in the moment. Urgency framing, fear appeals, and emotionally charged language bypass rational thinking—causing bad decisions, wasted money, and manipulated opinions. TruthLens reveals these hidden influence patterns in real-time, empowering users to decide with clarity rather than emotion.

---

## Users & Context

### Target Users
- **Students and young adults** consuming news and social media daily, forming opinions on current events
- **Professionals and decision-makers** (VCs, executives, managers) evaluating proposals, pitch decks, and strategic communications
- **Educators and media literacy advocates** teaching critical thinking skills
- **Anyone** who reads persuasive content and wants to maintain independent thinking

### User Context
**Current pain points:**
- Unable to recognize emotional manipulation while reading in real-time
- Make rushed decisions due to urgency framing ("limited time," "act now")
- Form opinions based on emotionally charged articles without noticing the framing
- Lack tools to identify specific persuasive techniques in the moment
- Information overload leads to passive, uncritical consumption

**What they do now:**
- Rely on fact-checkers (which verify truth but not framing)
- Use bias detection tools (which label sources but don't explain *how* language influences)
- Manually try to spot manipulation (inconsistent, cognitively exhausting)

**Why existing solutions fall short:**
- Fact-checking addresses *what* is said, not *how* it's said
- Bias scores label entire sources without granular phrase-level analysis
- No real-time awareness during the reading experience

---

## Solution Overview

**TruthLens is a mental firewall for persuasive content.** We highlight emotional manipulation techniques as you read—not to tell you what to think, but to show you when someone's trying to think for you.

### How It Works

```
User pastes text
    ↓
Rule-based pattern detection (transparent, deterministic)
    ↓
Highlighted phrases + technique classification
    ↓
Optional LLM explanation layer (descriptive only)
    ↓
User sees manipulation in real-time
```



## Setup & Run

### Prerequisites
- **Node.js** 18+ or **Python** 3.10+
- **Git** for cloning the repository

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/[your-username]/truthlens.git
cd truthlens
```

**2. Backend Setup**
```bash
cd backend
pip install -r requirements.txt



**3. Frontend Setup**
```bash
cd ../frontend
npm install
```

### Running the Application

**Start the backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Start the frontend (in a new terminal):**
```bash
cd frontend
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs (Swagger UI)

### Environment Variables (optional)

# Required
OPENAI_API_KEY=sk-proj-...

# Optional
ENABLE_LLM_EXPLANATIONS=true  # Set to false to use rules-only mode
PORT=8000
LOG_LEVEL=INFO

### Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

---

## Models & Data

### AI Models Used (is optional)
# TruthLens works locally even without LLM

Primary: GPT-4 Turbo (via OpenAI API)

Model ID: gpt-4-turbo-preview or gpt-4o
Role: Optional explanation layer only (NOT used for detection)
Why chosen:

Superior language understanding for nuanced framing analysis
Strong reasoning capabilities for explaining influence patterns
Generates natural, human-readable explanations
Widely available and well-documented API
Cost-effective for MVP phase

**Important:** The LLM does NOT perform detection. All pattern matching is rule-based and transparent.

### Data Sources & Provenance

**User-Provided Content:**
- Users paste their own text for analysis
- No data collection or storage (stateless processing)
- Content is analyzed in-memory and discarded after response

**Detection Rules:**
- Curated linguistic patterns based on:
  - Cialdini's principles of persuasion
  - Kahneman & Tversky's framing research
  - Media literacy best practices
  - Common rhetorical techniques
- Rules are open-source and inspectable in `analyzer.py`

**No Training Data:**
- We do not train custom models
- We do not collect user data for model improvement
- All analysis happens via API calls to Claude

### Licenses & Compliance

- **Anthropic API:** Used under Anthropic's Terms of Service
- **User Content:** Processed ephemerally, not stored or retained
- **Detection Rules:** Open-source (MIT License)
- **Frontend/Backend Code:** MIT License
- **Dependencies:** See `requirements.txt` and `package.json` for third-party licenses

### Privacy Commitment

✅ OpenAI API: Used under OpenAI's Terms of Service and Usage Policies
✅User Content: Processed ephemerally, not stored or retained
✅Detection Rules: Open-source (MIT License)
✅Frontend/Backend Code: MIT License
✅Dependencies: See requirements.txt and package.json for third-party licenses

---

## Evaluation & Guardrails

### Hallucination Mitigation

**Problem:** LLMs can fabricate or mischaracterize content.

**Our approach:**

1. **LLM never performs detection**
   - Only rule-based analyzer flags phrases
   - LLM only describes what rules already found
   - No hallucinated highlights or techniques

2. **Grounded explanations**
   - LLM explanations reference specific text spans
   - System prompt requires citing actual detected patterns
   - No speculative claims about content outside the analysis

3. **Rules-only fallback**
   - System works fully without LLM (`ENABLE_LLM_EXPLANATIONS=false`)
   - If API fails, rules still provide highlights + technique labels
   - Core functionality never depends on LLM

4. **Human verification**
   - Sample outputs manually reviewed for accuracy
   - Community feedback loop (roadmap) to improve rules
   - Transparent rule updates based on false positive reports

### Bias Mitigation

**Problem:** Bias detection tools often impose ideological judgments.

**Our approach:**

1. **Politically neutral prompting**
   - System prompt explicitly instructs against ideological bias
   - Focus on linguistic techniques, not content positions
   - No left/right labeling of sources or arguments

2. **Technique-focused, not content-focused**
   - We detect HOW information is framed (urgency, emotion)
   - We do NOT evaluate WHAT is being said (truth, ideology)
   - Same techniques flagged regardless of political stance

3. **Balanced testing**
   - Evaluation dataset includes content from diverse perspectives
   - Testing across political spectrum, commercial content, educational material
   - Ensure equal sensitivity to manipulation across viewpoints

4. **User agency**
   - We inform, never judge
   - Users decide how to respond to highlighted patterns
   - No censorship or content filtering based on ideology

### Guardrails & Safety Controls

**Input Validation:**
- Text length capped at 10,000 characters (prevents abuse)
- Content filtering rejects hate speech, violence, illegal content
- Rate limiting: 100 requests per hour per IP (prevents system overload)

**Output Validation:**
- Highlights must reference actual text spans in input
- Technique labels must match defined taxonomy
- No fabricated content in explanations

**API Safety:**
- OpenAI API key stored in environment variables (never in code)
- API calls wrapped in try-catch with graceful degradation
- Timeout limits prevent hanging requests
- Optional LLM layer can be disabled without breaking core functionality

**Error Handling:**
- Invalid input → Clear error message
- API failure → Fall back to rules-only mode
- Malformed content → Return empty analysis with warning



## Known Limitations & Risks

### Current Limitations

**1. Context Dependency**
- Some phrases may be flagged incorrectly without broader context
- Example: "Act now to save lives" (emergency) vs. "Act now to save money" (sales)
- Mitigation: Add context-aware rules; user feedback to improve detection

**2. Cultural & Linguistic Nuances**
- Emotional language interpretation varies across cultures
- Currently optimized for English; limited multilingual support
- Mitigation: Expand rules for different cultural contexts; add language detection

**3. Satire & Irony Detection**
- Tool may misidentify intentionally exaggerated content
- Satirical articles could be flagged as manipulative
- Mitigation: Add satire detection heuristics; user option to mark satire


**4. No Browser Extension (MVP)**
- Manual paste required; no automated in-page analysis
- Context-switching disrupts reading flow
- Mitigation: Browser extension on roadmap (Phase 2)

**5. Limited Technique Coverage**
- MVP focuses on 5-7 core techniques
- Doesn't catch every persuasive method
- Mitigation: Expand technique library based on user feedback

### Potential Risks

**1. Over-Reliance on Tool**
- **Risk:** Users delegate critical thinking entirely to TruthLens
- **Impact:** Reduced independent analysis skills
- **Mitigation:** Educational content emphasizing tool as supplement, not replacement; remind users to think critically

**2. False Confidence**
- **Risk:** Users trust flagged content as definitive manipulation
- **Impact:** Incorrect dismissal of legitimate emotional expression
- **Mitigation:** Confidence scores for each detection; clear messaging that tool aids, not replaces judgment

**3. Misuse for Unfair Criticism**
- **Risk:** Tool used to unfairly discredit legitimate emotional arguments
- **Impact:** Stifles authentic expression; weaponized against opponents
- **Mitigation:** Emphasize neutrality; detect techniques across all viewpoints equally

**4. Scalability & Cost**
- **Risk:** API costs may limit free access at scale
- **Impact:** Tool becomes inaccessible to those who need it most
- **Mitigation:** Freemium model; optimize for fewer API calls; seek grants for public access

**5. Adversarial Manipulation**
- **Risk:** Bad actors learn to evade detection by avoiding flagged phrases
- **Impact:** Manipulation becomes harder to detect
- **Mitigation:** Continuous rule updates; community-driven pattern library; machine learning layer (roadmap)



---
##Demo link (hosted app)
aquamarine-dodol-6dc985.netlify.app

## Team

**[YuktiX-Vortex]** - AIBoomi Startup Weekend 2025

- **[Anisha Mishra 1]** - Role: Product Lead, backend | Email: [anisha.mishra2005@gmail.com] | GitHub: [anicode77]
- **[Name 2]** - Role: [Frontend Developer / AI Integration / etc.] | Email: [sohailvanu2023@gmail.com] | GitHub: [sohail2006354]


**Contact:** [info@yuktix.net]

