import { getLeads } from "../scripts/storage.js";
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

  renderLeads(leadsToRender, container);
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

  renderLeads(leadsToRender, container);
});

//Back to All tabs
const backBtn = document.getElementById("back-to-all-btn");

if (filter === "favorites") {
  backBtn.style.display = "inline-block";

  backBtn.addEventListener("click", () => {
    window.location.href = "viewer.html"; // Reloads without filter
  });
}
