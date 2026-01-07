function createMemberCard(member) {
  const card = document.createElement("div");
  card.className = "team-member";

  const photo = document.createElement("div");
  photo.className = "member-photo";

  if (member.photo) {
    const img = document.createElement("img");
    img.src = member.photo;
    img.alt = member.name;
    photo.appendChild(img);
  } else {
    photo.textContent = member.initials || initialsFromName(member.name);
  }

  const name = document.createElement("div");
  name.className = "member-name";
  name.textContent = member.name;

  card.appendChild(photo);
  card.appendChild(name);

  if (member.email) {
    const email = document.createElement("div");
    email.className = "member-email";
    // keep visible format close to your original ("[at]") style if you want later
    email.textContent = member.email.replace("@", "[at]");
    card.appendChild(email);
  }

  const role = document.createElement("div");
  role.className = "member-role";
  role.textContent = member.role || "";
  card.appendChild(role);

  return card;
}

function initialsFromName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] || "") : "";
  return (first + last).toUpperCase();
}

function createTeamSection(titleText, members) {
  const section = document.createElement("div");
  section.className = "team-section";

  const h2 = document.createElement("h2");
  h2.textContent = titleText;

  const grid = document.createElement("div");
  grid.className = "team-grid";

  (members || []).forEach((m) => grid.appendChild(createMemberCard(m)));

  section.appendChild(h2);
  section.appendChild(grid);
  return section;
}

export function renderTeam(teamData) {
  const container = document.getElementById("teamContent");
  if (!container) return;

  container.innerHTML = "";

  container.appendChild(createTeamSection("Principal Investigators", teamData.principalInvestigators || []));
  container.appendChild(createTeamSection("Postdoctoral Researchers", teamData.postdoctoralResearchers || []));
  container.appendChild(createTeamSection("PhD Students", teamData.phdStudents || []));
  container.appendChild(createTeamSection("Alumni", teamData.alumni || []));
}

export function renderPublications(pubData) {
  const container = document.getElementById("publicationsContent");
  if (!container) return;

  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "publications-year";

  // Highlights
  const hHighlights = document.createElement("h2");
  hHighlights.textContent = "Highlights";
  wrapper.appendChild(hHighlights);

  (pubData.highlights || []).forEach((p) => {
    wrapper.appendChild(createPublicationItem(p.title, p.url));
  });

  // Years
  const byYear = pubData.byYear || {};
  Object.keys(byYear)
    .sort((a, b) => Number(b) - Number(a))
    .forEach((year) => {
      const hYear = document.createElement("h2");
      hYear.textContent = year;
      wrapper.appendChild(hYear);

      (byYear[year] || []).forEach((p) => {
        wrapper.appendChild(createPublicationItem(p.title, p.url));
      });
    });

  container.appendChild(wrapper);
}

function createPublicationItem(title, url) {
  const item = document.createElement("div");
  item.className = "publication-item";

  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = title;

  item.appendChild(a);
  return item;
}
