const API_BASE = "http://192.168.2.64:5050";

let projects = [];


async function loadProjects() {

    try {

        const response = await fetch(`${API_BASE}/projects`);
        projects = await response.json();

    } catch (error) {

        console.error("Failed to load projects:", error);
        projects = [];

    }

    renderBoard();

}


function makeCard(project) {

    const card = document.createElement("div");
    card.className = "kanban-card";
    card.dataset.id = project.id;

    let buttons = `<button class="delete-btn" onclick="deleteCard('${project.id}')">✕</button>`;

    if (project.column === "completed" && !project.archived) {
        buttons = `<button class="archive-btn" onclick="archiveCard('${project.id}')" title="Send to archive">📦</button>` + buttons;
    }

    card.innerHTML = `<span>${project.title}</span><div class="card-buttons">${buttons}</div>`;

    return card;

}


function renderBoard() {

    // Clear all cells
    document.querySelectorAll(".kanban-cell").forEach(cell => {
        cell.innerHTML = "";
    });

    // Place active (non-archived) cards into their matching cell
    projects
        .filter(p => !p.archived)
        .forEach(project => {

            const cell = document.querySelector(
                `.kanban-cell[data-column="${project.column}"][data-category="${project.category}"]`
            );

            if (cell) {
                cell.appendChild(makeCard(project));
            }

        });

    // Render archive section
    const archiveContainer = document.getElementById("archive-list");
    archiveContainer.innerHTML = "";

    const archived = projects.filter(p => p.archived);

    if (archived.length === 0) {

        archiveContainer.innerHTML = `<div class="no-events">Nothing archived yet</div>`;

    } else {

        archived.forEach(project => {

            const item = document.createElement("div");
            item.className = "archive-item";

            item.innerHTML = `
                <span>${project.title}</span>
                <span class="archive-tag">${project.category}</span>
                <button class="restore-btn" onclick="restoreCard('${project.id}')" title="Restore to Completed">↩️</button>
                <button class="delete-btn" onclick="deleteCard('${project.id}')">✕</button>
            `;

            archiveContainer.appendChild(item);

        });

    }

    initSortable();

}


function initSortable() {

    document.querySelectorAll(".kanban-cell").forEach(cell => {

        new Sortable(cell, {

            group: "kanban",       // shared group name = cards can move between any cell with this name
            animation: 150,
            ghostClass: "kanban-card-ghost",

            onEnd: function (event) {

                const cardId = event.item.dataset.id;
                const newCell = event.to;

                const newColumn = newCell.dataset.column;
                const newCategory = newCell.dataset.category;

                moveCard(cardId, newColumn, newCategory);

            }

        });

    });

}


async function addCard() {

    const titleInput = document.getElementById("new-title");
    const columnSelect = document.getElementById("new-column");
    const categorySelect = document.getElementById("new-category");

    const title = titleInput.value.trim();

    if (!title) return;

    try {

        await fetch(`${API_BASE}/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                column: columnSelect.value,
                category: categorySelect.value
            })
        });

        titleInput.value = "";
        await loadProjects();

    } catch (error) {

        console.error("Failed to add project:", error);

    }

}


async function deleteCard(id) {

    try {

        await fetch(`${API_BASE}/projects/${id}`, { method: "DELETE" });
        await loadProjects();

    } catch (error) {

        console.error("Failed to delete project:", error);

    }

}


async function moveCard(id, newColumn, newCategory) {

    try {

        await fetch(`${API_BASE}/projects/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ column: newColumn, category: newCategory })
        });

        // Update local state without a full reload, so the drag
        // animation doesn't visually "snap" while we wait on the network
        const project = projects.find(p => p.id === id);
        if (project) {
            project.column = newColumn;
            project.category = newCategory;
        }

    } catch (error) {

        console.error("Failed to move project:", error);
        // If the save failed, reload from the server to undo the
        // visual move and reflect what's actually saved
        await loadProjects();

    }

}


async function archiveCard(id) {

    try {

        await fetch(`${API_BASE}/projects/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ archived: true })
        });

        await loadProjects();

    } catch (error) {

        console.error("Failed to archive project:", error);

    }

}


async function restoreCard(id) {

    try {

        await fetch(`${API_BASE}/projects/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ archived: false })
        });

        await loadProjects();

    } catch (error) {

        console.error("Failed to restore project:", error);

    }

}


// Initial load
loadProjects();