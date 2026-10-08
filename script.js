const btn = document.getElementById("generate"),
  topic = document.getElementById("topic"),
  platform = document.getElementById("platform"),
  tone = document.getElementById("tone"),
  error = document.getElementById("error"),
  results = document.getElementById("results"),
  resultGrid = document.getElementById("resultGrid"),
  copyAll = document.getElementById("copyAll");

btn.addEventListener("click", async () => {
  const t = topic.value.trim();

  error.textContent = "";

  if (!t) {
    error.textContent = "Enter a video topic first.";
    topic.focus();
    return;
  }

  btn.disabled = true;
  btn.textContent = "GENERATING...";

  try {
    const r = await fetch(
      "https://ai-creator-toolkit-5dky8bujn-gulsher1.vercel.app/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: t,
          platform: platform.value,
          tone: tone.value
        })
      }
    );

    if (!r.ok) {
      const errorData = await r.json().catch(() => ({}));
      throw new Error(
        errorData.error || "AI service request failed."
      );
    }

    const data = await r.json();
    render(data);

  } catch (e) {
    error.textContent = e.message;
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'GENERATE IDEAS <span>✦</span>';
  }
});

function render(data) {
  const sections = [
    ["TITLES", data.titles || []],
    ["HOOKS", data.hooks || []],
    ["THUMBNAIL IDEAS", data.thumbnails || []]
  ];

  resultGrid.innerHTML = sections
    .map(
      ([name, items]) => `
        <div class="result-block">
          <h3>${name}</h3>
          <ol>
            ${items
              .map((x) => `<li>${escapeHtml(x)}</li>`)
              .join("")}
          </ol>
        </div>
      `
    )
    .join("");

  results.classList.remove("hidden");
  results.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m])
  );
}

copyAll.addEventListener("click", () => {
  const text = resultGrid.innerText;

  navigator.clipboard?.writeText(text);

  copyAll.textContent = "COPIED ✓";

  setTimeout(() => {
    copyAll.textContent = "COPY ALL";
  }, 1500);
});
