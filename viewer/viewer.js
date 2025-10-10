import { getLeads } from "../scripts/storage.js";
import { renderLeads } from "../scripts/render.js";

const container = document.getElementById("viewer-container");

getLeads().then((allLeads) => {
  console.log("Leads:", allLeads);
  renderLeads(allLeads, container);
});
