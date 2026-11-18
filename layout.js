async function loadNavbar() {
    const response = await fetch("/components/navbar.html");
    const html = await response.text();
    document.getElementById("navbar-placeholder").innerHTML = html;
    document.getElementById("theme-toggle-btn").addEventListener("click", toggleTheme);
        const stored = localStorage.getItem("theme");
    const current = stored ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    updateToggleLabel(current);
}

loadNavbar();