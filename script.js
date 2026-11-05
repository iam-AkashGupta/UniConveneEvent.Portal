// Initial Campus Events Data (Simple & Easy to Explain)
let eventsList = [
    {
        id: 1,
        title: "Annual Tech Fest 2026",
        category: "College Fest",
        date: "2026-11-20",
        venue: "Main Auditorium",
        bookedSeats: 42,
        totalSeats: 50
    },
    {
        id: 2,
        title: "Web Development Workshop",
        category: "Workshop",
        date: "2026-11-22",
        venue: "Block 34, Lab 201",
        bookedSeats: 25,
        totalSeats: 30
    },
    {
        id: 3,
        title: "Coding Quiz Competition",
        category: "Competition",
        date: "2026-11-25",
        venue: "Seminar Hall 2",
        bookedSeats: 19,
        totalSeats: 20
    },
    {
        id: 4,
        title: "Photography Club Meet",
        category: "Club Activity",
        date: "2026-11-28",
        venue: "Student Activity Center",
        bookedSeats: 12,
        totalSeats: 25
    }
];

let currentCategory = "All";
let registrationCounter = 102;

// 1. Display Events on the Page and Update Dashboard
function renderEvents() {
    const container = document.getElementById("events-container");
    container.innerHTML = "";

    for (let i = 0; i < eventsList.length; i++) {
        let ev = eventsList[i];

        // Check category filter
        if (currentCategory !== "All" && ev.category !== currentCategory) {
            continue;
        }

        let remainingSeats = ev.totalSeats - ev.bookedSeats;
        let isFull = remainingSeats <= 0;

        let card = document.createElement("div");
        card.className = "event-card";

        card.innerHTML = `
            <span class="event-tag">${ev.category}</span>
            <h3>${ev.title}</h3>
            <p class="event-info"><strong>Date:</strong> ${ev.date}</p>
            <p class="event-info"><strong>Venue:</strong> ${ev.venue}</p>
            <div class="seat-box">
                <p><strong>Live Seat Count:</strong> ${ev.bookedSeats} / ${ev.totalSeats} Booked</p>
                <p class="${isFull ? 'seat-full' : 'seat-open'}">
                    ${isFull ? 'Status: Seat Limit Reached (Full)' : 'Seats Remaining: ' + remainingSeats}
                </p>
            </div>
            ${isFull 
                ? `<button class="disabled-btn" disabled>Registration Closed</button>` 
                : `<button class="primary-btn full-width" onclick="openRegisterModal(${ev.id})">Register Now</button>`
            }
        `;

        container.appendChild(card);
    }

    updateDashboard();
}

// 2. Filter Events When Clicking the Right Category Box
function filterEvents(categoryName) {
    currentCategory = categoryName;
    document.getElementById("active-filter-text").innerText = "Showing: " + categoryName;
    renderEvents();
    scrollToSection("events-section");
}

// 3. Open and Close Student Registration Modal
function openRegisterModal(eventId) {
    let selectedEvent = eventsList.find(item => item.id === eventId);
    document.getElementById("register-event-id").value = eventId;
    document.getElementById("selected-event-name").innerText = "Event: " + selectedEvent.title;
    document.getElementById("register-modal").classList.remove("hidden");
}

function closeRegisterModal() {
    document.getElementById("register-modal").classList.add("hidden");
}

// 4. Submit Student Registration & Live Seat Update
function submitStudentRegistration(e) {
    e.preventDefault();

    let eventId = parseInt(document.getElementById("register-event-id").value);
    let studentName = document.getElementById("student-name").value;
    let studentRoll = document.getElementById("student-roll").value;

    let ev = eventsList.find(item => item.id === eventId);

    if (ev && ev.bookedSeats < ev.totalSeats) {
        ev.bookedSeats = ev.bookedSeats + 1;
        let regId = "#UC" + registrationCounter;
        registrationCounter++;

        // Add student to Admin Registration Table
        let tableBody = document.getElementById("registered-students-table");
        let newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${regId}</td>
            <td>${studentName}</td>
            <td>${studentRoll}</td>
            <td>${ev.title}</td>
        `;
        tableBody.appendChild(newRow);

        // Show Confirmation Banner
        let confirmBanner = document.getElementById("confirmation-banner");
        let confirmMsg = document.getElementById("confirmation-message");
        confirmMsg.innerText = ` ${studentName} (${studentRoll}) registered for ${ev.title}. Confirmation ID: ${regId}`;
        confirmBanner.classList.remove("hidden");

        // Add Notification
        addNotification(`New Registration: ${studentName} joined "${ev.title}".`);
        if (ev.bookedSeats === ev.totalSeats) {
            addNotification(`Seat Limit Reached: "${ev.title}" is now 100% full.`);
        }

        // Reset form and refresh UI
        document.getElementById("student-name").value = "";
        document.getElementById("student-roll").value = "";
        document.getElementById("student-dept").value = "";
        closeRegisterModal();
        renderEvents();
    }
}

function closeConfirmation() {
    document.getElementById("confirmation-banner").classList.add("hidden");
}

// 5. Update Organizer / Admin Dashboard
function updateDashboard() {
    let adminTable = document.getElementById("admin-event-table");
    adminTable.innerHTML = "";

    let totalBooked = 0;
    let totalRemaining = 0;

    for (let i = 0; i < eventsList.length; i++) {
        let ev = eventsList[i];
        totalBooked += ev.bookedSeats;
        totalRemaining += (ev.totalSeats - ev.bookedSeats);

        let statusText = (ev.bookedSeats >= ev.totalSeats) ? "Full" : "Open";

        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${ev.title}</td>
            <td>${ev.bookedSeats} / ${ev.totalSeats}</td>
            <td>${statusText}</td>
            <td>
                <button class="small-btn" onclick="addFiveSeats(${ev.id})">+5 Seats</button>
            </td>
        `;
        adminTable.appendChild(row);
    }

    document.getElementById("stat-total-events").innerText = eventsList.length;
    document.getElementById("stat-total-booked").innerText = totalBooked;
    document.getElementById("stat-seats-left").innerText = totalRemaining;
}

// 6. Organizer Feature: Add 5 Extra Seats to an Event
function addFiveSeats(eventId) {
    let ev = eventsList.find(item => item.id === eventId);
    if (ev) {
        ev.totalSeats += 5;
        addNotification(`Organizer increased seat limit of "${ev.title}" by 5 seats.`);
        renderEvents();
    }
}

// 7. Organizer Feature: Create a New Event
function createNewEvent(e) {
    e.preventDefault();

    let title = document.getElementById("new-title").value;
    let category = document.getElementById("new-category").value;
    let date = document.getElementById("new-date").value;
    let venue = document.getElementById("new-venue").value;
    let seats = parseInt(document.getElementById("new-seats").value);

    let newEventObj = {
        id: eventsList.length + 1,
        title: title,
        category: category,
        date: date,
        venue: venue,
        bookedSeats: 0,
        totalSeats: seats
    };

    eventsList.push(newEventObj);
    addNotification(`New Event Created: "${title}" (${seats} seats).`);

    // Clear form
    document.getElementById("create-event-form").reset();
    renderEvents();
}

// 8. Notifications Helper
function toggleNotifications() {
    let box = document.getElementById("notification-box");
    box.classList.toggle("hidden");
}

function addNotification(message) {
    let list = document.getElementById("notification-list");
    let item = document.createElement("li");
    item.innerText = message;
    list.prepend(item);

    let countSpan = document.getElementById("notif-count");
    countSpan.innerText = list.children.length;
}

// 9. Simple Login Functionality
function openLoginModal() {
    document.getElementById("login-modal").classList.remove("hidden");
}

function closeLoginModal() {
    document.getElementById("login-modal").classList.add("hidden");
}

function handleLogin(e) {
    e.preventDefault();
    let role = document.getElementById("login-role").value;
    let userId = document.getElementById("login-userid").value;

    document.getElementById("logged-user-Text").innerText = `Logged in as: ${userId} (${role})`;
    document.getElementById("login-nav-btn").innerText = `${userId} (${role})`;

    addNotification(`User "${userId}" logged in as ${role}.`);
    closeLoginModal();

    if (role === "Organizer") {
        scrollToSection("dashboard-section");
    }
}

// 10. Smooth Scroll to Section
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: "smooth" });
}

// Load events when page opens
window.onload = function() {
    renderEvents();
};