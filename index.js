let myLeads = [];

let listItems = "";

const inputBtn = document.getElementById("input-btn");

const inputEl = document.getElementById("input-el");

const ulEl = document.getElementById("ul-el");

inputBtn.addEventListener("click", function () {
  const inputValue = inputEl.value;
  myLeads.push(inputValue);
  inputEl.value = "";
  renderLeads();
});

function renderLeads() {
  for (i = 0; i < myLeads.length; i++) {
    listItems += "<li>" + myLeads[i] + "</li>";
  }
  return (ulEl.innerHTML = listItems);
}
