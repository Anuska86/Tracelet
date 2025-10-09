const container = document.getElementById("viewer-container");
const leads = JSON.parse(localStorage.getItem("myLeads")) || [];

if (leads.length === 0) {
  container.innerHTML = "<p>No tabs saved yet.</p>";
} else {
  const grouped = leads.reduce((acc, lead) => {
    acc[lead.category] = acc[lead.category] || [];
    acc[lead.category].push(lead);
    return acc;
  }, {});

  for (const category in grouped) {
    const section = document.createElement("section");
    section.innerHTML = `<h2>${category}</h2><ul></ul>`;
    const ul = section.querySelector("ul");

    grouped[category].forEach((lead) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="${lead.url}" target="_blank">${lead.url}</a>
        ${lead.description ? `<p>${lead.description}</p>` : ""}
        <span>${lead.timestamp}</span>
      `;
      ul.appendChild(li);
    });

    container.appendChild(section);
  }
}
