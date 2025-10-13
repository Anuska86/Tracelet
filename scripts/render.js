import { saveLeads } from "./storage.js";

const categoryEmojis = {
  Profiles: "👤",
  Videos: "🎬",
  Articles: "📰",
  Books: "📚",
  Music: "🎵",
  Quantum: "💻",
  English: "📘",
  Travel: "✈️",
  Animals: "🐱",
  Science: "🔬",
  AI: "🤖",
  Space: "🚀",
  Uncategorized: "📌",
};

export function renderLeads(leads, container) {
  const grouped = leads.reduce((acc, lead) => {
    if (!lead.category) return acc;
    acc[lead.category] = acc[lead.category] || [];
    acc[lead.category].push(lead);
    return acc;
  }, {});

  container.innerHTML = "";

  if (Object.keys(grouped).length === 0) {
    container.innerHTML =
      "<p>No favorite tabs yet. Mark one to feature it here!</p>";
    return;
  }

  for (const category in grouped) {
    const emoji =
      localStorage.getItem(`emoji-${category}`) ||
      categoryEmojis[category] ||
      "📌";
    container.innerHTML += `<h3>${emoji} ${category}</h3><ul>`;

    grouped[category].forEach((lead) => {
      const emoji =
        localStorage.getItem(`emoji-${lead.category}`) ||
        categoryEmojis[lead.category] ||
        "📌";
      const label = `${emoji} ${lead.description || lead.url}`;

      const color = localStorage.getItem(`color-${lead.category}`) || "#7f8c8d";

      container.innerHTML += `
<li class="tab-entry" data-category="${lead.category}">
  <a target="_blank" href="${lead.url}">${label}</a>
  <span class="timestamp">${lead.timestamp}</span>
  <div class="tab-actions">
    <button class="favorite-toggle" data-url="${lead.url}">
      ${lead.isFavorite ? "⭐" : "☆"}
    </button>
    <button class="delete-btn" data-url="${lead.url}">🗑️</button>
  </div>
</li>`;
    });
    container.innerHTML += `</ul>`;
  }
  const deleteButtons = container.querySelectorAll(".delete-btn");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const urlToDelete = e.target.dataset.url;
      const updatedLeads = leads.filter((lead) => lead.url !== urlToDelete);
      saveLeads(updatedLeads);
      renderLeads(updatedLeads, container);
    });
  });
  const favoriteButtons = container.querySelectorAll(".favorite-toggle");

  favoriteButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const url = e.target.dataset.url;
      const updatedLeads = leads.map((lead) =>
        lead.url === url ? { ...lead, isFavorite: !lead.isFavorite } : lead
      );

      await saveLeads(updatedLeads);
      renderLeads(updatedLeads, container);

      btn.classList.add("favorited");
      setTimeout(() => btn.classList.remove("favorited"), 300);
    });
  });
}
export function renderCategoryOptions(categories, selectEl) {
  selectEl.innerHTML = "";

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = `${
      localStorage.getItem(`emoji-${cat}`) || categoryEmojis[cat] || "📌"
    } ${cat}`;
    selectEl.appendChild(option);
  });

  const addNewOption = document.createElement("option");
  addNewOption.value = "__new__";
  addNewOption.textContent = "➕ Add new category";
  selectEl.appendChild(addNewOption);
}
