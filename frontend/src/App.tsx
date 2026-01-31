import { useState, useRef, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import './App.css'

// PDF.js worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

const THEME_KEY = 'truthlens-theme'
type Theme = 'dark' | 'light'

interface Highlight {
  text: string
  technique: string
  reason: string
}

interface AnalyzeResponse {
  highlights: Highlight[]
  detected_techniques: string[]
  perception_explanation: string
}

const API_BASE = '/api'

function getTechniqueClass(technique: string): string {
  const t = technique.toLowerCase()
  if (t.includes('urgency')) return 'urgency'
  if (t.includes('emotional')) return 'emotional'
  if (t.includes('absolute')) return 'absolute'
  return ''
}

/** Escape special regex characters in a string */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

interface Segment {
  start: number
  end: number
  technique: string
}

/** Build non-overlapping segments for highlights in text (case-insensitive) */
function buildHighlightSegments(fullText: string, highlights: Highlight[]): Segment[] {
  const raw: Segment[] = []
  for (const h of highlights) {
    const escaped = escapeRegex(h.text)
    const re = new RegExp(escaped, 'gi')
    let match: RegExpExecArray | null
    while ((match = re.exec(fullText)) !== null) {
      raw.push({
        start: match.index,
        end: match.index + match[0].length,
        technique: h.technique,
      })
    }
  }
  if (raw.length === 0) return []
  raw.sort((a, b) => a.start - b.start)
  const merged: Segment[] = [raw[0]]
  for (let i = 1; i < raw.length; i++) {
    const prev = merged[merged.length - 1]
    const curr = raw[i]
    if (curr.start <= prev.end) {
      prev.end = Math.max(prev.end, curr.end)
    } else {
      merged.push(curr)
    }
  }
  return merged
}

/** Render full text as React nodes with highlighted spans */
function renderTextWithHighlights(fullText: string, highlights: Highlight[]) {
  const segments = buildHighlightSegments(fullText, highlights)
  if (segments.length === 0) return fullText
  const nodes: React.ReactNode[] = []
  let lastEnd = 0
  for (const seg of segments) {
    if (seg.start > lastEnd) {
      nodes.push(fullText.slice(lastEnd, seg.start))
    }
    const slice = fullText.slice(seg.start, seg.end)
    nodes.push(
      <mark
        key={`${seg.start}-${seg.end}`}
        className={`highlight-inline ${getTechniqueClass(seg.technique)}`}
        title={seg.technique}
      >
        {slice}
      </mark>
    )
    lastEnd = seg.end
  }
  if (lastEnd < fullText.length) {
    nodes.push(fullText.slice(lastEnd))
  }
  return nodes
}

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const numPages = pdf.numPages
  const parts: string[] = []
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    parts.push(text)
  }
  return parts.join('\n\n').trim()
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    return stored === 'light' || stored === 'dark' ? stored : 'dark'
  })
  const [text, setText] = useState('')
  const [analyzedText, setAnalyzedText] = useState('')
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showWhyMatters, setShowWhyMatters] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const showResults = result !== null

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file?.type === 'application/pdf') {
      setPdfFile(file)
      setText('') // clear paste when PDF selected
    } else if (file) {
      setError('Please choose a PDF file.')
      setPdfFile(null)
    }
    e.target.value = ''
  }

  function clearFile() {
    setPdfFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    let content = text.trim()
    if (pdfFile && !content) {
      setLoading(true)
      try {
        content = await extractTextFromPdf(pdfFile)
        if (!content) {
          setError('No text could be extracted from this PDF.')
          setLoading(false)
          return
        }
        setText(content) // show extracted text
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to read PDF.')
        setLoading(false)
        return
      }
    }

    if (!content) {
      setError('Paste some text or upload a PDF.')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || `Request failed: ${res.status}`)
      }
      const data: AnalyzeResponse = await res.json()
      setAnalyzedText(content)
      setResult(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Analysis failed. Is the backend running on port 8000?'
      )
    } finally {
      setLoading(false)
    }
  }

  function goBack() {
    setResult(null)
    setAnalyzedText('')
    setError(null)
  }

  return (
    <div className="app">
      {/* Soft lens/prism background — clarity through analysis */}
      <div className="lens-effect" aria-hidden />
      {/* Site header: logo + TruthLens top-left, theme toggle top-right */}
      <header className="site-header">
        <a href="/" className="site-brand" aria-label="TruthLens home">
          <img src="/logo.png" alt="" className="site-logo" />
          <div className="site-brand-text">
            <span className="site-name">TruthLens</span>
            <span className="site-tagline">Language has power. See it clearly.</span>
          </div>
        </a>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </header>

      {!showResults ? (
        <>
          <div className="landing">
            <section className="hero">
              <h1 className="hero-title">See how language shapes perception.</h1>
              <p className="hero-intro">Upload or paste text to reveal emotional framing, urgency cues, and absolute language — the patterns that shape how readers think.</p>
            </section>

            <div className="what-we-detect">
              <span className="what-we-detect-label">We detect:</span>
              <div className="what-we-detect-items">
                <span className="detect-pill detect-pill-urgency">Urgency & Time Pressure</span>
                <span className="detect-pill detect-pill-emotional">Emotional Framing</span>
                <span className="detect-pill detect-pill-absolute">Absolute Language</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={`landing-form ${loading ? 'is-analyzing' : ''}`}>
              <div className="input-card">
                <label className="label" htmlFor="text">
                  Paste or type content
                </label>
                <textarea
                  id="text"
                  className="textarea"
                  placeholder="Paste or type content here…"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value)
                    if (pdfFile) clearFile()
                  }}
                  disabled={loading}
                />
                <div className="upload-row">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className={`upload-btn ${pdfFile ? 'has-file' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    {pdfFile ? 'PDF selected' : 'Upload PDF'}
                  </button>
                  {pdfFile && (
                    <span className="upload-filename" title={pdfFile.name}>
                      {pdfFile.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="analyze-row">
                <button
                  type="submit"
                  className="btn-analyze"
                  disabled={loading || (!text.trim() && !pdfFile)}
                >
                  {loading ? 'Analyzing…' : 'Analyze'}
                </button>
              </div>
            </form>

            {error && <div className="error-msg">{error}</div>}

            <footer className="landing-footer">
              TruthLens — Helping readers see language clearly.
              <nav className="footer-links">
                <a href="#">About</a>
                <span aria-hidden>·</span>
                <a href="#">Privacy</a>
                <span aria-hidden>·</span>
                <a href="#">Contact</a>
              </nav>
            </footer>
          </div>
        </>
      ) : (
        <div className="results-page">
          <div className="results-header">
            <a href="/" className="site-brand site-brand-small" aria-label="TruthLens home">
              <img src="/logo.png" alt="" className="site-logo" />
              <div className="site-brand-text">
                <span className="site-name">TruthLens</span>
                <span className="site-tagline">Language has power. See it clearly.</span>
              </div>
            </a>
            <button type="button" className="back-btn" onClick={goBack}>
              ← Back
            </button>
          </div>

          <div className="results-body">
            <section className="result-section result-section-text">
              <h2>Your text</h2>
              <div className="full-text-with-highlights">
                {renderTextWithHighlights(analyzedText, result!.highlights)}
              </div>
            </section>

            <section className="result-section combined-section">
              <div className="combined-section-inner">
                <div className="combined-section-left">
                  <h2>Perception explanation</h2>
                  <p className="value perception">{result!.perception_explanation}</p>
                </div>
                <div className="combined-section-divider"></div>
                <div className="combined-section-right">
                  <h2>
                    {result!.detected_techniques.length > 0
                      ? `Detected ${result!.detected_techniques.length} technique${result!.detected_techniques.length === 1 ? '' : 's'}`
                      : 'Detected techniques'}
                  </h2>
                  {result!.detected_techniques.length > 0 ? (
                    <>
                      <div className="techniques-list">
                        {result!.detected_techniques.map((t) => (
                          <span
                            key={t}
                            className={`technique-tag ${getTechniqueClass(t)}`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        className={`why-matters-btn ${showWhyMatters ? 'expanded' : ''}`}
                        onClick={() => setShowWhyMatters(!showWhyMatters)}
                        aria-expanded={showWhyMatters}
                      >
                        {showWhyMatters ? 'Hide' : 'Why these cues matter'}
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <p className="empty-state">None detected.</p>
                  )}
                </div>
              </div>
              {showWhyMatters && result!.detected_techniques.length > 0 && (
                <div className="why-matters-panel">
                  {result!.detected_techniques.some(t => t.toLowerCase().includes('urgency')) && (
                    <div className="why-matters-item">
                      <h3 className="why-matters-title">Why urgency can reduce reflection</h3>
                      <p className="why-matters-text">
                        Time pressure cues like "act now" or "limited time" can trigger immediate responses, bypassing careful consideration. This urgency can make readers feel they must decide quickly, potentially reducing their ability to fully evaluate information or consider alternatives.
                      </p>
                    </div>
                  )}
                  {result!.detected_techniques.some(t => t.toLowerCase().includes('emotional')) && (
                    <div className="why-matters-item">
                      <h3 className="why-matters-title">Why emotional framing can heighten reactions</h3>
                      <p className="why-matters-text">
                        Language that appeals to emotions—whether fear, excitement, or outrage—can amplify readers' responses. Emotional framing can make content feel more compelling or urgent than it might be, potentially overriding logical analysis and leading to more reactive decision-making.
                      </p>
                    </div>
                  )}
                  {result!.detected_techniques.some(t => t.toLowerCase().includes('absolute')) && (
                    <div className="why-matters-item">
                      <h3 className="why-matters-title">Why absolute language can limit nuance</h3>
                      <p className="why-matters-text">
                        Words like "always," "never," or "all" present ideas as definitive and unchanging. This can oversimplify complex topics, making nuanced discussions difficult. Absolute language can create false dichotomies and discourage readers from considering middle ground or alternative perspectives.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="result-section highlights">
              <h2>
                {result!.highlights.length > 0
                  ? `Detected ${result!.highlights.length} instance${result!.highlights.length === 1 ? '' : 's'}`
                  : 'Highlights'}
              </h2>
              {result!.highlights.length > 0 ? (
                <ul className="highlights-list">
                  {result!.highlights.map((h, i) => (
                    <li
                      key={`${h.text}-${i}`}
                      className={`highlight-item ${getTechniqueClass(h.technique)}`}
                    >
                      <div className="highlight-phrase">"{h.text}"</div>
                      <div className="highlight-technique">{h.technique}</div>
                      <div className="highlight-reason">{h.reason}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No highlights.</p>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
