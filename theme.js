function applyTheme(theme) {

    if (theme) {
        document.documentElement.setAttribute("data-theme", theme);
    } else {
        document.documentElement.removeAttribute("data-theme");
    }

}


function toggleTheme() {

    const current = document.documentElement.getAttribute("data-theme");

    // No manual preference yet - check what's currently displayed
    // (based on system setting) and flip to the opposite
    let effectiveCurrent = current;

    if (!effectiveCurrent) {
        const systemPrefersDark =
            window.matchMedia("(prefers-color-scheme: dark)").matches;
        effectiveCurrent = systemPrefersDark ? "dark" : "light";
    }

    const newTheme = effectiveCurrent === "dark" ? "light" : "dark";

    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
    updateToggleLabel(newTheme);

}


function updateToggleLabel(theme) {

    const button = document.getElementById("theme-toggle-btn");

    if (button) {
        button.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
    }

}


// Set the button label correctly once the page loads
document.addEventListener("DOMContentLoaded", () => {

    const stored = localStorage.getItem("theme");
    const current = stored ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    updateToggleLabel(current);

});