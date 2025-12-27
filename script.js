const form = document.getElementById("checkForm");
const result = document.getElementById("result");
const spinner = document.getElementById("spinner");
let chart;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = document.getElementById("urlInput").value.trim();
  if (!url.startsWith("http")) {
    alert("Please enter full URL including https://");
    return;
  }

  spinner.classList.remove("hidden");
  result.classList.add("hidden");

  try {
    const res = await fetch(`/api/check?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    spinner.classList.add("hidden");
    result.classList.remove("hidden");

    document.getElementById("resultText").innerHTML = `
      <h2>Risk Assessment: ${data.verdict} (${data.score}%)</h2>
      <p>This site is not known to be malicious, but no website is ever 100% risk-free.</p>
      <ul>${data.reasons.map(r => `<li>${r}</li>`).join("")}</ul>
    `;

    const ctx = document.getElementById("scoreChart").getContext("2d");
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Safe Signals", "Neutral Signals", "Risk Signals"],
        datasets: [{
          data: [
            data.signals.safe,
            data.signals.neutral,
            data.signals.risk
          ],
          backgroundColor: ["#16a34a", "#facc15", "#dc2626"]
        }]
      },
      options: {
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });

  } catch {
    spinner.classList.add("hidden");
    alert("Error checking website");
  }
});


