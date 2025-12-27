export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "URL required" });
  }

  let insights = [];
  let warnings = [];

  const lowerUrl = url.toLowerCase();

  // ---------- BASIC HTTPS ----------
  if (lowerUrl.startsWith("https://")) {
    insights.push("Uses a secure HTTPS connection");
  } else {
    warnings.push("Does not use HTTPS, which increases risk");
  }

  // ---------- FILE TYPE (URL BASED) ----------
  if (lowerUrl.endsWith(".pdf")) {
    insights.push("Opens a PDF document");
  }

  if (
    lowerUrl.endsWith(".zip") ||
    lowerUrl.endsWith(".exe") ||
    lowerUrl.endsWith(".apk")
  ) {
    warnings.push("Triggers a file download");
  }

  // ---------- URL SHORTENER DETECTION ----------
  const shorteners = [
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "rebrand.ly"
  ];

  if (shorteners.some(s => lowerUrl.includes(s))) {
    warnings.push(
      "Uses a link shortener, which hides the final destination and is commonly abused in scams"
    );
  }

  // ---------- REDIRECT DETECTION ----------
  try {
    const headRes = await fetch(url, {
      method: "HEAD",
      redirect: "manual"
    });

    if (headRes.status >= 300 && headRes.status < 400) {
      warnings.push(
        "Redirects to another website. Redirect chains are commonly used in phishing and scam links"
      );
    }

    const contentType = headRes.headers.get("content-type") || "";

    if (contentType.includes("application/pdf")) {
      insights.push("Opens a PDF document");
    } else if (contentType.includes("text/html")) {
      insights.push("Opens a web page");
    }

  } catch {
    warnings.push(
      "The destination website blocks inspection. This behavior is common on suspicious or protected sites"
    );
  }

  // ---------- SCAM-LIKE LANGUAGE (URL BASED) ----------
  const scamWords = [
    "login",
    "verify",
    "reward",
    "free",
    "bonus",
    "win",
    "claim",
    "account"
  ];

  if (scamWords.some(w => lowerUrl.includes(w))) {
    warnings.push(
      "Link contains language commonly used in phishing or scam messages"
    );
  }

  // ---------- FALLBACK ----------
  if (insights.length === 0 && warnings.length === 0) {
    insights.push("No obvious risky behavior detected");
  }

  return res.status(200).json({
    insights,
    warnings
  });
}
