export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }

    let score = 60;
    let whySafe = [];
    let whyCaution = [];

    // HTTPS check
    if (url.startsWith("https://")) {
      score += 10;
      whySafe.push("Uses a secure HTTPS connection");
    } else {
      score -= 25;
      whyCaution.push("Does not use HTTPS, which increases risk");
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
      score -= 60;
      whyCaution.push(
        "Flagged by Google Safe Browsing as potentially dangerous"
      );
    } else {
      score += 30;
      whySafe.push(
        "Not flagged by Google Safe Browsing (no known malware or phishing)"
      );
    }

    // Known brands bonus
    const trusted = [
      "google.com",
      "chatgpt.com",
      "openai.com",
      "github.com",
      "microsoft.com"
    ];

    if (trusted.some(d => url.includes(d))) {
      score += 10;
      whySafe.push("Widely known and commonly trusted website");
    } else {
      whyCaution.push("Website reputation is limited or unknown");
    }

    // Clamp score (never 100)
    score = Math.max(0, Math.min(95, score));

    let verdict;
    if (score >= 90) verdict = "Very Low Risk";
    else if (score >= 70) verdict = "Low Risk";
    else if (score >= 50) verdict = "Use Caution";
    else verdict = "High Risk";

    res.status(200).json({
      score,
      verdict,
      whySafe,
      whyCaution
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
