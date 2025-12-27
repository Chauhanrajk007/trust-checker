export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "URL required" });
  }

  let score = 60;
  let whySafe = [];
  let whyCaution = [];

  const lowerUrl = url.toLowerCase();

  // ---------- HTTPS ----------
  if (lowerUrl.startsWith("https://")) {
    score += 10;
    whySafe.push("Uses a secure HTTPS connection");
  } else {
    score -= 20;
    whyCaution.push("Does not use HTTPS");
  }

  // ---------- GOOGLE SAFE BROWSING (SAFE WRAP) ----------
  const apiKey = process.env.GSB_KEY;

  if (apiKey) {
    try {
      const sbRes = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client: { clientId: "trust-checker", clientVersion: "1.0" },
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

      const sbData = await sbRes.json();

      if (sbData.matches) {
        score -= 60;
        whyCaution.push("Flagged by Google Safe Browsing");
      } else {
        score += 30;
        whySafe.push("Not flagged by Google Safe Browsing");
      }

    } catch {
      whyCaution.push(
        "Unable to verify against Google Safe Browsing (temporary check failure)"
      );
    }
  } else {
    whyCaution.push("Google Safe Browsing not configured");
  }

  // ---------- GAMBLING / HIGH-RISK CATEGORY ----------
  const riskyKeywords = [
    "bet", "betting", "casino", "gamble",
    "odds", "sportsbook", "stake"
  ];

  if (riskyKeywords.some(k => lowerUrl.includes(k))) {
    score -= 15;
    whyCaution.push(
      "Website relates to betting or gambling, which carries higher financial risk"
    );
  }

  // ---------- UNKNOWN REPUTATION ----------
  const trustedDomains = [
    "google.com", "openai.com", "chatgpt.com",
    "github.com", "microsoft.com"
  ];

  if (trustedDomains.some(d => lowerUrl.includes(d))) {
    score += 10;
    whySafe.push("Widely known and trusted domain");
  } else {
    whyCaution.push("Website reputation is limited or unknown");
  }

  // ---------- FINAL ----------
  score = Math.max(0, Math.min(95, score));

  let verdict =
    score >= 90 ? "Very Low Risk" :
    score >= 70 ? "Low Risk" :
    score >= 50 ? "Use Caution" :
    "High Risk";

  return res.status(200).json({
    score,
    verdict,
    whySafe,
    whyCaution
  });
}
