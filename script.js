const form = document.getElementById("checkForm");
const result = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = document.getElementById("urlInput").value.trim();

  if (!url.startsWith("http")) {
    alert("Please enter full URL including https://");
    return;
  }

  result.className = "";
  result.textContent = "Checking…";

  try {
    const res = await fetch(`/api/check?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    let cls =
      data.score >= 80 ? "safe" :
      data.score >= 50 ? "caution" :
      "danger";

    result.className = cls;
    result.innerHTML = `
      <h2>Trust Score: ${data.score}%</h2>
      <p><strong>${data.verdict}</strong></p>
      <ul>${data.reasons.map(r => `<li>${r}</li>`).join("")}</ul>
    `;
  } catch {
    result.className = "danger";
    result.textContent = "Error checking website.";
  }
});
