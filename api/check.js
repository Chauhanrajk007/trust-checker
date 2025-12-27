export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "URL required" });
  }

  const lowerUrl = url.toLowerCase();

  let primaryInsights = [];
  let warnings = [];
  let basicInfo = [];

  // ---------- BASIC (LOW PRIORITY) ----------
  if (lowerUrl.startsWith("https://")) {
    basicInfo.push("Uses HTTPS encryption");
  } else {
    warnings.push("Does not use HTTPS");
  }

  // ---------- FILE / ACTION INTENT ----------
  if (lowerUrl.endsWith(".pdf")) {
    primaryInsights.push("This link opens a PDF document");
  }

  if (
    lowerUrl.endsWith(".zip") ||
    lowerUrl.endsWith(".exe") ||
    lowerUrl.endsWith(".apk")
  ) {
    primaryInsights.push("This link triggers a file download");
    warnings.push("Downloads are commonly used to deliver malware");
  }

  // ---------- LOGIN / DATA COLLECTION ----------
  const credentialWords = [
    "login",
    "signin",
    "sign-in",
    "verify",
    "account",
    "password",
    "auth"
  ];

  if (credentialWords.some(w => lowerUrl.includes(w))) {
    primaryInsights.push(
      "This link likely leads to a login or account verification page"
    );
    warnings.push(
      "Credential collection pages are a common phishing target"
    );
  }

  // ---------- FINANCIAL / GAMBLING ----------
  const moneyWords = [
    "bet",
    "casino",
    "gamble",
    "odds",
    "sportsbook",
    "stake",
    "bonus",
    "reward",
    "withdraw",
    "deposit"
  ];

  if (moneyWords.some(w => lowerUrl.includes(w))) {
    primaryInsights.push(
      "This link is related to financial activity or betting"
    );
    warnings.push(
      "Financial links carry higher risk if the source is untrusted"
    );
  }

  // ---------- URL SHORTENERS ----------
  const shorteners = [
    "bit.ly",
    "tinyurl",
    "t.co",
    "goo.gl",
    "rebrand.ly"
  ];

  if (shorteners.some(s => lowerUrl.includes(s))) {
    primaryInsights.push(
      "This link uses a URL shortener and hides the final destination"
    );
    warnings.push(
      "Hidden destinations are frequently used in phishing and scams"
    );
  }

  // ---------- REDIRECT INTENT (NO FETCH) ----------
  if (lowerUrl.includes("redirect") || lowerUrl.includes("url=")) {
    primaryInsights.push("This link may redirect you to another website");
    warnings.push("Redirect chains are commonly used in scam links");
  }

  // ---------- SCAM-STYLE LANGUAGE ----------
  const urgencyWords = [
    "free",
    "win",
    "claim",
    "urgent",
    "limited",
    "offer",
    "act-now"
  ];

  if (urgencyWords.some(w => lowerUrl.includes(w))) {
    primaryInsights.push(
      "This link uses urgency or reward-based language"
    );
    warnings.push(
      "Urgency is a common psychological tactic used in scams"
    );
  }

  // ---------- FALLBACK ----------
  if (primaryInsights.length === 0) {
    primaryInsights.push(
      "This link appears to be a standard informational website"
    );
  }

  return res.status(200).json({
    primaryInsights,
    warnings,
    basicInfo
  });
}
