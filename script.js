function updateClock() {

    const now = new Date();

    document.getElementById("clock").textContent =
        now.toLocaleTimeString();

    document.getElementById("date").textContent =
        now.toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric"
        });

}

updateClock();

setInterval(updateClock, 1000);


function createCalendar() {

    const calendarGrid = document.getElementById("calendar-grid");
    const calendarHeader = document.getElementById("calendar-header");

    const today = new Date();

    const monthName = today.toLocaleString("default", {
        month: "long"
    });

    const year = today.getFullYear();

    calendarHeader.textContent =
        `${monthName} ${year}`;


    calendarGrid.innerHTML = "";

    const firstDay = new Date(
        year,
        today.getMonth(),
        1
    ).getDay();

    for (let i = 0; i < firstDay; i++) {

        const emptyBox = document.createElement("div");

        emptyBox.className = "day empty";

        calendarGrid.appendChild(emptyBox);

}

    const daysInMonth = new Date(
        year,
        today.getMonth() + 1,
        0
    ).getDate();


    for (let day = 1; day <= daysInMonth; day++) {

        const dayBox = document.createElement("div");

        dayBox.className = "day";

        dayBox.innerHTML = `<strong>${day}</strong>`;

        calendarGrid.appendChild(dayBox);

    }

}


createCalendar();