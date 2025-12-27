export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }

    let insights = [];
    let warnings = [];

    const lowerUrl = url.toLowerCase();

    // ---------- FILE EXTENSION CHECK (VERY IMPORTANT) ----------
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

    // ---------- HTTPS ----------
    if (url.startsWith("https://")) {
      insights.push("Uses secure HTTPS connection");
    } else {
      warnings.push("Does not use HTTPS");
    }

    // ---------- HEAD REQUEST (BEST EFFORT) ----------
    let contentType = "";
    let statusCode = null;

    try {
      const headRes = await fetch(url, {
        method: "HEAD",
        redirect: "manual"
      });

      statusCode = headRes.status;
      contentType = headRes.headers.get("content-type") || "";

      if (statusCode >= 300 && statusCode < 400) {
        warnings.push("This link redirects to another page");
      }
    } catch {
      // HEAD often fails — ignore
    }

    // ---------- CONTENT TYPE FALLBACK ----------
    if (contentType.includes("application/pdf")) {
      insights.push("Opens a PDF document");
    } else if (
      contentType.includes("application/zip") ||
      contentType.includes("application/octet-stream")
    ) {
      warnings.push("Triggers a file download");
    } else if (contentType.includes("text/html")) {
      insights.push("Opens a normal web page");
    }

    // ---------- SMALL HTML FETCH FOR FORMS ----------
    try {
      if (contentType.includes("text/html")) {
        const pageRes = await fetch(url);
        const html = (await pageRes.text()).slice(0, 6000);

        if (html.includes("<form")) {
          warnings.push("Contains a form (may collect user input)");
        }
        if (html.includes("type=\"password\"")) {
          warnings.push("Contains a password field (login page)");
        }
      }
    } catch {
      // Ignore blocked pages
    }

    if (insights.length === 0 && warnings.length === 0) {
      insights.push("No unusual behavior detected");
    }

    res.status(200).json({
      insights,
      warnings
    });

  } catch (err) {
    res.status(500).json({ error: "Unable to inspect link" });
  }
}
