let cryptocurrencyData = []; // Store fetched cryptocurrency data

// Fetch cryptocurrency data from CoinGecko API
async function fetchCryptocurrencyData() {
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';
    try {
        const response = await fetch(url);
        cryptocurrencyData = await response.json(); // Store data for sorting
        displayCryptocurrencyData(cryptocurrencyData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Display fetched cryptocurrency data
function displayCryptocurrencyData(data) {
    const cryptoList = document.getElementById('crypto-list');
    cryptoList.innerHTML = ''; // Clear existing data

    // Iterate through each cryptocurrency and create an item for display
    data.forEach(crypto => {
        const cryptoItem = document.createElement('div');
        cryptoItem.classList.add('crypto-item');
        cryptoItem.innerHTML = `
            <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
            <p>Price: $${crypto.current_price.toFixed(2)}</p>
            <p>24h Change: ${crypto.price_change_percentage_24h.toFixed(2)}%</p>
            <p>Market Cap: $${crypto.market_cap.toLocaleString()}</p>
            <button onclick="addToComparison('${crypto.id}')">Compare</button>
        `;
        cryptoList.appendChild(cryptoItem);
    });
}

// Sort cryptocurrencies based on selected criteria
function sortCryptocurrencies() {
    const sortOption = document.getElementById('sort-options').value;
    let sortedData;

    switch (sortOption) {
        case 'market_cap_desc':
            sortedData = cryptocurrencyData.sort((a, b) => b.market_cap - a.market_cap);
            break;
        case 'market_cap_asc':
            sortedData = cryptocurrencyData.sort((a, b) => a.market_cap - b.market_cap);
            break;
        case 'price_desc':
            sortedData = cryptocurrencyData.sort((a, b) => b.current_price - a.current_price);
            break;
        case 'price_asc':
            sortedData = cryptocurrencyData.sort((a, b) => a.current_price - b.current_price);
            break;
        case 'change_desc':
            sortedData = cryptocurrencyData.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
            break;
        case 'change_asc':
            sortedData = cryptocurrencyData.sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
            break;
        default:
            sortedData = cryptocurrencyData;
    }

    displayCryptocurrencyData(sortedData); // Display sorted data
}

// Initialize selected cryptocurrencies from local storage
let selectedCryptos = JSON.parse(localStorage.getItem('selectedCryptos')) || [];

// Add cryptocurrency to comparison
function addToComparison(cryptoId) {
    if (selectedCryptos.length >= 5) {
        alert('You have reached the maximum limit of 5 cryptocurrencies for comparison. Please remove one to add a new one.');
    } else if (selectedCryptos.includes(cryptoId)) {
        alert('This cryptocurrency is already in your comparison list.');
    } else {
        selectedCryptos.push(cryptoId);
        localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));
        displayComparison();
        alert('Cryptocurrency added to comparison successfully!');
    }
}

// Display selected cryptocurrencies in comparison section
async function displayComparison() {
    const comparisonItems = document.getElementById('comparison-items');
    comparisonItems.innerHTML = ''; // Clear existing comparison data

    for (const cryptoId of selectedCryptos) {
        const url = `https://api.coingecko.com/api/v3/coins/${cryptoId}`;
        const response = await fetch(url);
        const data = await response.json();

        const cryptoComparisonItem = document.createElement('div');
        cryptoComparisonItem.classList.add('comparison-item');
        cryptoComparisonItem.innerHTML = `
            <h4>${data.name} (${data.symbol.toUpperCase()})</h4>
            <p>Price: $${data.market_data.current_price.usd.toFixed(2)}</p>
            <p>24h Change: ${data.market_data.price_change_percentage_24h.toFixed(2)}%</p>
            <p>Market Cap: $${data.market_data.market_cap.usd.toLocaleString()}</p>
            <button onclick="removeFromComparison('${cryptoId}')">Remove</button>
        `;
        comparisonItems.appendChild(cryptoComparisonItem);
    }
}

// Remove cryptocurrency from comparison
function removeFromComparison(cryptoId) {
    selectedCryptos = selectedCryptos.filter(id => id !== cryptoId);
    localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));
    displayComparison();
    alert('Cryptocurrency removed from comparison successfully!');
}

// Start fetching data and updating it every minute
function startRealTimeUpdates() {
    fetchCryptocurrencyData(); // Initial fetch
    setInterval(fetchCryptocurrencyData, 60000); // Fetch every minute
}

// Load selected cryptocurrencies on page load
window.onload = function() {
    startRealTimeUpdates();
    displayComparison(); // Load previously selected comparisons
};