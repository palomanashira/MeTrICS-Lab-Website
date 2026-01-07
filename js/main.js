import { showPage } from "./pages.js";
import { setEvents, initCalendar, previousMonth, nextMonth, showEvents } from "./calendar.js";
import { renderTeam, renderPublications, renderConferences } from "./renderers.js";

// Expose functions globally because your HTML uses inline onclick/onsubmit
window.showPage = showPage;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.showEvents = showEvents;
window.sendEmail = sendEmail;

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function init() {
  try {
    const [eventsData, teamData, publicationsData, conferencesData] = await Promise.all([
    loadJSON("data/events.json"),
    loadJSON("data/team.json"),
    loadJSON("data/publications.json"),
    loadJSON("data/conferences.json")
  ]);

  setEvents(eventsData);
  initCalendar();

  renderTeam(teamData);
  renderPublications(publicationsData);
  renderConferences(conferencesData);

  } catch (err) {
    console.error(err);

    // Keep the site usable even if data fails to load
    try {
      initCalendar();
    } catch (_) {}

    const teamEl = document.getElementById("teamContent");
    if (teamEl) teamEl.innerHTML = `<p class="no-events">Could not load team data.</p>`;

    const pubsEl = document.getElementById("publicationsContent");
    if (pubsEl) pubsEl.innerHTML = `<p class="no-events">Could not load publications data.</p>`;

    const confEl = document.getElementById("conferencesContent");
    if (confEl) confEl.innerHTML = `<p class="no-events">Could not load conferences data.</p>`;

  }
}

function sendEmail(event) {
  event.preventDefault();
  const form = event.target;

  const name = form.elements[0].value;
  const email = form.elements[1].value;
  const subject = form.elements[2].value;
  const message = form.elements[3].value;

  const mailtoLink =
    `mailto:nashira.baena@kcl.ac.uk?subject=${encodeURIComponent(subject)}&body=` +
    encodeURIComponent(`From: ${name} (${email})\n\n${message}`);

  window.location.href = mailtoLink;
}

init();
