const form = document.getElementById("checkForm");
const btn = document.getElementById("checkBtn");
const result = document.getElementById("result");

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
      <h2>${data.verdict} (${data.score}%)</h2>

      <h3>Why it looks safe</h3>
      <ul>${data.safe.map(x => `<li>✔ ${x}</li>`).join("")}</ul>

      <h3>Why caution is advised</h3>
      <ul>${data.caution.map(x => `<li>⚠ ${x}</li>`).join("")}</ul>

      <p style="font-size:12px;color:#666">
        This is a probabilistic security check, not a guarantee.
      </p>
    `;
  } catch {
    alert("Error checking website");
  }

  btn.textContent = "Check";
  btn.disabled = false;
});
