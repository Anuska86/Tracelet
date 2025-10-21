import { getLeads, saveLeads } from "./storage.js";

export const categoryEmojis = {
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

export async function renderLeads(leads, container, mode = "editable") {
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
    const ul = container.querySelectorAll("ul")[container.querySelectorAll("ul").length - 1];


grouped[category].forEach((lead) => {
  const emoji = localStorage.getItem(`emoji-${lead.category}`) || categoryEmojis[lead.category] || "📌";
  const label = `${emoji} ${lead.description || lead.url}`;
  const color = localStorage.getItem(`color-${lead.category}`) || "#7f8c8d";

  let categoryDisplay = "";
  if (mode === "readonly") {
    const i18nLabel = knownKeys[lead.category]
      ? chrome.i18n.getMessage(knownKeys[lead.category])
      : lead.category;
    categoryDisplay = `<span class="category-label">${emoji} ${i18nLabel}</span>`;
  } else {
    const categorySelect = document.createElement("select");
    categorySelect.className = "category-editor";
    categorySelect.dataset.url = lead.url;

    const allCategories = Object.keys(categoryEmojis);
    allCategories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      const emoji = localStorage.getItem(`emoji-${cat}`) || categoryEmojis[cat] || "📌";
      const label = knownKeys[cat] ? chrome.i18n.getMessage(knownKeys[cat]) : cat;
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
      renderLeads(updatedLeads, container, mode);
    });

    categoryDisplay = categorySelect.outerHTML;
  }

 const li = document.createElement("li");
li.className = "tab-entry";
li.dataset.category = lead.category;

li.innerHTML = `
  <a target="_blank" href="${lead.url}">${label}</a>
  <span class="timestamp">${lead.timestamp}</span>
  ${categoryDisplay}
  <div class="tab-actions">
    <button class="favorite-toggle" data-url="${lead.url}" title="${
      lead.isFavorite
        ? chrome.i18n.getMessage("tooltip_unfavorite")
        : chrome.i18n.getMessage("tooltip_favorite")
    }">${lead.isFavorite ? "⭐" : "☆"}</button>
    <button class="delete-btn" data-url="${lead.url}" title="${chrome.i18n.getMessage("tooltip_delete")}">🗑️</button>
  </div>
`;

const deleteBtn = li.querySelector(".delete-btn");
deleteBtn.addEventListener("click", async () => {
  const confirmed = confirm(chrome.i18n.getMessage("confirm_delete_tab"));
  if (!confirmed) return;
  const allLeads = await getLeads();
  const updatedLeads = allLeads.filter((l) => l.url !== lead.url);
  await saveLeads(updatedLeads);
  renderLeads(updatedLeads, container, mode);
});

const favoriteBtn = li.querySelector(".favorite-toggle");
favoriteBtn.addEventListener("click", async () => {
  const updatedLeads = leads.map((l) =>
    l.url === lead.url ? { ...l, isFavorite: !l.isFavorite } : l
  );
  await saveLeads(updatedLeads);
  renderLeads(updatedLeads, container, mode);
  favoriteBtn.classList.add("favorited");
  setTimeout(() => favoriteBtn.classList.remove("favorited"), 300);
});

ul.appendChild(li);
    });
  }
}

export function renderCategoryOptions(categories, selectEl) {
  selectEl.innerHTML = "";

  // Add "Add new category" at the top
  const addNewOption = document.createElement("option");
  addNewOption.value = "__new__";
  addNewOption.textContent = `➕ ${chrome.i18n.getMessage("add_new_category")}`;
  selectEl.appendChild(addNewOption);

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
}
