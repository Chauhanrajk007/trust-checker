const form = document.getElementById("inspectForm");
const btn = document.getElementById("inspectBtn");
const overlay = document.getElementById("overlay");
const result = document.getElementById("result");
const closeBtn = document.getElementById("closePopup");

/* ---------- SAFETY: NEVER SHOW POPUP ON LOAD ---------- */
overlay.classList.add("hidden");
document.body.classList.remove("modal-open");

/* ---------- FORM SUBMIT ---------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = document.getElementById("urlInput").value.trim();

  if (!url.startsWith("http")) {
    alert("Please enter the full URL including https://");
    return;
  }

  // Button loading state
  btn.textContent = "Inspecting…";
  btn.classList.add("loading");
  btn.disabled = true;

  try {
    const res = await fetch(`/api/inspect?url=${encodeURIComponent(url)}`);

    // Backend failure
    if (!res.ok) {
      throw new Error("Backend error");
    }

    const data = await res.json();

    if (data.error) {
      alert("Unable to inspect this link right now.");
      return;
    }

    /* ---------- RENDER RESULT (PREMIUM LOGIC) ---------- */
    result.innerHTML = `
      <h2>Link behavior insight</h2>

      <div style="margin-bottom:14px">
        ${data.primaryInsights
          .map(
            (x) => `<div class="insight">🔍 ${x}</div>`
          )
          .join("")}
      </div>

      ${
        data.warnings && data.warnings.length
          ? `<div style="margin-top:10px">
              ${data.warnings
                .map(
                  (x) => `<div class="warning">⚠ ${x}</div>`
                )
                .join("")}
            </div>`
          : ""
      }

      ${
        data.basicInfo && data.basicInfo.length
          ? `<div style="margin-top:14px;font-size:13px;color:#64748b">
              ${data.basicInfo.join(" · ")}
            </div>`
          : ""
      }

      <p style="margin-top:16px;font-size:12px;color:#64748b">
        This analysis is based on link structure and common web behavior patterns.
      </p>
    `;

    // Show popup ONLY on success
    overlay.classList.remove("hidden");
    document.body.classList.add("modal-open");

  } catch (err) {
    alert("Error inspecting link. Please try again later.");
  }

  // Reset button
  btn.textContent = "Inspect";
  btn.classList.remove("loading");
  btn.disabled = false;
});

/* ---------- CLOSE POPUP ---------- */
closeBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
  document.body.classList.remove("modal-open");
});

/* ---------- CLOSE ON BACKGROUND CLICK ---------- */
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }
});
