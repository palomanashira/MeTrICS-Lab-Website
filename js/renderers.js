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

function formatDateLong(isoDate) {
  if (!isoDate) return "TBD";
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateRange(startIso, endIso) {
  if (!startIso && !endIso) return "TBD";
  if (startIso && !endIso) return formatDateLong(startIso);
  if (!startIso && endIso) return formatDateLong(endIso);

  const start = new Date(startIso + "T12:00:00");
  const end = new Date(endIso + "T12:00:00");

  const startTxt = start.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const endTxt = end.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return `${startTxt} → ${endTxt}`;
}

function daysUntil(isoDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = new Date(isoDate + "T12:00:00");
  d.setHours(0, 0, 0, 0);

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((d - today) / msPerDay);
}

function conferenceHasOccurred(conf) {
  // Conference is considered "occurred" only after the last conference day has passed.
  // If dateEnd exists, use that; else use dateStart; if neither exists, keep it.
  const endIso = conf?.dateEnd || conf?.dateStart;
  if (!endIso) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(endIso + "T12:00:00");
  end.setHours(0, 0, 0, 0);

  // Remove only if conference ended before today
  return end < today;
}

export function renderConferences(conferences) {
  const container = document.getElementById("conferencesContent");
  if (!container) return;

  container.innerHTML = "";

  // --- Countdown widgets ---
  const countdownBox = document.createElement("div");
  countdownBox.className = "resources-box";
  countdownBox.innerHTML = `
    <h2>Deadlines</h2>
    <div class="conference-grid" id="conferenceGrid"></div>
  `;
  container.appendChild(countdownBox);

  const grid = countdownBox.querySelector("#conferenceGrid");

  // Sort: upcoming deadlines first, then past, then TBD
  const visible = [...(conferences || [])].filter((c) => !conferenceHasOccurred(c));

  const sorted = visible.sort((a, b) => {
    const ad = a.deadline ? new Date(a.deadline + "T12:00:00").getTime() : Infinity;
    const bd = b.deadline ? new Date(b.deadline + "T12:00:00").getTime() : Infinity;
    return ad - bd;
  });

  sorted.forEach((c) => {
    const card = document.createElement("div");
    card.className = "conference-card";

    const name = c.name || "Unnamed";
    const deadlineTxt = formatDateLong(c.deadline);
    const hasDeadline = Boolean(c.deadline);

    let countdownLine = "Deadline: TBD";
    let countdownClass = "conference-countdown";

    if (hasDeadline) {
      const d = daysUntil(c.deadline);

      if (d < 0) {
        countdownLine = "Deadline passed";
        countdownClass += " closed";
      } else if (d === 0) {
        countdownLine = "Deadline is today";
      } else if (d === 1) {
        countdownLine = "1 day to deadline";
      } else {
        countdownLine = `${d} days to deadline`;
      }
    }

    card.innerHTML = `
      <div class="conference-name">${name}</div>
      <div class="conference-deadline">Deadline: ${deadlineTxt}</div>
      <div class="${countdownClass}">${countdownLine}</div>
    `;

    grid.appendChild(card);
  });

  // --- Table ---
  const tableBox = document.createElement("div");
  tableBox.className = "news-box-full";
  tableBox.innerHTML = `
    <h2>Details</h2>
    <div style="overflow-x:auto;">
      <table class="conference-table">
        <thead>
          <tr>
            <th>Conference</th>
            <th>Deadline</th>
            <th>Conference dates</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody id="conferenceTableBody"></tbody>
      </table>
    </div>
  `;
  container.appendChild(tableBox);

  const tbody = tableBox.querySelector("#conferenceTableBody");

  sorted.forEach((c) => {
    const tr = document.createElement("tr");

    const name = c.name || "";
    const deadline = formatDateLong(c.deadline);
    const dates = formatDateRange(c.dateStart, c.dateEnd);
    const location = (c.location && c.location.trim()) ? c.location : "TBD";

    tr.innerHTML = `
      <td>${name}</td>
      <td>${deadline}</td>
      <td>${dates}</td>
      <td>${location}</td>
    `;

    tbody.appendChild(tr);
  });
}

