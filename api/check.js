export default function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: "URL missing" });
    }

    let score = 50;
    let reasons = [];

    if (url.startsWith("https://")) {
      score += 15;
      reasons.push("Uses secure HTTPS");
    } else {
      score -= 20;
      reasons.push("Does not use HTTPS");
    }

    if (url.includes(".com") || url.includes(".org") || url.includes(".net")) {
      score += 10;
      reasons.push("Uses a common domain extension");
    } else {
      score -= 10;
      reasons.push("Uses an uncommon domain extension");
    }

    const suspiciousWords = ["free", "win", "verify", "urgent", "bonus"];
    if (suspiciousWords.some(w => url.toLowerCase().includes(w))) {
      score -= 15;
      reasons.push("Contains suspicious keywords");
    }

    score = Math.max(0, Math.min(100, score));

    let verdict =
      score >= 80 ? "Likely Safe" :
      score >= 50 ? "Use Caution" :
      "High Risk";

    return res.status(200).json({
      score,
      verdict,
      reasons
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
