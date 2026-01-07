let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

let events = {}; // loaded from data/events.json

export function setEvents(eventsData) {
  events = eventsData || {};
}

export function initCalendar() {
  renderCalendar();
  showUpcomingEvents();
}

export function previousMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

export function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

export function showEvents(dateStr) {
  const eventDisplay = document.getElementById("eventDisplay");
  if (!eventDisplay) return;

  const date = new Date(dateStr + "T12:00:00");
  const dayOfWeek = date.toLocaleDateString("en-GB", { weekday: "long" });
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (events[dateStr]) {
    let html = `<h3>${dayOfWeek}, ${formattedDate}</h3>`;
    events[dateStr].forEach((event) => {
      html += `
        <div class="event-item">
          <p class="date">${event.time}</p>
          <p>${event.title}</p>
        </div>
      `;
    });
    eventDisplay.innerHTML = html;
  } else {
    eventDisplay.innerHTML = `
      <h3>${dayOfWeek}, ${formattedDate}</h3>
      <p class="no-events">No events scheduled</p>
    `;
  }
}

export function showUpcomingEvents() {
  const eventDisplay = document.getElementById("eventDisplay");
  if (!eventDisplay) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let html = "<h3>Upcoming Events</h3>";
  let hasUpcoming = false;

  const sortedDates = Object.keys(events).sort();
  sortedDates.forEach((dateStr) => {
    const eventDate = new Date(dateStr + "T12:00:00");
    if (eventDate >= today) {
      hasUpcoming = true;
      const dayOfWeek = eventDate.toLocaleDateString("en-GB", { weekday: "long" });
      const formattedDate = eventDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
      });

      events[dateStr].forEach((event) => {
        html += `
          <div class="event-item">
            <p class="date">${dayOfWeek}, ${formattedDate} - ${event.time}</p>
            <p>${event.title}</p>
          </div>
        `;
      });
    }
  });

  if (!hasUpcoming) {
    html += '<p class="no-events">No upcoming events</p>';
  }

  eventDisplay.innerHTML = html;
}

function renderCalendar() {
  const monthYear = document.getElementById("monthYear");
  const calendarGrid = document.getElementById("calendarGrid");
  if (!monthYear || !calendarGrid) return;

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const prevLastDay = new Date(currentYear, currentMonth, 0);

  const firstDayWeek = firstDay.getDay();
  const lastDate = lastDay.getDate();
  const prevLastDate = prevLastDay.getDate();

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  monthYear.textContent = `${months[currentMonth]} ${currentYear}`;

  let html = "";
  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayHeaders.forEach((day) => {
    html += `<div class="calendar-day-header">${day}</div>`;
  });

  for (let i = firstDayWeek; i > 0; i--) {
    html += `<div class="calendar-day other-month">${prevLastDate - i + 1}</div>`;
  }

  const today = new Date();
  for (let day = 1; day <= lastDate; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const hasEvent = events[dateStr] ? "has-event" : "";
    const isToday =
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
        ? "today"
        : "";

    html += `<div class="calendar-day ${hasEvent} ${isToday}" onclick="showEvents('${dateStr}')">${day}</div>`;
  }

  const remainingDays = 42 - (firstDayWeek + lastDate);
  for (let day = 1; day <= remainingDays; day++) {
    html += `<div class="calendar-day other-month">${day}</div>`;
  }

  calendarGrid.innerHTML = html;
}
