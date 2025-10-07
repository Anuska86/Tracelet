let myLeads = [];

let listItems = "";

const inputBtn = document.getElementById("input-btn");

const inputEl = document.getElementById("input-el");

const ulEl = document.getElementById("ul-el");

const leadsFromLocalStorage = JSON.parse(localStorage.getItem("myLeads"));

const clearBtn = document.getElementById("clear-btn");

inputBtn.addEventListener("click", function () {
  const inputValue = inputEl.value;
  myLeads.push(inputValue);
  inputEl.value = "";
  localStorage.setItem("myLeads", JSON.stringify(myLeads));
  renderLeads();
});

if (leadsFromLocalStorage) {
  myLeads = leadsFromLocalStorage;
  renderLeads();
  console.log("Retrieved leads:", myLeads);
}

function renderLeads() {
  let listItems = "";

  for (i = 0; i < myLeads.length; i++) {
    listItems += `<li><a target="_blank" href="${myLeads[i]}">${myLeads[i]} </a></li>`;
  }
  return (ulEl.innerHTML = listItems);
}

clearBtn.addEventListener("click", function () {
  localStorage.clear();
  myLeads = [];
  renderLeads();
});
