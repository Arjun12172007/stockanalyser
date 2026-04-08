// This function MUST be at the top level of your script
function goToAnalysis() {
    const input = document.getElementById("searchInput");
    let ticker = input.value.toUpperCase().trim();
    
    console.log("Button clicked! Ticker is:", ticker); // Check your console for this!

    if (!ticker) {
        alert("Please enter a stock symbol!");
        return;
    }

    // Standardize for Yahoo Finance (India)
    if (!ticker.includes(".")) {
        ticker = ticker + ".NS";
    }

    // The Redirection
    console.log("Redirecting to:", `analysis.html?symbol=${ticker}`);
    window.location.href = `analysis.html?symbol=${ticker}`;
}

// Ensure the table also uses the correct redirect
function quickSearch(symbol) {
    window.location.href = `analysis.html?symbol=${symbol}`;
}

// Important: Make sure your table rows use quickSearch
function renderTable() {
    const tbody = document.getElementById("stockTableBody");
    if (!tbody) return;

    const companies = [
        { name: "Reliance", symbol: "RELIANCE.NS" },
        { name: "TCS", symbol: "TCS.NS" }
    ];

    tbody.innerHTML = companies.map(c => `
        <tr onclick="quickSearch('${c.symbol}')" style="cursor:pointer">
            <td>${c.name}</td>
            <td>${c.symbol}</td>
            <td><button class="btn-sm">Analyze</button></td>
        </tr>
    `).join("");
}

document.addEventListener("DOMContentLoaded", renderTable);