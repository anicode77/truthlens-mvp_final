from openai import OpenAI
from config import OPENAI_API_KEY

client = None

if OPENAI_API_KEY:
    client = OpenAI(api_key=OPENAI_API_KEY)

SYSTEM_PROMPT = """
You explain how language choices influence perception.
You do NOT verify facts, judge intent, or take positions.
Remain neutral, descriptive, and non-political.
"""

def generate_explanation(text: str, techniques: list) -> str:
    if not client:
        return (
            "This explanation layer is disabled because no API key is configured. "
            "The detected techniques are based on rule-based analysis."
        )

    technique_list = ", ".join(techniques) if techniques else "no strong techniques"

    user_prompt = f"""
Text:
{text}

Detected language techniques:
{technique_list}

Explain how these techniques may influence reader perception.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3
    )

    return response.choices[0].message.content
