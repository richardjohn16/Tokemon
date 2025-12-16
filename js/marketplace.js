// marketplace.js

// Coin Management
function getCoins() {
    let coins = parseInt(localStorage.getItem('coins'));
    if (isNaN(coins)) {
        coins = 2000000; // Starting balance for testing
        setCoins(coins);
    }
    return coins;
}

function setCoins(amount) {
    localStorage.setItem('coins', amount);
}

function updateCoinsDisplay() {
    document.getElementById('coin-amount').innerText = getCoins().toLocaleString();
}

// Owned Pokemon Management
function getOwnedPokemon() {
    return JSON.parse(localStorage.getItem('ownedPokemon')) || [];
}

function addOwnedPokemon(name, img) {
    const owned = getOwnedPokemon();
    owned.push({ name, img });
    localStorage.setItem('ownedPokemon', JSON.stringify(owned));
}

// Fetch random Pokemon for sale
async function fetchAvailablePokemon() {
    const totalPokemon = 1025;
    const availableDiv = document.getElementById('available-pokemon');
    availableDiv.innerHTML = '<p>Loading Pokemon...</p>';

    availableDiv.innerHTML = ''; // Clear

    for (let i = 0; i < 5; i++) {
        const randomId = Math.floor(Math.random() * totalPokemon) + 1;
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
            const data = await response.json();

            const card = document.createElement('div');
            card.className = 'pokemon-card';
            card.innerHTML = `
                <img src="${data.sprites.front_default || '/assets/placeholder.png'}" alt="${data.name}">
                <p>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</p>
                <p>Cost: 1,000,000 coins</p>
                <button onclick="buyPokemon('${data.name}', '${data.sprites.front_default || ''}')">Buy</button>
            `;
            availableDiv.appendChild(card);
        } catch (error) {
            console.error('Error fetching Pokemon:', error);
        }
    }
}

// Buy Pokemon
window.buyPokemon = function(name, img) {
    let coins = getCoins();
    if (coins >= 1000000) {
        coins -= 1000000;
        setCoins(coins);
        addOwnedPokemon(name, img);
        alert(`You successfully purchased ${name.charAt(0).toUpperCase() + name.slice(1)}!`);
        updateCoinsDisplay();
        displayMyPokemon();
        fetchAvailablePokemon(); // Refresh available list (optional)
    } else {
        alert('Not enough coins! You need 1,000,000 coins.');
    }
};

// Display owned Pokemon
function displayMyPokemon() {
    const myDiv = document.getElementById('my-pokemon');
    myDiv.innerHTML = '';
    const owned = getOwnedPokemon();

    if (owned.length === 0) {
        myDiv.innerHTML = '<p>You don\'t own any Pokemon yet. Buy some!</p>';
        return;
    }

    owned.forEach(p => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <img src="${p.img || '/assets/placeholder.png'}" alt="${p.name}">
            <p>${p.name.charAt(0).toUpperCase() + p.name.slice(1)}</p>
        `;
        myDiv.appendChild(card);
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    updateCoinsDisplay();
    fetchAvailablePokemon();
    displayMyPokemon();

    const logoutBtn = document.getElementById('logoutBtn');

    // === Display shortened connected wallet address on button ===
    async function displayConnectedAddress() {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    const address = accounts[0];
                    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
                    logoutBtn.innerHTML = `Logout (${shortAddress})`;
                } else {
                    logoutBtn.innerHTML = 'Logout';
                }
            } catch (err) {
                console.error('Error fetching accounts:', err);
                logoutBtn.innerHTML = 'Logout';
            }
        } else {
            logoutBtn.innerHTML = 'Logout';
        }
    }

    // Show address on load
    displayConnectedAddress();

    // === Proper Logout: Revoke permissions + redirect ===
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (!confirm('Are you sure you want to logout?')) {
            return;
        }

        if (window.ethereum) {
            try {
                await window.ethereum.request({
                    method: 'wallet_revokePermissions',
                    params: [{ eth_accounts: {} }]
                });
                console.log('Wallet permissions revoked successfully');
            } catch (error) {
                console.warn('Failed to revoke permissions (user may have rejected):', error);
                // Not fatal — we still proceed with redirect
            }
        }

        // Optional: Clear game progress (coins, owned Pokémon)
        // Remove these lines if you want progress to persist across sessions
        //localStorage.removeItem('coins');
        //localStorage.removeItem('ownedPokemon');
        // OR: localStorage.clear(); // Clears everything

        // Redirect to landing/login page
        window.location.href = '/index.html'; // Adjust path if needed (e.g., '/' or 'home.html')
    });

    // === Listen for MetaMask account changes ===
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                // User disconnected wallet globally
                alert('Wallet disconnected. Redirecting to login...');
                localStorage.removeItem('coins');
                localStorage.removeItem('ownedPokemon');
                window.location.href = '/index.html';
            } else {
                // Update button with new address
                displayConnectedAddress();
            }
        });
    }
});