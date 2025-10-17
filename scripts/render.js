import { getLeads, saveLeads } from "./storage.js";

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
  Computing: "💻",
  Art: "🎨",
  Photography: "📸",
  Shopping: "🛍️",
  Games: "🎮",
  Sports: "🏋️",
  Shows: "📺",
  Health: "🩺",
  Pharmacy: "💊",
  Investigation: "🕵️",
  Uncategorized: "📌",
};

const knownKeys = {
  Profiles: "category_profiles",
  Videos: "category_videos",
  Articles: "category_articles",
  Books: "category_books",
  Music: "category_music",
  Quantum: "category_quantum",
  English: "category_english",
  Travel: "category_travel",
  Animals: "category_animals",
  Science: "category_science",
  AI: "category_ai",
  Space: "category_space",
  Computing: "category_computing",
  Art: "category_art",
  Photography: "category_photography",
  Shopping: "category_shopping",
  Games: "category_games",
  Sports: "category_sports",
  Shows: "category_shows",
  Health: "category_health",
  Pharmacy: "category_pharmacy",
  Investigation: "category_investigation",
  Uncategorized: "category_uncategorized",
};

export async function renderLeads(leads, container) {
  container.innerHTML = "";

  if (!leads || leads.length === 0) {
    container.innerHTML = `<p>${chrome.i18n.getMessage(
      "no_matching_tabs"
    )}</p>`;

    return;
  }

  const grouped = leads.reduce((acc, lead) => {
    if (!lead.category) return acc;
    acc[lead.category] = acc[lead.category] || [];
    acc[lead.category].push(lead);
    return acc;
  }, {});

  if (Object.keys(grouped).length === 0) {
    container.innerHTML = `<p>${chrome.i18n.getMessage(
      "no_favorites_yet"
    )}</p>`;
    return;
  }

  for (const category in grouped) {
    const emoji =
      localStorage.getItem(`emoji-${category}`) ||
      categoryEmojis[category] ||
      "📌";

    const i18nLabel = knownKeys[category]
      ? chrome.i18n.getMessage(knownKeys[category])
      : null;

    const label = i18nLabel && i18nLabel.trim() !== "" ? i18nLabel : category;

    container.innerHTML += `<h3>${emoji} ${label}</h3><ul>`;

    grouped[category].forEach((lead) => {
      const emoji =
        localStorage.getItem(`emoji-${lead.category}`) ||
        categoryEmojis[lead.category] ||
        "📌";
      const label = `${emoji} ${lead.description || lead.url}`;
      const color = localStorage.getItem(`color-${lead.category}`) || "#7f8c8d";

      const categorySelect = document.createElement("select");
      categorySelect.className = "category-editor";
      categorySelect.dataset.url = lead.url;

      const allCategories = Object.keys(categoryEmojis);
      allCategories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        const emoji =
          localStorage.getItem(`emoji-${cat}`) || categoryEmojis[cat] || "📌";
        const label = knownKeys[cat]
          ? chrome.i18n.getMessage(knownKeys[cat])
          : cat;
        option.textContent = `${emoji} ${label}`;
        if (cat === lead.category) option.selected = true;
        categorySelect.appendChild(option);
      });

      categorySelect.addEventListener("change", async (e) => {
        const newCategory = e.target.value;
        const tabUrl = e.target.dataset.url;
        const allLeads = await getLeads();
        const updatedLeads = allLeads.map((l) =>
          l.url === tabUrl ? { ...l, category: newCategory } : l
        );
        await saveLeads(updatedLeads);
        renderLeads(updatedLeads, container);
      });

      container.innerHTML += `
<li class="tab-entry" data-category="${lead.category}">
  <a target="_blank" href="${lead.url}">${label}</a>
  <span class="timestamp">${lead.timestamp}</span>
  ${categorySelect.outerHTML}
  <div class="tab-actions">
    <button class="favorite-toggle" data-url="${lead.url}" title="${
        lead.isFavorite
          ? chrome.i18n.getMessage("tooltip_unfavorite")
          : chrome.i18n.getMessage("tooltip_favorite")
      }">${lead.isFavorite ? "⭐" : "☆"}</button>
    <button class="delete-btn" data-url="${
      lead.url
    }" title="${chrome.i18n.getMessage("tooltip_delete")}">🗑️</button>
  </div>
</li>`;
    });

    container.innerHTML += `</ul>`;
  }

  const deleteButtons = container.querySelectorAll(".delete-btn");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const urlToDelete = e.target.dataset.url;
      const confirmed = confirm(chrome.i18n.getMessage("confirm_delete_tab"));
      if (!confirmed) return;

      const allLeads = await getLeads();
      const updatedLeads = allLeads.filter((lead) => lead.url !== urlToDelete);
      await saveLeads(updatedLeads);
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

    const emoji =
      localStorage.getItem(`emoji-${cat}`) || categoryEmojis[cat] || "📌";
    const i18nKey = knownKeys[cat];
    const label = i18nKey ? chrome.i18n.getMessage(i18nKey) : cat;

    option.textContent = `${emoji} ${label}`;
    selectEl.appendChild(option);
  });

  const addNewOption = document.createElement("option");
  addNewOption.value = "__new__";
  addNewOption.textContent = `➕ ${chrome.i18n.getMessage("add_new_category")}`;
  selectEl.appendChild(addNewOption);
}
