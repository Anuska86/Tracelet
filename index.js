let myLeads = [];

const inputEl = document.getElementById("input-el");

const ulEl = document.getElementById("ul-el");

const leadsFromLocalStorage = JSON.parse(localStorage.getItem("myLeads"));

const clearBtn = document.getElementById("clear-btn");

const inputBtn = document.getElementById("input-btn");

const tabBtn = document.getElementById("tab-btn");

const tabs = [{ url: "https://www.linkedin.com/in/per-harald-borgen/" }];

if (leadsFromLocalStorage) {
  myLeads = leadsFromLocalStorage;
  render(myLeads);
}

function render(leads) {
  let listItems = "";

  for (i = 0; i < leads.length; i++) {
    listItems += `<li><a target="_blank" href="${leads[i]}">${leads[i]} </a></li>`;
  }
  return (ulEl.innerHTML = listItems);
}

inputBtn.addEventListener("click", function () {
  const inputValue = inputEl.value;
  myLeads.push(inputValue);
  inputEl.value = "";
  localStorage.setItem("myLeads", JSON.stringify(myLeads));
  render(myLeads);
});

clearBtn.addEventListener("click", function () {
  localStorage.clear();
  myLeads = [];
  render(myLeads);
});

tabBtn.addEventListener("click", function () {
  const url = tabs[0].url;
  if (!myLeads.includes(url)) {
    myLeads.push(url);
    localStorage.setItem("myLeads", JSON.stringify(myLeads));
    render(myLeads);
  }
});
