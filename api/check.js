export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }

    let score = 70;
    let reasons = [];

    let safePoints = 0;
    let neutralPoints = 0;
    let riskPoints = 0;

    // HTTPS check
    if (url.startsWith("https://")) {
      safePoints += 10;
      reasons.push("Uses secure HTTPS connection");
    } else {
      riskPoints += 20;
      score -= 20;
      reasons.push("Does not use HTTPS");
    }

    // Google Safe Browsing
    const apiKey = process.env.GSB_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const sbResponse = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: {
            clientId: "trust-checker",
            clientVersion: "1.0"
          },
          threatInfo: {
            threatTypes: [
              "MALWARE",
              "SOCIAL_ENGINEERING",
              "UNWANTED_SOFTWARE",
              "POTENTIALLY_HARMFUL_APPLICATION"
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }]
          }
        })
      }
    );

    const sbData = await sbResponse.json();

    if (sbData.matches) {
      riskPoints += 60;
      score -= 60;
      reasons.push("Flagged by Google Safe Browsing as dangerous");
    } else {
      safePoints += 30;
      reasons.push("Not flagged by Google Safe Browsing");
    }

    score = Math.max(0, Math.min(100, score));
    neutralPoints = Math.max(0, 100 - (safePoints + riskPoints));

    const verdict =
      score >= 80 ? "Likely Safe" :
      score >= 50 ? "Use Caution" :
      "High Risk";

    return res.status(200).json({
      score,
      verdict,
      reasons,
      signals: {
        safe: safePoints,
        neutral: neutralPoints,
        risk: riskPoints
      }
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
