export async function getLeads() {
  return new Promise((resolve) => {
    if (!chrome.storage || !chrome.storage.local) {
      console.warn("chrome.storage.local is not available");
      resolve([]);
      return;
    }

    chrome.storage.local.get(["myLeads"], (result) => {
      resolve(result.myLeads || []);
    });
  });
}

export function saveLeads(leads) {
  localStorage.setItem("myLeads", JSON.stringify(leads));
}

export function getCategories() {
  const saved = JSON.parse(localStorage.getItem("categories"));
  return saved && saved.length > 0
    ? saved
    : ["Profiles", "Videos", "Articles", "Books", "Uncategorized"];
}

export function saveCategories(categories) {
  localStorage.setItem("categories", JSON.stringify(categories));
}
