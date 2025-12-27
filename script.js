const form = document.getElementById("checkForm");
const btn = document.getElementById("checkBtn");
const overlay = document.getElementById("overlay");
const result = document.getElementById("result");
const closeBtn = document.getElementById("closePopup");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = document.getElementById("urlInput").value.trim();
  if (!url.startsWith("http")) {
    alert("Please enter full URL including https://");
    return;
  }

  btn.textContent = "Checking...";
  btn.classList.add("loading");
  btn.disabled = true;

  try {
    const res = await fetch(`/api/check?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    result.innerHTML = `
      <h2>${data.verdict} (${data.score}%)</h2>

      <h3>Why this website appears safe</h3>
      <ul>
        ${data.whySafe.map(x => `<li>${x}</li>`).join("")}
      </ul>

      <h3>Why it is not rated 100%</h3>
      <ul>
        ${data.whyCaution.map(x => `<li>${x}</li>`).join("")}
      </ul>

      <p>
        A score of ${data.score}% means this site is not known to be malicious,
        but some uncertainty always exists online.
      </p>
    `;

    overlay.classList.remove("hidden");

  } catch {
    alert("Error checking website");
  }

  btn.textContent = "Check";
  btn.classList.remove("loading");
  btn.disabled = false;
});

closeBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
});
