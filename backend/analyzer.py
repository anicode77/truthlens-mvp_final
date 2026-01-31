import re
from typing import List, Tuple

URGENCY_PHRASES = [
    "before it's too late",
    "act now",
    "right now",
    "limited time",
    "don't miss out",
    "hurry",
    "urgent",
    "breaking",
    "immediate action",
    "last chance",
    "limited offer",
    "expires soon",
    "time-sensitive",
    "while supplies last",
    "only today",
    "final hours",
    "don't wait",
    "sign up now",
    "order now",
    "call now",
    "join now",
    "register now",
    "get it now",
    "today only",
    "ends soon",
    "deadline",
    "countdown",
    "rush",
    "asap",
    "without delay",
    "instant",
    "immediately",
    "quick",
    "fast",
    "now or never",
    "once in a lifetime",
    "last minute",
    "running out",
    "limited availability",
    "exclusive offer",
    "act fast",
    "grab it now",
]

EMOTIONAL_WORDS = [
    "shocking",
    "terrifying",
    "unbelievable",
    "heartbreaking",
    "outrageous",
    "devastating",
    "incredible",
    "shattered",
    "crucial",
    "panic",
    "horrifying",
    "tragic",
    "desperate",
    "furious",
    "devastated",
    "heartbroken",
    "stunned",
    "appalled",
    "disturbing",
    "alarming",
    "frightening",
    "terrible",
    "horrible",
    "nightmare",
    "catastrophic",
    "disaster",
    "crisis",
    "scandal",
    "outrage",
    "fear",
    "terror",
    "despair",
    "hopeless",
    "critical",
    "vital",
    "essential",
    "must-see",
    "must-read",
    "explosive",
    "bombshell",
    "revelation",
    "exposed",
    "betrayed",
    "betrayal",
    "victim",
    "suffering",
    "trauma",
    "traumatic",
    "disturbing",
    "gut-wrenching",
    "jaw-dropping",
    "mind-blowing",
    "stunning",
    "astonishing",
    "unprecedented",
    "historic",
    "legendary",
    "epic",
    "inspiring",
    "moving",
    "powerful",
    "intense",
    "emotional",
    "controversial",
    "divisive",
    "polarizing",
    "inflammatory",
    "provocative",
]

ABSOLUTE_WORDS = [
    "always",
    "everyone",
    "no one",
    "never",
    "guaranteed",
    "all",
    "every",
    "everybody",
    "nobody",
    "nothing",
    "everything",
    "none",
    "only",
    "must",
    "certain",
    "certainly",
    "definitely",
    "absolutely",
    "undoubtedly",
    "unquestionably",
    "invariably",
    "inevitably",
    "without exception",
    "without doubt",
    "no doubt",
    "no question",
    "clearly",
    "obviously",
    "plainly",
    "simply",
    "pure",
    "purely",
    "total",
    "totally",
    "complete",
    "completely",
    "entire",
    "entirely",
    "full",
    "fully",
    "perfect",
    "perfectly",
    "ultimate",
    "ultimately",
    "forever",
    "permanent",
    "permanently",
    "irreversible",
    "unanimous",
    "universal",
    "unconditional",
    "unparalleled",
    "unmatched",
    "undeniable",
    "infallible",
    "flawless",
    "impossible",
    "inevitable",
    "unstoppable",
    "unbeatable",
    "best",
    "worst",
    "greatest",
    "biggest",
    "smallest",
    "first",
    "last",
    "only one",
    "sole",
    "exclusive",
    "unique",
    "one and only",
]


def _word_boundary_pattern(word: str) -> re.Pattern:
    """Match word as whole word (case-insensitive)."""
    escaped = re.escape(word)
    return re.compile(rf"\b{escaped}\b", re.IGNORECASE)


def analyze_text(text: str) -> Tuple[List[dict], List[str]]:
    lowered = text.lower()
    highlights = []
    techniques = set()

    # Phrase matching (substring) for multi-word urgency
    for phrase in URGENCY_PHRASES:
        if phrase in lowered:
            highlights.append({
                "text": phrase,
                "technique": "Urgency",
                "reason": "Creates time pressure that may reduce reflection"
            })
            techniques.add("Urgency")

    # Whole-word matching for emotional words
    for word in EMOTIONAL_WORDS:
        if _word_boundary_pattern(word).search(text):
            highlights.append({
                "text": word,
                "technique": "Emotional Framing",
                "reason": "Uses emotionally charged language to amplify emotional response"
            })
            techniques.add("Emotional Framing")

    # Whole-word matching for absolute language
    for word in ABSOLUTE_WORDS:
        if _word_boundary_pattern(word).search(text):
            highlights.append({
                "text": word,
                "technique": "Absolute Language",
                "reason": "Presents statements as universal or unquestionable"
            })
            techniques.add("Absolute Language")

    return highlights, list(techniques)
