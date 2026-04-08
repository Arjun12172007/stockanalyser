document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    let symbol = urlParams.get('symbol') || 'TCS';
    symbol = symbol.toUpperCase().replace('.NS', '').replace('.BO', '');

    // Update basic UI immediately
    document.getElementById('symbolTag').innerText = symbol;
    document.getElementById('logoCircle').innerText = symbol.substring(0, 2);

    // Initialize TradingView Chart
    new TradingView.widget({
        "container_id": "tv_chart_container",
        "autosize": true,
        "symbol": `NSE:${symbol}`,
        "interval": "D",
        "timezone": "Asia/Kolkata",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": false,
        "calendar": false,
        "hide_volume": false
    });

    // Fetch stock data using proxy
    fetchStockData(symbol);
});

async function fetchStockData(symbol) {
    const ticker = `${symbol}.NS`;
    
    // Use AllOrigins proxy to bypass CORS
    const apiUrl = `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/quotes?ticker=${ticker}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
    
    try {
        console.log("Fetching:", proxyUrl);
        
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`Proxy error: ${response.status}`);
        }

        const proxyData = await response.json();
        
        // AllOrigins returns data in 'contents' as a string
        const result = JSON.parse(proxyData.contents);
        
        console.log("API Response:", result);

        if (result && result.body && result.body.length > 0) {
            const data = result.body[0];
            updateUI(data, symbol);
        } else {
            console.error("No data in response:", result);
            document.getElementById('companyName').innerText = `${symbol} (No data found)`;
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        document.getElementById('companyName').innerText = `${symbol} (Connection Error)`;
        
        // Try fallback API
        console.log("Trying fallback API...");
        fetchFallbackData(symbol);
    }
}

async function fetchFallbackData(symbol) {
    // Alternative: Use Yahoo Finance directly via different proxy
    const ticker = `${symbol}.NS`;
    const fallbackUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fallbackUrl)}`;
    
    try {
        const response = await fetch(proxyUrl);
        const proxyData = await response.json();
        const data = JSON.parse(proxyData.contents);
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
            const result = data.chart.result[0];
            const meta = result.meta;
            const quote = result.indicators.quote[0];
            const price = meta.regularMarketPrice;
            const prevClose = meta.previousClose || meta.chartPreviousClose;
            const change = price - prevClose;
            const changePercent = (change / prevClose) * 100;
            
            // Update basic info from chart data
            document.getElementById('companyName').innerText = meta.shortName || meta.longName || symbol;
            document.getElementById('mPrice').innerText = `₹${price.toLocaleString('en-IN')}`;
            
            const changeEl = document.getElementById('priceChange');
            const isPos = change >= 0;
            changeEl.innerText = `${isPos ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(2)}%)`;
            changeEl.style.color = isPos ? "#22d17a" : "#f25757";
            
            // Fill what we can
            document.getElementById('wHigh').innerText = meta.fiftyTwoWeekHigh ? "₹" + meta.fiftyTwoWeekHigh : "--";
            document.getElementById('wLow').innerText = meta.fiftyTwoWeekLow ? "₹" + meta.fiftyTwoWeekLow : "--";
            document.getElementById('exchange').innerText = meta.exchangeName || "NSE";
        }
    } catch (err) {
        console.error("Fallback also failed:", err);
    }
}

function updateUI(data, symbol) {
    // Company Name
    document.getElementById('companyName').innerText = data.longName || data.shortName || symbol;
    
    // Current Price
    const price = data.regularMarketPrice;
    document.getElementById('mPrice').innerText = price ? `₹${price.toLocaleString('en-IN')}` : "₹--";
    
    // Price Change
    const changeEl = document.getElementById('priceChange');
    const change = data.regularMarketChange || 0;
    const changePercent = data.regularMarketChangePercent || 0;
    const isPos = change >= 0;
    
    changeEl.innerText = `${isPos ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(2)}%)`;
    changeEl.style.color = isPos ? "#22d17a" : "#f25757";
    
    // Market Cap (in Crores)
    if (data.marketCap) {
        const cr = (data.marketCap / 10000000).toFixed(0);
        document.getElementById('mCap').innerText = cr + " Cr";
    } else {
        document.getElementById('mCap').innerText = "--";
    }
    
    // 52 Week High/Low
    document.getElementById('wHigh').innerText = data.fiftyTwoWeekHigh ? "₹" + data.fiftyTwoWeekHigh : "--";
    document.getElementById('wLow').innerText = data.fiftyTwoWeekLow ? "₹" + data.fiftyTwoWeekLow : "--";
    
    // P/E Ratio
    document.getElementById('peRatio').innerText = data.trailingPE ? data.trailingPE.toFixed(2) : "--";
    
    // Fundamentals
    document.getElementById('divYield').innerText = data.dividendYield ? (data.dividendYield * 100).toFixed(2) + "%" : "--";
    document.getElementById('eps').innerText = data.epsTrailingTwelveMonths ? "₹" + data.epsTrailingTwelveMonths : "--";
    document.getElementById('exchange').innerText = data.exchange || "NSE";
    
    console.log("UI Updated successfully!");
}

// AI Analysis Button Handler
document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById('analysisBtn');
    if (!btn) return;
    
    btn.addEventListener('click', function() {
        const isLoggedIn = sessionStorage.getItem("isLoggedIn");
        const currentSymbol = new URLSearchParams(window.location.search).get('symbol') || 'TCS';
        
        if (isLoggedIn === "true") {
            window.location.href = `deepanalysis.html?symbol=${currentSymbol}`;
        } else {
            const returnUrl = `analysis.html?symbol=${currentSymbol}`;
            alert("🔒 This AI model requires a Pro login.");
            window.location.href = `login.html?redirect=${encodeURIComponent(returnUrl)}`;
        }
    });
});