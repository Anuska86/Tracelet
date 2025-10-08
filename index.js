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

const inputEl = document.getElementById("input-el");

const ulEl = document.getElementById("ul-el");

const leadsFromLocalStorage = JSON.parse(localStorage.getItem("myLeads"));

const clearBtn = document.getElementById("clear-btn");

const inputBtn = document.getElementById("input-btn");

const tabBtn = document.getElementById("tab-btn");

if (leadsFromLocalStorage) {
  myLeads = leadsFromLocalStorage;
  render(myLeads);
}

function render(leads) {
  const grouped = leads.reduce((acc, lead) => {
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
    const timestamp = new Date().toLocaleString();

    if (!myLeads.some((lead) => lead.url === url)) {
      myLeads.push({ url, category, timestamp });
      localStorage.setItem("myLeads", JSON.stringify(myLeads));
      render(myLeads);
    }
  });
});
