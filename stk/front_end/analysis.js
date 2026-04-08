document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    let symbol = urlParams.get('symbol') || 'TCS';
    symbol = symbol.toUpperCase();

    // 1. Chart (This should work regardless)
    new TradingView.widget({
        "container_id": "tv_chart_container",
        "autosize": true,
        "symbol": `NSE:${symbol}`,
        "interval": "D",
        "theme": "dark",
        "style": "1",
        "locale": "en"
    });

    // 2. Fetch the Data
    loadStockData(symbol);
});

async function loadStockData(symbol) {
    const API_KEY = "fdc0e97274msh7f82b22f8971f6ep1ac4cfjsn7ee07a6c9862";
    const ticker = symbol.includes('.') ? symbol : `${symbol}.NS`;
    
    // We use AllOrigins Proxy - it wraps the request so the browser doesn't block it
    const proxy = `https://api.allorigins.win/get?url=`;
    const apiUrl = encodeURIComponent(`https://yahoo-finance15.p.rapidapi.com/api/v1/markets/quotes?ticker=${ticker}`);

    try {
        const response = await fetch(`${proxy}${apiUrl}`, {
            method: 'GET',
            headers: {
                // When using this proxy, we sometimes need to move headers or just let it fly
            }
        });

        // AllOrigins returns the data inside a 'contents' string
        const intermediate = await response.json();
        const result = JSON.parse(intermediate.contents);

        console.log("API DATA ARRIVED:", result);

        if (result && result.body && result.body[0]) {
            const s = result.body[0];
            
            // Update the UI
            document.getElementById('companyName').innerText = s.longName || symbol;
            document.getElementById('mPrice').innerText = `₹${s.regularMarketPrice.toLocaleString('en-IN')}`;
            
            const changeEl = document.getElementById('priceChange');
            const isPos = s.regularMarketChange >= 0;
            changeEl.innerText = `${isPos ? '+' : ''}${s.regularMarketChange.toFixed(2)} (${s.regularMarketChangePercent.toFixed(2)}%)`;
            changeEl.style.color = isPos ? "#22d17a" : "#f25757";

            // Metrics
            document.getElementById('mCap').innerText = (s.marketCap / 10000000).toFixed(0) + " Cr";
            document.getElementById('wHigh').innerText = "₹" + s.fiftyTwoWeekHigh;
            document.getElementById('wLow').innerText = "₹" + s.fiftyTwoWeekLow;
            document.getElementById('peRatio').innerText = s.trailingPE ? s.trailingPE.toFixed(2) : "--";
            
        } else {
            document.getElementById('companyName').innerText = "Stock Details Not Found";
        }
    } catch (err) {
        console.error("Fetch Error:", err);
        document.getElementById('companyName').innerText = "API Error - Check Console";
    }
}