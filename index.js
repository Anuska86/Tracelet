let myLeads = ["www.awesomelead.com", "www.epiclead.com", "www.greatlead.com"];

const inputBtn = document.getElementById("input-btn");

const inputEl = document.getElementById("input-el");

const ulEl = document.getElementById("ul-el");

inputBtn.addEventListener("click", function () {
  const inputValue = inputEl.value;

  myLeads.push(inputValue);
});

for (i = 0; i < myLeads.length; i++) {
  console.log(myLeads[i]);
}
