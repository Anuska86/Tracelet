import { saveLeads } from "./storage.js";

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
    container.innerHTML += `<h3>${category}</h3><ul>`;
    grouped[category].forEach((lead) => {
      container.innerHTML += `
  <li>
    <a target="_blank" href="${lead.url}">${lead.url}</a>
    ${lead.description ? `<p class="description">${lead.description}</p>` : ""}
    <span class="timestamp">${lead.timestamp}</span>
    <button class="favorite-toggle" data-url="${lead.url}">
      ${lead.isFavorite ? "⭐" : "☆"}
    </button>
    <button class="delete-btn" data-url="${lead.url}">🗑️</button>
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
    option.textContent = cat;
    selectEl.appendChild(option);
  });

  const addNewOption = document.createElement("option");
  addNewOption.value = "__new__";
  addNewOption.textContent = "➕ Add new category";
  selectEl.appendChild(addNewOption);
}
