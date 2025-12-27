const form = document.getElementById("checkForm");
const btn = document.getElementById("checkBtn");
const overlay = document.getElementById("overlay");
const result = document.getElementById("result");
const closeBtn = document.getElementById("closePopup");

/* Safety net */
overlay.classList.add("hidden");
document.body.classList.remove("modal-open");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = document.getElementById("urlInput").value.trim();
  if (!url.startsWith("http")) {
    alert("Please enter full URL including https://");
    return;
  }

  btn.textContent = "Checking…";
  btn.classList.add("loading");
  btn.disabled = true;

  try {
    const res = await fetch(`/api/check?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    const level =
      data.score >= 90 ? "safe" :
      data.score >= 70 ? "caution" :
      "danger";

    result.innerHTML = `
      <div class="status ${level}">
        ${data.verdict}
      </div>

      <div class="confidence">
        Confidence level: <strong>${data.score}%</strong>
      </div>

      <p class="summary">
        ${
          data.score >= 90
            ? "This website shows no active security warnings and appears safe."
            : data.score >= 70
            ? "No known threats detected, but some uncertainty exists."
            : "This website shows signs of risk and should be avoided."
        }
      </p>

      <div class="details">
        <h3>Why this result was given</h3>
        <ul>
          ${data.whySafe.map(x => `<li>✔ ${x}</li>`).join("")}
          ${data.whyCaution.map(x => `<li>⚠ ${x}</li>`).join("")}
        </ul>
      </div>

      <p class="footnote">
        Scores reflect known security signals only. No automated system can guarantee safety.
      </p>
    `;

    overlay.classList.remove("hidden");
    document.body.classList.add("modal-open");

  } catch {
    alert("Error checking website");
  }

  btn.textContent = "Check";
  btn.classList.remove("loading");
  btn.disabled = false;
});

closeBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
  document.body.classList.remove("modal-open");
});

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }
});
