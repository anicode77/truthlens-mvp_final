export async function analyzeText(text: string) {
  const res = await fetch("/.netlify/functions/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error("Analysis failed");
  }

  return res.json();
}
