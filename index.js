import { renderLeads, renderCategoryOptions } from "./scripts/render.js";
import {
  getLeads,
  saveLeads,
  getCategories,
  saveCategories,
} from "./scripts/storage.js";
import { guessCategory } from "./scripts/categories.js";

let myLeads = [];
let categories = getCategories();

const inputEl = document.getElementById("input-el");
const ulEl = document.getElementById("ul-el");
const categoryEl = document.getElementById("category-el");
const newCategoryEl = document.getElementById("new-category-el");

const clearBtn = document.getElementById("clear-btn");
const tabBtn = document.getElementById("tab-btn");
const addCategoryBtn = document.getElementById("add-category-btn");
const viewAllBtn = document.getElementById("view-all-btn");

const viewMoreFavoritesBtn = document.getElementById("view-more-favorites-btn");

viewMoreFavoritesBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "viewer/viewer.html?filter=favorites" });
});

const emojiLabel = document.querySelector("label[for='emoji-picker']");
const deleteCategoryBtn = document.getElementById("delete-category-btn");

const timestamp = new Date().toLocaleString(navigator.language);

const emojiPicker = document.getElementById("emoji-picker");
const emojiSuggestions = document.getElementById("emoji-suggestions");

emojiSuggestions.addEventListener("change", (e) => {
  emojiPicker.value = e.target.value;
});

inputEl.placeholder = chrome.i18n.getMessage("description_placeholder");
newCategoryEl.placeholder = chrome.i18n.getMessage("new_category_placeholder");
emojiPicker.placeholder = chrome.i18n.getMessage("emoji_placeholder");

// Initial render
renderCategoryOptions(categories, categoryEl);
categoryEl.value = categories.length > 0 ? categories[0] : "";
newCategoryEl.style.display = "none";
addCategoryBtn.style.display = "none";
emojiPicker.style.display = "none";
emojiSuggestions.style.display = "none";
emojiLabel.style.display = "none";
deleteCategoryBtn.style.display = "none";

//renderLeads(myLeads, ulEl);

getLeads().then((leads) => {
  myLeads = Array.isArray(leads) ? leads : [];
  const favoriteLeads = myLeads.filter((lead) => lead.isFavorite);
  renderLeads(favoriteLeads, ulEl);
});

// View All Tabs → open viewer.html in new tab
viewAllBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "viewer/viewer.html" });
});

//Confirm Save

const favoriteContainer = document.querySelector(".favorite-toggle-container");
const confirmSaveBtn = document.getElementById("confirm-save-btn");

tabBtn.addEventListener("click", () => {
  const selectedCategory = categoryEl.value;
  const categoryLabel =
    selectedCategory === "__new__"
      ? chrome.i18n.getMessage("new_category_label")
      : `"${selectedCategory}"`;

  const saveMessage = document.getElementById("save-message");

  const savePromptText =
    chrome.i18n.getMessage("save_prompt_to") ||
    "Do you want to save this tab to";
  saveMessage.textContent = `💾 ${savePromptText} ${categoryLabel}?`;

  // Smooth fade-in
  const savePrompt = document.getElementById("save-prompt");

  savePrompt.style.display = "block";
  savePrompt.classList.remove("fade-out");
  savePrompt.classList.add("fadeIn");

  favoriteContainer.style.display = "block";
  confirmSaveBtn.style.display = "inline-block";
  confirmSaveBtn.classList.add("show");

  inputEl.focus();
});

confirmSaveBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs || !tabs[0]) {
      console.warn("No active tab found");
      return;
    }

    const url = tabs[0].url;
    let category = categoryEl.value;
    if (!category || category === "__new__") {
      category = guessCategory(url);
    }

    const description = inputEl?.value.trim() || "";
    const isFavorite = document.getElementById("favorite-checkbox").checked;
    const timestamp = new Date().toLocaleString();

    chrome.runtime.sendMessage({
      action: "saveTab",
      payload: { url, category, description, timestamp, isFavorite },
    });

    // Reset inputs
    inputEl.value = "";
    document.getElementById("favorite-checkbox").checked = false;
    favoriteContainer.style.display = "none";

    // Animate confirm button
    confirmSaveBtn.classList.add("confirmed-glow");

    // Fade out save prompt
    const savePrompt = document.getElementById("save-prompt");
    savePrompt.classList.remove("fadeIn");
    savePrompt.classList.add("fade-out");

    // Button pulse
    tabBtn.classList.add("saved");

    // Clean up after animation
    setTimeout(() => {
      confirmSaveBtn.classList.remove("confirmed-glow");
      confirmSaveBtn.classList.remove("show");
      confirmSaveBtn.style.display = "none";

      tabBtn.classList.remove("saved");
      savePrompt.style.display = "none";
      savePrompt.classList.remove("fade-out");
    }, 1400); // Matches glowPulse duration
  });
});

// Clear all saved tabs and categories
clearBtn.addEventListener("click", () => {
  chrome.storage.local.clear(() => {
    renderLeads([], ulEl);
    renderCategoryOptions([], categoryEl);

    categoryEl.value = "";
    newCategoryEl.value = "";
    emojiPicker.value = "";
    emojiSuggestions.value = "📌";
    categoryEl.dispatchEvent(new Event("change"));
  });
  myLeads = [];
  categories = [];
});

// Add new category
addCategoryBtn.addEventListener("click", () => {
  const newCat = newCategoryEl.value.trim();
  const emoji = document.getElementById("emoji-picker").value.trim() || "📌";

  const pastelColors = ["#f39c12", "#1abc9c", "#9b59b6", "#e67e22", "#3498db"];
  const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
  localStorage.setItem(`color-${newCat}`, color);

  if (newCat && !categories.includes(newCat)) {
    categories.push(newCat);
    saveCategories(categories);

    // Optional: store emoji in a separate map
    localStorage.setItem(`emoji-${newCat}`, emoji);

    renderCategoryOptions(categories, categoryEl);
    categoryEl.value = newCat;
    categoryEl.dispatchEvent(new Event("change"));

    newCategoryEl.value = "";

    emojiPicker.value = "";
    emojiSuggestions.value = "📌";

    addCategoryBtn.classList.add("saved");
    setTimeout(() => addCategoryBtn.classList.remove("saved"), 300);
  }
});

// Show/hide new category input

categoryEl.addEventListener("change", () => {
  const value = categoryEl.value;
  const isCreatingNew = value === "__new__";
  const isValidCategory = value && value !== "__new__";

  // Show/hide new category inputs
  newCategoryEl.style.display = isCreatingNew ? "inline-block" : "none";
  addCategoryBtn.style.display = isCreatingNew ? "inline-block" : "none";
  emojiPicker.style.display = isCreatingNew ? "inline-block" : "none";
  emojiSuggestions.style.display = isCreatingNew ? "inline-block" : "none";
  emojiLabel.style.display = isCreatingNew ? "inline-block" : "none";

  // Show/hide delete button
  deleteCategoryBtn.style.display = isValidCategory ? "inline-block" : "none";

  categoryEl.classList.add("fade-in");
  setTimeout(() => categoryEl.classList.remove("fade-in"), 300);
});

//Delete category

deleteCategoryBtn.addEventListener("click", () => {
  const selectedCat = categoryEl.value;

  if (
    !selectedCat ||
    selectedCat === "__new__" ||
    !categories.includes(selectedCat)
  ) {
    alert(chrome.i18n.getMessage("alert_invalid_category"));
    return;
  }

  const confirmed = confirm(
    chrome.i18n.getMessage("confirm_delete_category", [selectedCat])
  );
  if (confirmed) {
    categories = categories.filter((cat) => cat !== selectedCat);
    myLeads = myLeads.filter((lead) => lead.category !== selectedCat);

    saveCategories(categories);
    saveLeads(myLeads);

    renderCategoryOptions(categories, categoryEl);
    categoryEl.value = categories.length > 0 ? categories[0] : "";
    categoryEl.dispatchEvent(new Event("change"));
  }
});
