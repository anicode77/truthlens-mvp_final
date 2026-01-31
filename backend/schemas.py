from pydantic import BaseModel
from typing import List


class Highlight(BaseModel):
    text: str
    technique: str
    reason: str


class AnalyzeRequest(BaseModel):
    text: str


class AnalyzeResponse(BaseModel):
    highlights: List[Highlight]
    detected_techniques: List[str]
    perception_explanation: str
