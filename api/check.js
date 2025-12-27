import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }

    let score = 70; // start neutral-positive
    let reasons = [];

    // --- Signal buckets for pie chart ---
    let safePoints = 0;
    let neutralPoints = 0;
    let riskPoints = 0;

    // HTTPS check (minor signal)
    if (url.startsWith("https://")) {
      safePoints += 10;
      reasons.push("Uses secure HTTPS connection");
    } else {
      riskPoints += 20;
      reasons.push("Does not use HTTPS");
      score -= 20;
    }

    // --- Google Safe Browsing ---
    const apiKey = process.env.GSB_KEY;

    const sbResponse = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${AIzaSyBzPFXBFGRVBrxu8EsVXtjALOwXQjqUWDk}`,
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
      // Strong negative signal
      riskPoints += 60;
      score -= 60;
      reasons.push("Flagged by Google Safe Browsing as dangerous");
    } else {
      safePoints += 30;
      reasons.push("Not flagged by Google Safe Browsing");
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Neutral bucket fills the rest
    neutralPoints = Math.max(0, 100 - (safePoints + riskPoints));

    // Verdict
    let verdict =
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
