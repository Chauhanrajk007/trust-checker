export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "URL required" });
  }

  let score = 60;
  let safe = [];
  let caution = [];

  const u = url.toLowerCase();

  // HTTPS
  if (u.startsWith("https://")) {
    score += 10;
    safe.push("Uses HTTPS encryption");
  } else {
    score -= 20;
    caution.push("Does not use HTTPS");
  }

  // Google Safe Browsing (optional, safe fallback)
  const apiKey = process.env.GSB_KEY;
  if (apiKey) {
    try {
      const r = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client: { clientId: "trust", clientVersion: "1.0" },
            threatInfo: {
              threatTypes: [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE"
              ],
              platformTypes: ["ANY_PLATFORM"],
              threatEntryTypes: ["URL"],
              threatEntries: [{ url }]
            }
          })
        }
      );

      const data = await r.json();
      if (data.matches) {
        score -= 60;
        caution.push("Flagged by Google Safe Browsing");
      } else {
        score += 30;
        safe.push("Not flagged by Google Safe Browsing");
      }
    } catch {
      caution.push("Safe Browsing check unavailable");
    }
  }

  // Gambling / betting penalty
  if (
    u.includes("bet") ||
    u.includes("casino") ||
    u.includes("gamble") ||
    u.includes("stake")
  ) {
    score -= 15;
    caution.push("Gambling-related websites carry higher financial risk");
  }

  // Clamp score
  score = Math.max(0, Math.min(95, score));

  let verdict =
    score >= 90 ? "Very Low Risk" :
    score >= 70 ? "Low Risk" :
    score >= 50 ? "Use Caution" :
    "High Risk";

  return res.json({
    score,
    verdict,
    safe,
    caution
  });
}
