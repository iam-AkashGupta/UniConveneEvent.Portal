let eventsData = [
    {
        id: 1,
        title: "Annual Robotics League",
        category: "Signature Gathering",
        date: "Nov 20, 2026",
        venue: "Innovation Arena, Block 34",
        booked: 48,
        total: 50
    },
    {
        id: 2,
        title: "Web Development Technical Lab",
        category: "Talk / Salon",
        date: "Nov 22, 2026",
        venue: "Computer Centre, Lab 201",
        booked: 29,
        total: 30
    },
    {
        id: 3,
        title: "Inter-Department Coding League",
        category: "Showcase",
        date: "Nov 25, 2026",
        venue: "Seminar Hall 2",
        booked: 20,
        total: 20
    },
    {
        id: 4,
        title: "Photography Society Chapter Meet",
        category: "Club Circle",
        date: "Nov 28, 2026",
        venue: "Student Activity Centre",
        booked: 14,
        total: 25
    }
];

let currentUser = null;
let currentFilter = "All";
let regTicketCounter = 903;
let reservations = [];

const EVENTS_STORAGE_KEY = "uniconvene-events";
const RESERVATIONS_STORAGE_KEY = "uniconvene-reservations";
const USER_STORAGE_KEY = "uniconvene-user";
const TICKET_STORAGE_KEY = "uniconvene-ticket-counter";

function loadSavedData() {
    const savedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
    const savedReservations = localStorage.getItem(RESERVATIONS_STORAGE_KEY);
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    const savedTicketCounter = Number(localStorage.getItem(TICKET_STORAGE_KEY));

    if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        if (Array.isArray(parsedEvents) && parsedEvents.length > 0) {
            eventsData = parsedEvents;
        }
    }

    if (savedReservations) {
        const parsedReservations = JSON.parse(savedReservations);
        if (Array.isArray(parsedReservations)) {
            reservations = parsedReservations;
        }
    }

    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.name && parsedUser.roll && parsedUser.dept) {
            currentUser = parsedUser;
        }
    }

    if (Number.isInteger(savedTicketCounter) && savedTicketCounter >= 903) {
        regTicketCounter = savedTicketCounter;
    }
}

function saveAppData() {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(eventsData));
    localStorage.setItem(RESERVATIONS_STORAGE_KEY, JSON.stringify(reservations));
    localStorage.setItem(TICKET_STORAGE_KEY, String(regTicketCounter));
    if (currentUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    }
}

// 1. Render Event Cards with Live Seat Count
function renderEventsGrid() {
    const container = document.getElementById("events-grid");
    container.innerHTML = "";

    const filtered = currentFilter === "All" 
        ? eventsData 
        : eventsData.filter(e => e.category === currentFilter);

    document.getElementById("dir-count-text").innerText = `SHOWING ${filtered.length} GATHERINGS`;

    filtered.forEach(ev => {
        const remaining = ev.total - ev.booked;
        const isFull = remaining <= 0;
        const percent = Math.round((ev.booked / ev.total) * 100);

        const card = document.createElement("div");
        card.className = "clean-event-card";

        card.innerHTML = `
            <div>
                <span class="event-category-tag">${ev.category}</span>
                <h3 class="event-card-title">${ev.title}</h3>
                <p class="event-meta-row"><strong>When:</strong> ${ev.date}</p>
                <p class="event-meta-row"><strong>Venue:</strong> ${ev.venue}</p>
            </div>

            <div>
                <div class="seat-status-box">
                    <div class="seat-label-line">
                        <span>Live capacity</span>
                        <span>${ev.booked} / ${ev.total}</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill ${isFull ? 'danger' : ''}" style="width: ${percent}%;"></div>
                    </div>
                    <span class="seat-state-text ${isFull ? 'full' : ''}">
                        ${isFull ? '● Fully reserved' : `● ${remaining} places available`}
                    </span>
                </div>

                ${isFull 
                    ? `<button class="card-action-btn" disabled>Reservations closed</button>`
                    : `<button class="card-action-btn" onclick="openBookingModal(${ev.id})">Reserve a place →</button>`
                }
            </div>
        `;

        container.appendChild(card);
    });

    updateDashboardMetrics();
}

// 2. Filter Category via Chips
function filterCategory(cat, element) {
    currentFilter = cat;
    document.querySelectorAll(".chip-btn").forEach(btn => btn.classList.remove("active"));
    if (element) element.classList.add("active");
    renderEventsGrid();
}

// 3. Category Click from Hero Blue Box
function filterAndScroll(cat) {
    currentFilter = cat;
    const categoryLabels = {
        "Signature Gathering": "Flagship fests",
        "Talk / Salon": "Tech labs",
        "Showcase": "Competitions",
        "Club Circle": "Society chapters"
    };
    document.querySelectorAll(".chip-btn").forEach(btn => {
        if (btn.innerText.includes(categoryLabels[cat] || cat)) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    renderEventsGrid();
    document.getElementById("events").scrollIntoView({ behavior: "smooth" });
}

// 4. Modal Handlers
function openGetStartedModal() {
    document.getElementById("modal-title").innerText = "Create your student event profile";
    document.getElementById("auth-modal").classList.remove("hidden");
}

function openLoginModal() {
    document.getElementById("modal-title").innerText = "Member sign in";
    document.getElementById("auth-modal").classList.remove("hidden");
}

function closeAuthModal() {
    document.getElementById("auth-modal").classList.add("hidden");
}

function handleAccountCreation(e) {
    e.preventDefault();
    const name = document.getElementById("acc-name").value.trim();
    const roll = document.getElementById("acc-roll").value.trim();
    const dept = document.getElementById("acc-dept").value.trim();

    if (!name || !roll || !dept) {
        showToast("Please complete all student profile fields.");
        return;
    }

    currentUser = { name, roll, dept };
    saveAppData();

    closeAuthModal();
    showToast(`Welcome ${name}! Your student profile is ready.`);
    document.getElementById("events").scrollIntoView({ behavior: "smooth" });
}

// 5. Booking Modal Handlers
function openBookingModal(eventId) {
    const ev = eventsData.find(item => item.id === eventId);
    if (!ev) {
        showToast("This event is no longer available.");
        return;
    }

    document.getElementById("booking-event-id").value = eventId;
    document.getElementById("booking-event-title").innerText = `Reserving a place for: ${ev.title} (${ev.category})`;

    document.getElementById("book-name").value = currentUser ? currentUser.name : "";
    document.getElementById("book-roll").value = currentUser ? currentUser.roll : "";
    document.getElementById("book-dept").value = currentUser ? currentUser.dept : "";

    document.getElementById("booking-modal").classList.remove("hidden");
}

function closeBookingModal() {
    document.getElementById("booking-modal").classList.add("hidden");
}

function submitEventBooking(e) {
    e.preventDefault();
    const eventId = parseInt(document.getElementById("booking-event-id").value);
    const name = document.getElementById("book-name").value.trim();
    const roll = document.getElementById("book-roll").value.trim();
    const dept = document.getElementById("book-dept").value.trim();

    if (!name || !roll || !dept) {
        showToast("Please complete all reservation fields.");
        return;
    }

    const ev = eventsData.find(item => item.id === eventId);
    if (!ev) {
        showToast("This event is no longer available.");
        return;
    }

    if (ev.booked >= ev.total) {
        closeBookingModal();
        renderEventsGrid();
        showToast("Reservations for this event are closed.");
        return;
    }

    const normalizedRoll = roll.toLowerCase();
    const alreadyRegistered = reservations.some(reservation =>
        reservation.eventId === eventId &&
        reservation.roll.toLowerCase() === normalizedRoll
    );

    if (alreadyRegistered) {
        showToast("This roll number is already registered for this event.");
        return;
    }

    ev.booked += 1;
    const ticketId = `#UC-${regTicketCounter++}`;
    reservations.unshift({
        ticketId,
        eventId,
        eventTitle: ev.title,
        name,
        roll,
        dept,
        registeredAt: new Date().toISOString()
    });

    currentUser = { name, roll, dept };
    saveAppData();
    closeBookingModal();
    e.target.reset();
    renderEventsGrid();
    renderRegisteredStudents();
    showToast(`Reservation confirmed. Your pass ID is ${ticketId}`);
}

function renderRegisteredStudents() {
    const tbody = document.getElementById("admin-students-table");
    tbody.innerHTML = "";

    reservations.forEach(reservation => {
        const row = document.createElement("tr");
        [reservation.ticketId, reservation.name, reservation.roll, reservation.eventTitle]
            .forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
        tbody.appendChild(row);
    });
}

// 6. Update Dashboard Tables and Metrics
function updateDashboardMetrics() {
    let totalBooked = 0;
    let totalCap = 0;

    const tbody = document.getElementById("admin-seats-table");
    tbody.innerHTML = "";

    eventsData.forEach(ev => {
        totalBooked += ev.booked;
        totalCap += ev.total;

        const isFull = ev.booked >= ev.total;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${ev.title}</strong></td>
            <td>${ev.booked} / ${ev.total}</td>
            <td><span class="${isFull ? 'seat-state-text full' : 'seat-state-text'}">${isFull ? 'Full' : 'Open'}</span></td>
            <td>
                <button class="mini-btn" onclick="increaseCapacity(${ev.id})">+5 places</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById("metric-total-events").innerText = eventsData.length;
    document.getElementById("metric-booked").innerText = totalBooked;
    document.getElementById("metric-available").innerText = (totalCap - totalBooked);
}

// 7. Organizer: Increase Seat Capacity
function increaseCapacity(eventId) {
    const ev = eventsData.find(item => item.id === eventId);
    if (ev) {
        ev.total += 5;
        saveAppData();
        renderEventsGrid();
        showToast(`Added 5 places to "${ev.title}".`);
    }
}

// 8. Toast Helper
function showToast(msg) {
    const toast = document.getElementById("notif-toast");
    document.getElementById("toast-message").innerText = msg;
    toast.classList.remove("hidden");
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 4000);
}

function closeToast() {
    document.getElementById("notif-toast").classList.add("hidden");
}

function openEventPhoto() {
    document.getElementById("event-photo-modal").classList.remove("hidden");
}

function closeEventPhoto(event) {
    if (!event || event.target === document.getElementById("event-photo-modal")) {
        document.getElementById("event-photo-modal").classList.add("hidden");
    }
}

window.onload = function() {
    loadSavedData();
    renderEventsGrid();
    renderRegisteredStudents();
};