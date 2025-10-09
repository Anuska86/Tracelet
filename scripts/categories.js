function guessCategory(url) {
  if (url.includes("youtube.com")) return "Videos";
  if (url.includes("linkedin.com")) return "Profiles";
  if (url.includes("medium.com") || url.includes("blog")) return "Articles";
  return "Uncategorized";
}
