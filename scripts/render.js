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
    const ul =
      container.querySelectorAll("ul")[
        container.querySelectorAll("ul").length - 1
      ];

    grouped[category].forEach((lead) => {
      const emoji =
        localStorage.getItem(`emoji-${lead.category}`) ||
        categoryEmojis[lead.category] ||
        "📌";
      const categoryI18nLabel = knownKeys[lead.category]
        ? chrome.i18n.getMessage(knownKeys[lead.category])
        : lead.category;
      const urlLabel = `${emoji} ${lead.description || lead.url}`;
      const color = localStorage.getItem(`color-${lead.category}`) || "#7f8c8d";

      let categoryDisplay = "";
      let editButton = "";
      if (mode === "readonly") {
        // Readonly mode (used in popup)
        categoryDisplay = `<span class="category-label" style="border-left-color: ${color};">${emoji} ${categoryI18nLabel}</span>`;
      } else {
        // Editable mode (used in viewer.html)
        // 1. Display the category as a fixed label
        categoryDisplay = `<span class="category-label fixed-category-label" style="border-left-color: ${color};" data-url="${lead.url}">${emoji} ${categoryI18nLabel}</span>`; // 2. Create the Edit Button

        editButton = `<button class="edit-category-btn" data-url="${
          lead.url
        }" title="${chrome.i18n.getMessage(
          "tooltip_edit_category"
        )}">✏️</button>`; // The dropdown <select> will be created and shown/hidden dynamically upon clicking the edit button. // We also need a hidden dropdown element to show when editing

        const categorySelect = document.createElement("select");
        categorySelect.className = "category-editor hidden-editor"; // Add a class to hide it by default
        categorySelect.dataset.url = lead.url;

        const allCategories = Object.keys(categoryEmojis);
        allCategories.forEach((cat) => {
          const option = document.createElement("option");
          option.value = cat;
          const optionEmoji =
            localStorage.getItem(`emoji-${cat}`) || categoryEmojis[cat] || "📌";
          const optionLabel = knownKeys[cat]
            ? chrome.i18n.getMessage(knownKeys[cat])
            : cat;
          option.textContent = `${optionEmoji} ${optionLabel}`;
          if (cat === lead.category) option.selected = true;
          categorySelect.appendChild(option);
        }); // Append the hidden select element's HTML to the display
        categoryDisplay += categorySelect.outerHTML;
      }
      const li = document.createElement("li");
      li.className = "tab-entry";
      li.dataset.category = lead.category;

      li.innerHTML = `
<a target="_blank" href="${lead.url}">${urlLabel}</a>
<span class="timestamp">${lead.timestamp}</span>
${categoryDisplay}
<div class="tab-actions">
${editButton} <button class="favorite-toggle" data-url="${lead.url}" title="${
        lead.isFavorite
          ? chrome.i18n.getMessage("tooltip_unfavorite")
          : chrome.i18n.getMessage("tooltip_favorite")
      }">${lead.isFavorite ? "⭐" : "☆"}</button>
<button class="delete-btn" data-url="${
        lead.url
      }" title="${chrome.i18n.getMessage("tooltip_delete")}">🗑️</button>
</div>
`;

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
