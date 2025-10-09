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

const newCategoryEl = document.getElementById("new-category-el");

const leadsFromLocalStorage = JSON.parse(localStorage.getItem("myLeads"));

const clearBtn = document.getElementById("clear-btn");

const tabBtn = document.getElementById("tab-btn");

const addCategoryBtn = document.getElementById("add-category-btn");

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

//Save Input
inputBtn.addEventListener("click", function () {
  const inputValue = inputEl.value;
  const category = categoryEl.value;
  const timestamp = new Date().toLocaleString();

  myLeads.push({ url: inputValue, category, timestamp });
  inputEl.value = "";
  localStorage.setItem("myLeads", JSON.stringify(myLeads));
  render(myLeads);

  inputBtn.classList.add("saved");
  setTimeout(() => inputBtn.classList.remove("saved"), 300);
});

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
}

addCategoryBtn.addEventListener("click", function () {
  const newCat = newCategoryEl.value.trim();
  if (newCat && !categories.includes(newCat)) {
    categories.push(newCat);
    localStorage.setItem("categories", JSON.stringify(categories));
    renderCategoryOptions();
    newCategoryEl.value = "";
    categoryEl.value = newCat;

    addCategoryBtn.classList.add("saved");
    setTimeout(() => addCategoryBtn.classList.remove("saved"), 300);
  }
});
