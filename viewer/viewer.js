import { getLeads } from "../scripts/storage.js";
import { renderLeads } from "../scripts/render.js";

const container = document.getElementById("viewer-container");
const searchInput = document.getElementById("search-input");

let allLeads = [];

getLeads().then((leads) => {
  allLeads = Array.isArray(leads) ? leads : [];
  renderLeads(allLeads, container);
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();

  const filtered = allLeads.filter((lead) => {
    const description = lead.description?.toLowerCase() || "";
    const category = lead.category?.toLowerCase() || "";
    return description.includes(query) || category.includes(query);
  });

  renderLeads(filtered, container);
});
