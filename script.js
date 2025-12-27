async function check() {
  const url = document.getElementById("urlInput").value;
  const res = await fetch(`/api/check?url=${encodeURIComponent(url)}`);
  const data = await res.json();

  document.getElementById("result").innerHTML = `
    <h2>Trust Score: ${data.score}%</h2>
    <p>${data.verdict}</p>
    <ul>${data.reasons.map(r => `<li>${r}</li>`).join("")}</ul>
  `;
}
