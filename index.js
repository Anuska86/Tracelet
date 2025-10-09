let myLeads = [];

myLeads = [
  {
    url: "https://linkedin.com/in/per-harald-borgen",
    category: "Profiles",
    timestamp: "2025-10-08 16:56",
  },
  {
    url: "https://youtube.com/watch?v=abc123",
    category: "Videos",
    timestamp: "2025-10-08 16:57",
  },
];

let categories = ["Profiles", "Videos", "Articles", "Books"];

const savedCategories = JSON.parse(localStorage.getItem("categories"));
if (savedCategories) categories = savedCategories;

const inputEl = document.getElementById("input-el");

const ulEl = document.getElementById("ul-el");

const categoryEl = document.getElementById("category-el");
renderCategoryOptions();

const newCategoryEl = document.getElementById("new-category-el");

const leadsFromLocalStorage = JSON.parse(localStorage.getItem("myLeads"));

const clearBtn = document.getElementById("clear-btn");

const tabBtn = document.getElementById("tab-btn");

const addCategoryBtn = document.getElementById("add-category-btn");

const deleteCategoryBtn = document.getElementById("delete-category-btn");

if (leadsFromLocalStorage) {
  myLeads = leadsFromLocalStorage;
  render(myLeads);
}

function render(leads) {
  const grouped = leads.reduce((acc, lead) => {
    if (!lead.category) return acc;
    acc[lead.category] = acc[lead.category] || [];
    acc[lead.category].push(lead);
    return acc;
  }, {});

  ulEl.innerHTML = "";

  for (const category in grouped) {
    ulEl.innerHTML += `<h3>${category}</h3><ul>`;
    grouped[category].forEach((lead) => {
      ulEl.innerHTML += `
        <li>
          <a target="_blank" href="${lead.url}">${lead.url}</a>
          ${
            lead.description
              ? `<p class="description">${lead.description}</p>`
              : ""
          }
          <span class="timestamp">${lead.timestamp}</span>
        </li>`;
    });
    ulEl.innerHTML += `</ul>`;
  }
}

//Clear input
clearBtn.addEventListener("click", function () {
  localStorage.clear();
  myLeads = [];
  render(myLeads);
});

//Save tabs
tabBtn.addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;
    const category = categoryEl.value;
    const description = inputEl.value.trim();
    const timestamp = new Date().toLocaleString();

    if (!myLeads.some((lead) => lead.url === url)) {
      myLeads.push({ url, category, description, timestamp });
      localStorage.setItem("myLeads", JSON.stringify(myLeads));
      render(myLeads);
    }

    inputEl.value = "";
  });
});

//Categories
function guessCategory(url) {
  if (url.includes("youtube.com")) return "Videos";
  if (url.includes("linkedin.com")) return "Profiles";
  if (url.includes("medium.com") || url.includes("blog")) return "Articles";
  return "Uncategorized";
}

function renderCategoryOptions() {
  categoryEl.innerHTML = "";
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryEl.appendChild(option);
  });

  const addNewOption = document.createElement("option");
  addNewOption.value = "__new__";
  addNewOption.textContent = "➕ Add new category";
  categoryEl.appendChild(addNewOption);
}

//Add a new category
addCategoryBtn.addEventListener("click", function () {
  const newCat = newCategoryEl.value.trim();
  if (newCat && !categories.includes(newCat)) {
    categories.push(newCat);
    localStorage.setItem("categories", JSON.stringify(categories));
    renderCategoryOptions();
    categoryEl.value = newCat; // auto-select new category
    newCategoryEl.value = "";
    newCategoryEl.style.display = "none";
    addCategoryBtn.style.display = "none";

    addCategoryBtn.classList.add("saved");
    setTimeout(() => addCategoryBtn.classList.remove("saved"), 300);
  }
});

categoryEl.addEventListener("change", function () {
  const isNew = categoryEl.value === "__new__";
  newCategoryEl.style.display = isNew ? "inline-block" : "none";
  addCategoryBtn.style.display = isNew ? "inline-block" : "none";
});

//Delete category

deleteCategoryBtn.addEventListener("click", function () {
  const selectedCat = categoryEl.value;

  if (selectedCat === "__new__") {
    alert("Please select a valid category to delete.");
    return;
  }

  if (categories.includes(selectedCat)) {
    const confirmed = confirm(
      `Are you sure you want to delete the "${selectedCat}" section and all its saved items?`
    );
    if (confirmed) {
      categories = categories.filter((cat) => cat !== selectedCat);
      myLeads = myLeads.filter((lead) => lead.category !== selectedCat);

      localStorage.setItem("categories", JSON.stringify(categories));
      localStorage.setItem("myLeads", JSON.stringify(myLeads));

      renderCategoryOptions();
      render(myLeads);

      categoryEl.value = categories[0] || "__new__"; // fallback
      newCategoryEl.style.display =
        categoryEl.value === "__new__" ? "inline-block" : "none";
      addCategoryBtn.style.display =
        categoryEl.value === "__new__" ? "inline-block" : "none";

      deleteCategoryBtn.classList.add("saved");
      setTimeout(() => deleteCategoryBtn.classList.remove("saved"), 300);
    }
  }
});
