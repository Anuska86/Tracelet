document.querySelectorAll("[i18n-content]").forEach((el) => {
  const key = el.getAttribute("i18n-content");
  const message = chrome.i18n.getMessage(key);
  if (message) el.textContent = message;
});
document.querySelectorAll("[i18n-placeholder]").forEach((el) => {
  const key = el.getAttribute("i18n-placeholder");
  const message = chrome.i18n.getMessage(key);
  if (message) el.placeholder = message;
});
