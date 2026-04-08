document.getElementById('analysisBtn').addEventListener('click', function() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
        // ALLOW ACCESS
        alert("Deep Analysis loading...");
        // Your code to show advanced charts/stats goes here
    } else {
        // DENY & REDIRECT
        const currentUrl = window.location.href;
        window.location.href = `login.html?redirect=${encodeURIComponent(currentUrl)}`;
    }
});