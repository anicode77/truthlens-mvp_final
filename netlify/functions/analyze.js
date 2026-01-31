exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const { text } = JSON.parse(event.body || "{}");

  if (!text || typeof text !== "string") {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid input text" }),
    };
  }

  const highlights = [];

  if (/before it's too late|act now|limited time|won't be available/i.test(text)) {
    highlights.push({ type: "urgency", text: "Urgency language detected" });
  }

  if (/experts say|research shows|analysts believe/i.test(text)) {
    highlights.push({ type: "authority", text: "Authority appeal detected" });
  }

  if (/everyone|most people|many are already/i.test(text)) {
    highlights.push({ type: "social-proof", text: "Social proof detected" });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      highlights,
      techniques: highlights.map(h => h.type),
      explanation:
        "This content uses urgency, authority, and social proof cues that may influence perception.",
    }),
  };
};
