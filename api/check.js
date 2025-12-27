export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }

    let score = 60; // neutral base
    let reasons = [];

    let safePoints = 0;
    let neutralPoints = 0;
    let riskPoints = 0;

    // ---------- HTTPS CHECK ----------
    if (url.startsWith("https://")) {
      safePoints += 10;
      score += 10;
      reasons.push("Uses secure HTTPS connection");
    } else {
      riskPoints += 25;
      score -= 25;
      reasons.push("Does not use HTTPS");
    }

    // ---------- GOOGLE SAFE BROWSING ----------
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
      // 🚨 VERY STRONG NEGATIVE
      riskPoints += 60;
      score -= 60;
      reasons.push("Flagged by Google Safe Browsing as dangerous");
    } else {
      // ✅ STRONG POSITIVE
      safePoints += 30;
      score += 30;
      reasons.push("Not flagged by Google Safe Browsing");
    }

    // ---------- BRAND TRUST BONUS (CONTROLLED) ----------
    const trustedBrands = [
      "google.com",
      "chatgpt.com",
      "openai.com",
      "github.com",
      "microsoft.com"
    ];

    if (trustedBrands.some(d => url.includes(d))) {
      safePoints += 10;
      score += 10;
      reasons.push("Well-known and widely trusted domain");
    }

    // ---------- SCORE CLAMP ----------
    // Never show 100 — cap at 95
    score = Math.max(0, Math.min(95, score));

    neutralPoints = Math.max(0, 100 - (safePoints + riskPoints));

    // ---------- VERDICT ----------
    let verdict =
      score >= 90 ? "Very Low Risk" :
      score >= 70 ? "Low Risk" :
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
