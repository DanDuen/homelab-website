let calendarEvents = [];


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


        if (
            day === today.getDate()
        ) {
            dayBox.classList.add("today");
        }


        let dateString =
            `${year}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        let eventsForDay = calendarEvents.filter(event => {
            return event.date === dateString;
        });


        let eventHTML = "";


        eventsForDay.forEach(event => {

            eventHTML += `
                <div class="event">
                    <div class="event-time">${event.time}</div>
                    <div class="event-title">${event.title}</div>
                </div>
            `;

        });


        dayBox.innerHTML = `
            <strong>${day}</strong>
            ${eventHTML}
        `;


        calendarGrid.appendChild(dayBox);

    }

}




fetch("calendar.json")
    .then(response => response.json())
    .then(data => {

        calendarEvents = data;

        createCalendar();

    })
    .catch(error => {

        console.error(
            "Calendar loading error:",
            error
        );

        createCalendar();

    });