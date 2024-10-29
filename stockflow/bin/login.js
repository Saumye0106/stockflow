function displayCompanyPopup(companyData, quoteData) {
    const popup = document.createElement('div');
    popup.className = 'company-popup';
    popup.id = 'companyPopup';

    const changePercent = ((quoteData.d / quoteData.pc) * 100).toFixed(2);
    const changeColor = parseFloat(changePercent) >= 0 ? 'green' : 'red';

    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                ${companyData.logo ? `<img src="${companyData.logo}" alt="${companyData.name} logo" class="company-logo">` : ''}
                <h1 class="popup-title">${companyData.name} (${companyData.ticker})</h1>
            </div>
            <p class="stock-price">Price: $${quoteData.c.toFixed(2)} <span style="color: ${changeColor}">${changePercent}%</span></p>
            <p><strong>Industry:</strong> ${companyData.finnhubIndustry}</p>
            <p><strong>Country:</strong> ${companyData.country}</p>
            <p><strong>Currency:</strong> ${companyData.currency}</p>
            <p><strong>Exchange:</strong> ${companyData.exchange}</p>
            <p><strong>Market Cap:</strong> $${(companyData.marketCapitalization / 1000).toFixed(2)} billion</p>
            <p><strong>Outstanding Shares:</strong> ${companyData.shareOutstanding.toLocaleString()}</p>
            <p><strong>IPO Date:</strong> ${companyData.ipo}</p>
            <p><strong>Phone:</strong> ${companyData.phone}</p>
            <p><strong>Website:</strong> <a href="${companyData.weburl}" target="_blank">${companyData.weburl}</a></p>
            <button id="closePopupBtn">Close</button>
        </div>
    `;

    document.body.appendChild(popup);

    // Add event listener to the close button
    document.getElementById('closePopupBtn').addEventListener('click', closePopup);

    // Close the popup when clicking outside of it
    popup.addEventListener('click', function(event) {
        if (event.target === popup) {
            closePopup();
        }
    });
}

function closePopup() {
    const popup = document.getElementById('companyPopup');
    if (popup) {
        popup.remove();
    }
}
async function fetchBasicFinancials(symbol) {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=cscchthr01qgt32f7m1gcscchthr01qgt32f7m20`);
        const data = await response.json();

        if (data.metric) {
            const financialDataContainer = document.getElementById('financial-data-container');
            financialDataContainer.innerHTML = ''; // Clear previous data

            const metrics = [
                { name: 'Market Cap', value: formatMarketCap(data.metric.marketCapitalization * 1000000) },
                { name: 'P/E Ratio', value: data.metric.peBasicExclExtraTTM?.toFixed(2) || 'N/A' },
                { name: '52W High', value: formatNumber(data.metric['52WeekHigh']) },
                { name: '52W Low', value: formatNumber(data.metric['52WeekLow']) },
                { name: 'Revenue', value: formatMarketCap(data.metric.revenuePerShareTTM * data.metric.marketCapitalization) },
                { name: 'Gross Profit', value: formatMarketCap(data.metric.grossMarginTTM * data.metric.revenuePerShareTTM * data.metric.marketCapitalization / 100) },

            ];

            metrics.forEach(metric => {
                const box = document.createElement('div');
                box.className = 'financial-box';
                box.innerHTML = `
                    <h3>${metric.name}</h3>
                    <p>${metric.value}</p>
                `;
                financialDataContainer.appendChild(box);
            });

            financialDataContainer.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error fetching basic financials:', error);
        document.getElementById('financial-data-container').innerHTML = '<p class="error">Failed to fetch financial data.</p>';
    }
}

// Helper functions (add these if not already present)
function formatMarketCap(value) {
    return `$${(value / 1000000000).toFixed(2)}B`;
}

function formatNumber(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }).format(value);
}

const symbolInput = document.querySelector('#symbol');
const stockList = document.querySelector('#stock-list');


// Show loading indicator
function showLoading() {
    stockList.innerHTML = '<li class="loading">Stock Financials</li>';
}

// Function to fetch stock data for multiple symbols
function fetchTopStocks() {
    const topStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NFLX', 'NVDA', 'BRK.B', 'JNJ'];
    const requests = topStocks.map(symbol =>
        fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=cscchthr01qgt32f7m1gcscchthr01qgt32f7m20`)
    );

    Promise.all(requests)
        .then(responses => Promise.all(responses.map(res => res.json())))
        .then(dataArray => {
            let html = '<div class="stock-bubbles">';
            dataArray.forEach((data, index) => {
                const symbol = topStocks[index];
                if (data.c) {
                    const changePercent = ((data.d / data.pc) * 100).toFixed(2);
                    const changeColor = parseFloat(changePercent) >= 0 ? 'green' : 'red';
                    html += `
                    <div class="stock-bubble" style="background-color: ${changeColor === 'green' ? '#d4edda' : '#f8d7da'};">
                        <span class ="stock-symbol">${symbol}</span>
                        <span class="stock-price">Price: $${data.c.toFixed(2)}</span>
                        <span class="stock-change" style="color: ${changeColor}">${changePercent}%</span>
                    </div>
                    `;
                } else {
                    html += `<div class="error">Invalid Symbol: ${symbol}</div>`;
                }
            });
            html += '</div>';
            stockList.innerHTML = html;
        })
        .catch(error => {
            console.error(error);
            stockList.innerHTML = '<li class="error">Failed to fetch stock data.</li>';
        });
}

// Function to fetch and display stock data for the searched symbol
async function fetchStockData(symbol) {
    showLoading();
    if (!symbol) {
        fetchTopStocks();
        return;
    }

    try {
        const quoteResponse = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=cscchthr01qgt32f7m1gcscchthr01qgt32f7m20`);
        if (!quoteResponse.ok) {
            throw new Error(`HTTP error! status: ${quoteResponse.status}`);
        }
        const quoteData = await quoteResponse.json();

        const companyData = await fetchCompanyInfo(symbol);

        if (quoteData.c && companyData) {
            displayCompanyPopup(companyData, quoteData);
        } else {
            stockList.innerHTML = '<li class="error">Invalid Symbol or No Data Available</li>';
        }
    } catch (error) {
        console.error('Detailed error:', error);
        stockList.innerHTML = `<li class="error">Failed to fetch stock data: ${error.message}</li>`;
    }

    fetchBasicFinancials(symbol);
}

// Display top stocks on page load
fetchTopStocks();

// Handle form submission
document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const symbol = symbolInput.value.toUpperCase();
    fetchStockData(symbol);
    symbolInput.value = '';
});

// Function to fetch and display market status
function updateMarketStatus() {
    const marketStatusElement = document.getElementById('marketStatus');
    const currentTimeElement = document.getElementById('currentTime');

    // Create date object for ET (US Eastern Time)
    const etOptions = {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    };

    // Get current ET time
    const etTime = new Intl.DateTimeFormat('en-US', etOptions).format(new Date());
    currentTimeElement.textContent = etTime;

    // Parse the time for market hours check
    const now = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
    const etDate = new Date(now);

    const day = etDate.getDay();
    const hour = etDate.getHours();
    const minute = etDate.getMinutes();
    const currentTimeNumber = hour * 100 + minute;

    // Market is open Monday (1) through Friday (5)
    // Between 9:30 AM (930) and 4:00 PM (1600)
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = currentTimeNumber >= 930 && currentTimeNumber <= 1600;

    if (isWeekday && isMarketHours) {
        marketStatusElement.textContent = 'Open';
        marketStatusElement.style.color = 'green';
    } else {
        marketStatusElement.textContent = 'Closed';
        marketStatusElement.style.color = 'red';
    }
}

// Update immediately when page loads
updateMarketStatus();

// Update every second
setInterval(updateMarketStatus, 1000);

// Function to fetch and display market news
async function fetchMarketNews() {
    const apiKey = 'cscchthr01qgt32f7m1gcscchthr01qgt32f7m20';
    const newsContainer = document.getElementById('news-container');

    try {
        const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${apiKey}`);
        const data = await response.json();

        // Clear existing news
        newsContainer.innerHTML = '';

        // Display only the first 5 news items
        data.slice(0, 5).forEach(news => {
            const date = new Date(news.datetime * 1000);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

            const newsElement = document.createElement('div');
            newsElement.className = 'news-item';
            newsElement.innerHTML = `
                <h5>${news.headline}</h5>
                <div class="news-meta">
                    <span class="news-source">${news.source}</span>
                    <span class="news-date">${formattedDate}</span>
                </div>
                ${news.image ? `<div class="news-content">
                    <img src="${news.image}" alt="News Image" class="news-image">
                    <div class="news-summary">${news.summary}</div>
                </div>` : `<div class="news-summary">${news.summary}</div>`}
                <a href="${news.url}" target="_blank" class="news-link">Read more</a>
            `;

            newsContainer.appendChild(newsElement);
        });
    } catch (error) {
        console.error('Error fetching market news:', error);
        newsContainer.innerHTML = '<p class="news-error">Error loading market news</p>';
    }
}

// Fetch news when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchMarketNews();
    // Refresh news every 5 minutes
    setInterval(fetchMarketNews, 300000);
});

// Function to fetch and update NASDAQ 100 data
function updateNASDAQ100() {
    const nasdaqSymbol = 'NDX'; // NASDAQ 100 symbol
    const apiKey = 'cscchthr01qgt32f7m1gcscchthr01qgt32f7m20'; // Replace with your actual API key

    console.log('Fetching NASDAQ 100 data...');

    fetch(`https://finnhub.io/api/v1/quote?symbol=${nasdaqSymbol}&token=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            if (data.c) {
                const priceElement = document.getElementById('nasdaq-price');
                const changeElement = document.getElementById('nasdaq-change');

                // Update price
                priceElement.textContent = `$${data.c.toFixed(2)}`;

                // Calculate and update percentage change
                const changePercent = ((data.d / data.pc) * 100).toFixed(2);
                changeElement.textContent = `${changePercent}%`;

                // Update color based on change
                if (parseFloat(changePercent) >= 0) {
                    changeElement.style.color = 'green';
                } else {
                    changeElement.style.color = 'red';
                }

                console.log('NASDAQ 100 data updated successfully');
            } else {
                console.error('Unexpected data structure:', data);
                document.getElementById('nasdaq-price').textContent = 'Data Error';
                document.getElementById('nasdaq-change').textContent = 'N/A';
            }
        })
        .catch(error => {
            console.error('Error fetching NASDAQ 100 data:', error);
            console.error('Full error object:', JSON.stringify(error, null, 2));
            document.getElementById('nasdaq-price').textContent = 'Fetch Error';
            document.getElementById('nasdaq-change').textContent = 'N/A';
        });
}

// Update NASDAQ 100 data when page loads
updateNASDAQ100();

// Update NASDAQ 100 data every minute
setInterval(() => {
    console.log('Updating NASDAQ 100 data');
    updateNASDAQ100();
}, 60000);

// Optional: Add this to check if the script is running
console.log('NASDAQ 100 update script loaded');

document.addEventListener('DOMContentLoaded', () => {
    // Remove news container from initial animation setup
    gsap.set(['.item', '#stock-list', '.prog-chart'], {
        autoAlpha: 0
    });

    // Create initial loading animation
    const loadingTl = gsap.timeline();

    // Add a loading overlay
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    document.body.appendChild(overlay);

    // Add this CSS
    const style = document.createElement('style');
    style.textContent = `
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #1a1a1a;
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .loading-text {
            color: white;
            font-size: 2rem;
            font-weight: bold;
            opacity: 0;
        }
        
        .visible {
            visibility: visible !important;
        }
    `;
    document.head.appendChild(style);

    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-text';
    loadingText.textContent = 'Loading Dashboard...';
    overlay.appendChild(loadingText);

    // Main animation timeline
    const mainTl = gsap.timeline({
        defaults: { ease: "power3.out" }
    });

    // Loading sequence
    loadingTl
        .to(loadingText, {
            opacity: 1,
            duration: 0.5
        })
        .to(loadingText, {
            opacity: 0,
            duration: 0.5,
            delay: 0.5
        })
        .to(overlay, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                overlay.remove();
                // Make elements visible before animation
                gsap.set(['.item', '#stock-list', '.prog-chart'], {
                    visibility: 'visible'
                });
                // Start main animations
                mainTl.play();
            }
        });

    // Main animations (excluding news)
    mainTl
        .pause()
        .to('.item', {
            duration: 0.8,
            autoAlpha: 1,
            y: 0,
            rotationX: 0,
            transformOrigin: "0% 50% -50",
            stagger: 0.2,
            ease: "back.out(1.7)",
            clearProps: "transform"
        })
        .to('#stock-list', {
            duration: 1,
            autoAlpha: 1,
            scale: 1,
            x: 0,
            ease: "elastic.out(1, 0.8)",
            clearProps: "transform"
        }, "-=0.4")
        .to('.prog-chart', {
            duration: 1.2,
            autoAlpha: 1,
            scale: 1,
            y: 0,
            ease: "power4.out",
            clearProps: "transform"
        }, "-=0.6");

    // Add hover animations for interactive elements
    gsap.utils.toArray('.item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                scale: 1.02,
                duration: 0.3,
                ease: "power2.out",
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)"
            });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
                boxShadow: "none"
            });
        });
    });
});
async function fetchCompanyInfo(symbol) {
    const response = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=cscchthr01qgt32f7m1gcscchthr01qgt32f7m20`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

document.addEventListener("DOMContentLoaded", () => {
    const symbolInput = document.getElementById("symbol");
    const suggestionList = document.createElement("ul");
    suggestionList.id = "suggestion-list";
    symbolInput.parentNode.style.position = "relative";
    symbolInput.parentNode.appendChild(suggestionList);

    let debounceTimeout;
    const cache = {};

    // Fallback data for common stocks
    const fallbackStocks = [
        { symbol: "AAPL", description: "Apple Inc." },
        { symbol: "MSFT", description: "Microsoft Corporation" },
        { symbol: "GOOGL", description: "Alphabet Inc." },
        { symbol: "AMZN", description: "Amazon.com Inc." },
        { symbol: "FB", description: "Facebook, Inc." },
        // Add more common stocks here
    ];

    symbolInput.addEventListener("input", (e) => {
        const query = e.target.value.trim();

        if (query.length < 2) {
            suggestionList.innerHTML = "";
            return;
        }

        // Show loading indicator immediately
        suggestionList.innerHTML = "<li style='color: gray; text-align: center;'>Loading...</li>";

        clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(() => {
            searchStocks(query);
        }, 150);
    });

    symbolInput.addEventListener("focus", () => {
        suggestionList.innerHTML = ""; // Clear suggestions on focus
    });

    async function searchStocks(query) {
        console.log("Searching for:", query);

        try {
            // Try API search first
            const apiResults = await searchAPI(query);
            if (apiResults.length > 0) {
                displaySuggestions(apiResults, query);
                return;
            }

            // If API returns no results, use fallback search
            console.log("No API results, using fallback search");
            const fallbackResults = searchFallback(query);
            displaySuggestions(fallbackResults, query);
        } catch (error) {
            console.error("Error in searchStocks:", error);
            suggestionList.innerHTML = "<li style='color: red; text-align: center;'>Error searching stocks</li>";
        }
    }

    async function searchAPI(query) {
        if (cache[query]) {
            console.log("Using cached results for:", query);
            return cache[query];
        }

        try {
            const response = await fetch(`https://finnhub.io/api/v1/search?q=${query }&token=cscchthr01qgt32f7m1gcscchthr01qgt32f7m20`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("API Response:", data);

            if (!data.result || data.result.length === 0) {
                return [];
            }

            const filteredResults = data.result.filter(item =>
                item.type === "Common Stock" &&
                !item.symbol.includes('.') &&
                item.symbol.length <= 5
            );

            cache[query] = filteredResults;
            return filteredResults;
        } catch (error) {
            console.error("Error in API search:", error);
            return [];
        }
    }

    function searchFallback(query) {
        return fallbackStocks.filter(stock =>
            stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
            stock.description.toLowerCase().includes(query.toLowerCase())
        );
    }

    function displaySuggestions(results, query) {
        console.log("Displaying suggestions for query:", query);
        console.log("Results:", results);

        const sortedResults = results.sort((a, b) => {
            const aNameMatch = a.description.toLowerCase().includes(query.toLowerCase());
            const bNameMatch = b.description.toLowerCase().includes(query.toLowerCase());
            const aSymbolMatch = a.symbol.toLowerCase().startsWith(query.toLowerCase());
            const bSymbolMatch = b.symbol.toLowerCase().startsWith(query.toLowerCase());

            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            if (aSymbolMatch && !bSymbolMatch) return -1;
            if (!aSymbolMatch && bSymbolMatch) return 1;
            return 0;
        });

        suggestionList.innerHTML = "";
        sortedResults.slice(0, 5).forEach((item) => {
            const listItem = document.createElement("li");
            const highlightedDescription = highlightMatch(item.description, query);
            const highlightedSymbol = highlightMatch(item.symbol, query);
            listItem.innerHTML = `${highlightedDescription} (${highlightedSymbol})`;
            listItem.addEventListener("click", () => {
                symbolInput.value = item.symbol;
                suggestionList.innerHTML = "";
                // Trigger the stock data fetch here if needed
                // fetchStockData(item.symbol);
            });
            suggestionList.appendChild(listItem);
        });

        if (suggestionList.children.length === 0) {
            suggestionList.innerHTML = "<li style='color: gray; text-align: center;'>No results found</li>";
        }
    }

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    document.addEventListener("click", (e) => {
        if (!symbolInput.contains(e.target) && !suggestionList.contains(e.target)) {
            suggestionList.innerHTML = "";
        }
    });
});