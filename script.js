const form = document.getElementById("checkForm");
const btn = document.getElementById("checkBtn");

const overlay = document.getElementById("overlay");
const result = document.getElementById("result");
const closeBtn = document.getElementById("closePopup");

// force hidden on load
overlay.classList.add("hidden");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = document.getElementById("urlInput").value.trim();
  if (!url.startsWith("http")) {
    alert("Enter full URL including https://");
    return;
  }

  btn.textContent = "Checking...";
  btn.disabled = true;

  try {
    const res = await fetch(`/api/check?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (data.error) {
      alert("Unable to check website");
      return;
    }

    result.innerHTML = `
      <h2>${data.verdict}</h2>
      <p><strong>Trust score:</strong> ${data.score}%</p>

      <h3>Why this site looks safe</h3>
      <ul>${data.safe.map(x => `<li>✔ ${x}</li>`).join("")}</ul>

      <h3>Why caution is advised</h3>
      <ul>${data.caution.map(x => `<li>⚠ ${x}</li>`).join("")}</ul>

      <p style="font-size:12px;color:#666">
        This score reflects known security signals only.
      </p>
    `;

    // 🔥 THIS WAS MISSING
    overlay.classList.remove("hidden");

  } catch {
    alert("Error checking website");
  }

  btn.textContent = "Check";
  btn.disabled = false;
});

closeBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
});

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    overlay.classList.add("hidden");
  }
});
