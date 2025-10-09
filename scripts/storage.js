export function getLeads() {
  return JSON.parse(localStorage.getItem("myLeads")) || [];
}

export function saveLeads(leads) {
  localStorage.setItem("myLeads", JSON.stringify(leads));
}

export function getCategories() {
  const saved = JSON.parse(localStorage.getItem("categories"));
  return saved && saved.length > 0
    ? saved
    : ["Profiles", "Videos", "Articles", "Books"];
}

export function saveCategories(categories) {
  localStorage.setItem("categories", JSON.stringify(categories));
}
