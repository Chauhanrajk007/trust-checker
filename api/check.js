export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "No URL" });

  let score = 50;
  let reasons = [];

  // HTTPS check
  if (url.startsWith("https://")) {
    score += 15;
    reasons.push("Uses HTTPS");
  } else {
    score -= 20;
    reasons.push("Does not use HTTPS");
  }

  // Domain age (simple heuristic)
  if (url.includes(".com") || url.includes(".org")) {
    score += 10;
    reasons.push("Common top-level domain");
  } else {
    score -= 10;
    reasons.push("Uncommon domain extension");
  }

  // Google Safe Browsing (placeholder logic)
  // Real API can be added later
  if (url.includes("free") || url.includes("win")) {
    score -= 15;
    reasons.push("Suspicious keywords detected");
  }

  score = Math.max(0, Math.min(100, score));

  let verdict =
    score >= 80 ? "Likely Safe" :
    score >= 50 ? "Use Caution" :
    "High Risk";

  res.json({ score, verdict, reasons });
}
