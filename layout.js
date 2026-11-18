// Loads one shared HTML fragment into a placeholder element.
// Returns true if it worked, false if it fell back, so callers
// know whether the fragment's contents can be relied on.
async function loadComponent(url, placeholderId, fallbackHtml) {
    const placeholder = document.getElementById(placeholderId);

    // Not every page has every placeholder. Skip quietly instead of crashing.
    if (!placeholder) {
        return false;
    }

    try {
        const response = await fetch(url);

        // fetch only fails on network problems. A 404 or 500 still counts
        // as a "successful" reply, so we check the status ourselves.
        if (!response.ok) {
            throw new Error(url + " request failed with status " + response.status);
        }

        placeholder.innerHTML = await response.text();
        return true;
    } catch (error) {
        console.error(error);
        placeholder.innerHTML = fallbackHtml;
        return false;
    }
}

// Only the navbar contains the theme button, so this lives apart from
// the generic loader and runs only after the navbar has loaded.
function setupThemeToggle() {
    document.getElementById("theme-toggle-btn").addEventListener("click", toggleTheme);

    const stored = localStorage.getItem("theme");
    const current = stored ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    updateToggleLabel(current);
}

async function init() {
    const navbarLoaded = await loadComponent(
        "/components/navbar.html",
        "navbar-placeholder",
        '<nav><a href="/">Home</a></nav>'
    );

    // The fallback navbar has no theme button, so wiring it up would crash.
    if (navbarLoaded) {
        setupThemeToggle();
    }

    await loadComponent("/components/footer.html", "footer-placeholder", "");
}

init();