const form = document.getElementById("checkForm");
const resultDiv = document.getElementById("result");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = document.getElementById("urlInput").value.trim();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    alert("Please enter a full URL starting with https://");
    return;
  }

  resultDiv.classList.add("hidden");
  resultDiv.innerHTML = "Checking…";

  const res = await fetch(`/api/check?url=${encodeURIComponent(url)}`);
  const data = await res.json();

  let className =
    data.score >= 80 ? "safe" :
    data.score >= 50 ? "caution" :
    "danger";

  resultDiv.className = className;
  resultDiv.innerHTML = `
    <h2>Trust Score: ${data.score}%</h2>
    <p><strong>${data.verdict}</strong></p>
    <ul>${data.reasons.map(r => `<li>${r}</li>`).join("")}</ul>
  `;

  resultDiv.classList.remove("hidden");
});
