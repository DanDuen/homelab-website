async function loadNavbar() {
    const placeholder = document.getElementById("navbar-placeholder");

    try {
        const response = await fetch("/components/navbar.html");

        // fetch only fails on network problems. A 404 or 500 still counts
        // as a "successful" reply, so we have to check the status ourselves.
        if (!response.ok) {
            throw new Error("Navbar request failed with status " + response.status);
        }

        placeholder.innerHTML = await response.text();

        document.getElementById("theme-toggle-btn").addEventListener("click", toggleTheme);

        const stored = localStorage.getItem("theme");
        const current = stored ||
            (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        updateToggleLabel(current);
    } catch (error) {
        console.error(error);
        // Minimal fallback so the visitor is never stranded without navigation.
        placeholder.innerHTML = '<nav><a href="/">Home</a></nav>';
    }
}

loadNavbar();