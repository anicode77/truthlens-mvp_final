from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import AnalyzeRequest, AnalyzeResponse, Highlight
from analyzer import analyze_text
from gpt_explainer import generate_explanation
from config import USE_GPT_EXPLANATION

app = FastAPI(
    title="TruthLens MVP",
    description="Analyzes how language influences perception. Does not verify truth or intent.",
    version="0.1"
)
@app.get("/")
def root():
    return {"status": "TruthLens backend is alive"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_content(request: AnalyzeRequest):
    highlights_raw, techniques = analyze_text(request.text)

    highlights = [Highlight(**h) for h in highlights_raw]

    if techniques:
        perception_explanation = (
            "The content uses specific language patterns that may influence how it is perceived."
        )
    else:
        perception_explanation = (
            "No strong emotional or framing language patterns were detected."
        )

    # Optional GPT-based explanation
    if USE_GPT_EXPLANATION and techniques:
        try:
            perception_explanation = generate_explanation(
                request.text,
                techniques
            )
        except Exception as e:
            perception_explanation = (
                "The content contains language patterns that may influence perception. "
                "The explanation layer is currently unavailable."
            )

    return AnalyzeResponse(
        highlights=highlights,
        detected_techniques=techniques,
        perception_explanation=perception_explanation
    )
