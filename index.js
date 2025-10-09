import { renderLeads, renderCategoryOptions } from "./scripts/render.js";
import {
  getLeads,
  saveLeads,
  getCategories,
  saveCategories,
} from "./scripts/storage.js";

let myLeads = getLeads();
let categories = getCategories();

const inputEl = document.getElementById("input-el");
const ulEl = document.getElementById("ul-el");
const categoryEl = document.getElementById("category-el");
const newCategoryEl = document.getElementById("new-category-el");
const clearBtn = document.getElementById("clear-btn");
const tabBtn = document.getElementById("tab-btn");
const addCategoryBtn = document.getElementById("add-category-btn");
const viewAllBtn = document.getElementById("view-all-btn");

// Initial render
renderCategoryOptions(categories, categoryEl);
renderLeads(myLeads, ulEl);

// View All Tabs → open viewer.html in new tab
viewAllBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "viewer/viewer.html" });
});

// Save current tab
tabBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs || !tabs[0]) {
      console.warn("No active tab found");
      return;
    }

    const url = tabs[0].url;
    const category = categoryEl.value;
    const description = inputEl?.value.trim() || "";
    const timestamp = new Date().toLocaleString();

    if (!myLeads.some((lead) => lead.url === url)) {
      myLeads.push({ url, category, description, timestamp });
      saveLeads(myLeads);
      renderLeads(myLeads, ulEl);
    }

    if (inputEl) inputEl.value = "";

    tabBtn.classList.add("saved");
    setTimeout(() => tabBtn.classList.remove("saved"), 300);
  });
});

// Clear all saved tabs and categories
clearBtn.addEventListener("click", () => {
  localStorage.clear();
  myLeads = [];
  categories = [];
  renderLeads(myLeads, ulEl);
  renderCategoryOptions(categories, categoryEl);
});

// Add new category
addCategoryBtn.addEventListener("click", () => {
  const newCat = newCategoryEl.value.trim();
  if (newCat && !categories.includes(newCat)) {
    categories.push(newCat);
    saveCategories(categories);
    renderCategoryOptions(categories, categoryEl);
    categoryEl.value = newCat;
    newCategoryEl.value = "";
    newCategoryEl.style.display = "none";
    addCategoryBtn.style.display = "none";

    addCategoryBtn.classList.add("saved");
    setTimeout(() => addCategoryBtn.classList.remove("saved"), 300);
  }
});

// Show/hide new category input
categoryEl.addEventListener("change", () => {
  const isNew = categoryEl.value === "__new__";
  newCategoryEl.style.display = isNew ? "inline-block" : "none";
  addCategoryBtn.style.display = isNew ? "inline-block" : "none";
  deleteCategoryBtn.disabled = isNew;
});

// Delete selected category and its leads
categoryEl.addEventListener("change", () => {
  const value = categoryEl.value;

  if (value === "__new__") {
    newCategoryEl.style.display = "inline-block";
    addCategoryBtn.style.display = "inline-block";
  } else {
    newCategoryEl.style.display = "none";
    addCategoryBtn.style.display = "none";
  }

  if (value === "__delete__") {
    const selectedCat = categoryEl.options[categoryEl.selectedIndex - 1]?.value;

    if (!selectedCat || !categories.includes(selectedCat)) {
      alert("Please select a valid category to delete.");
      return;
    }

    const confirmed = confirm(
      `Delete "${selectedCat}" and all its saved items?`
    );
    if (confirmed) {
      categories = categories.filter((cat) => cat !== selectedCat);
      myLeads = myLeads.filter((lead) => lead.category !== selectedCat);

      saveCategories(categories);
      saveLeads(myLeads);

      renderCategoryOptions(categories, categoryEl);
      renderLeads(myLeads, ulEl);

      categoryEl.value = categories[0] || "__new__";
    }
  }
});
