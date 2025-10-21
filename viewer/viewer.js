import { getLeads, saveLeads } from "../scripts/storage.js";
import { renderLeads } from "../scripts/render.js";

const container = document.getElementById("viewer-container");
const searchInput = document.getElementById("search-input");

let allLeads = [];

const params = new URLSearchParams(window.location.search);
const filter = params.get("filter");

getLeads().then((leads) => {
  allLeads = Array.isArray(leads) ? leads : [];

  const leadsToRender =
    filter === "favorites"
      ? allLeads.filter((lead) => lead.isFavorite)
      : allLeads;

  renderLeads(leadsToRender, container, "editable");
});

// Live search
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();

  const filtered = allLeads.filter((lead) => {
    const description = lead.description?.toLowerCase() || "";
    const category = lead.category?.toLowerCase() || "";
    return description.includes(query) || category.includes(query);
  });

  const leadsToRender =
    filter === "favorites"
      ? filtered.filter((lead) => lead.isFavorite)
      : filtered;

  renderLeads(leadsToRender, container, "editable");
});

//Back to All tabs
const backBtn = document.getElementById("back-to-all-btn");

if (filter === "favorites") {
  backBtn.style.display = "inline-block";

  backBtn.addEventListener("click", () => {
    window.location.href = "viewer.html"; // Reloads without filter
  });
}

// 1. Listen for Click events (Delete, Favorite, Edit Toggle)
container.addEventListener("click", async (e) => {
  const target = e.target;
  const urlToModify = target.dataset.url;

  // We only care about buttons with data-url attribute
  if (!urlToModify) return;

  if (target.classList.contains("favorite-toggle")) {
    // === Favorite/Unfavorite Toggle ===
    const currentLeads = await getLeads(); // <--- FIXED: Use 'currentLeads'

    // Find the lead and toggle its isFavorite state
    const updatedLeads = currentLeads.map((l) =>
      l.url === urlToModify ? { ...l, isFavorite: !l.isFavorite } : l
    );

    await saveLeads(updatedLeads);

    // Re-calculate leads to render based on the current filter/search query
    const leadsToRender = updatedLeads.filter((lead) => {
      // Use updatedLeads here
      if (filter === "favorites" && !lead.isFavorite) return false;
      const query = searchInput.value.toLowerCase().trim();
      const description = lead.description?.toLowerCase() || "";
      const category = lead.category?.toLowerCase() || "";
      return description.includes(query) || category.includes(query);
    });

    // Re-render the list
    allLeads = updatedLeads; // <--- This assignment is now safe
    renderLeads(leadsToRender, container, "editable");
  } else if (target.classList.contains("delete-btn")) {
    // === Delete Button ===
    const confirmed = confirm(chrome.i18n.getMessage("confirm_delete_tab"));
    if (!confirmed) return;

    const currentLeads = await getLeads(); // <--- FIXED: Use 'currentLeads'
    const updatedLeads = currentLeads.filter((l) => l.url !== urlToModify);

    await saveLeads(updatedLeads);

    // Re-render the list
    allLeads = updatedLeads; // <--- This assignment is now safe
    // Trigger search logic again to filter the new list based on the current query/filter
    searchInput.dispatchEvent(new Event("input"));
  } else if (target.classList.contains("edit-category-btn")) {
    // === Edit Category Button (Toggle Display) ===
    const li = target.closest(".tab-entry");
    const fixedLabel = li.querySelector(".fixed-category-label");
    const categoryEditor = li.querySelector(".category-editor");

    if (fixedLabel) fixedLabel.style.display = "none";
    target.style.display = "none";
    if (categoryEditor) {
      // Remove the 'hidden-editor' class to show it
      categoryEditor.classList.remove("hidden-editor");
      categoryEditor.style.display = "inline-block";
      categoryEditor.focus();
    }
  }
});

// 2. Listen for Category Change events (when the dropdown value is selected)
container.addEventListener("change", async (e) => {
  if (e.target.classList.contains("category-editor")) {
    const newCategory = e.target.value;
    const tabUrl = e.target.dataset.url;

    const currentLeads = await getLeads(); // <--- FIXED: Use 'currentLeads'
    const updatedLeads = currentLeads.map((l) =>
      l.url === tabUrl ? { ...l, category: newCategory } : l
    );

    await saveLeads(updatedLeads);

    // Re-render the list by triggering the search logic (which includes filter/query logic)
    allLeads = updatedLeads; // <--- This assignment is now safe
    searchInput.dispatchEvent(new Event("input"));

    // Blur the editor after saving to automatically hide it (handled by focusout)
    e.target.blur();
  }
});

// 3. Listen for Blur/Focusout events (Hide editor when focus is lost)
container.addEventListener(
  "focusout",
  (e) => {
    if (e.target.classList.contains("category-editor")) {
      const li = e.target.closest(".tab-entry");
      const fixedLabel = li.querySelector(".fixed-category-label");
      const editCategoryBtn = li.querySelector(".edit-category-btn");

      if (fixedLabel) fixedLabel.style.display = "inline-block";
      if (editCategoryBtn) editCategoryBtn.style.display = "inline-block";

      // Use the CSS class to hide it consistently
      e.target.classList.add("hidden-editor");
      e.target.style.display = "none";
    }
  },
  true
);
