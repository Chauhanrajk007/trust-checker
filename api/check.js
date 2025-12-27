export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }

    let score = 60; // neutral starting point
    let reasonsSafe = [];
    let reasonsCaution = [];

    // ---------- HTTPS ----------
    if (url.startsWith("https://")) {
      score += 10;
      reasonsSafe.push("Uses a secure HTTPS connection");
    } else {
      score -= 25;
      reasonsCaution.push("Does not use HTTPS, which is unsafe");
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
      score -= 60;
      reasonsCaution.push(
        "Flagged by Google Safe Browsing as potentially dangerous"
      );
    } else {
      score += 30;
      reasonsSafe.push(
        "Not flagged by Google Safe Browsing (no known malware or phishing)"
      );
    }

    // ---------- WELL-KNOWN DOMAIN BONUS ----------
    const trustedDomains = [
      "google.com",
      "chatgpt.com",
      "openai.com",
      "github.com",
      "microsoft.com"
    ];

    if (trustedDomains.some(d => url.includes(d))) {
      score += 10;
      reasonsSafe.push(
        "Widely known and commonly trusted website"
      );
    } else {
      reasonsCaution.push(
        "Website reputation is unknown or limited"
      );
    }

    // ---------- FINAL SCORE ----------
    score = Math.max(0, Math.min(95, score));

    let verdict;
    if (score >= 90) verdict = "Very Low Risk";
    else if (score >= 70) verdict = "Low Risk";
    else if (score >= 50) verdict = "Use Caution";
    else verdict = "High Risk";

    return res.status(200).json({
      score,
      verdict,
      whySafe: reasonsSafe,
      whyCaution: reasonsCaution
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
