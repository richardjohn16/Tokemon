// Inventory.js - Logout with MetaMask integration

document.addEventListener('DOMContentLoaded', () => {
    // === Display owned Pokémon (your existing code here) ===
    function getOwnedPokemon() {
        return JSON.parse(localStorage.getItem('ownedPokemon')) || [];
    }

    function displayMyPokemon() {
        const myDiv = document.getElementById('my-pokemon');
        myDiv.innerHTML = '';
        const owned = getOwnedPokemon();

        if (owned.length === 0) {
            myDiv.innerHTML = '<p>You don\'t own any Pokemon yet.</p>';
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

    displayMyPokemon();

    // === Logout Button Logic ===
    const logoutBtn = document.getElementById('logoutBtn');

    // Display shortened connected address
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

    // Initial display
    displayConnectedAddress();

    // Logout click handler
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
                console.log('Wallet permissions revoked');
            } catch (error) {
                console.warn('Permission revoke failed (user rejected or not supported):', error);
                // Continue anyway — MetaMask may still forget on redirect
            }
        }

        // Clear game data (optional — remove if you want progress saved)
        localStorage.removeItem('coins');
        localStorage.removeItem('ownedPokemon');
        // OR: localStorage.clear(); // Clears everything

        // Redirect to login/landing page
        window.location.href = '/index.html'; // Change if your login page is different
    });

    // Listen for MetaMask disconnect/account change
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                // User disconnected wallet
                alert('Wallet disconnected. Redirecting to login...');
                localStorage.removeItem('coins');
                localStorage.removeItem('ownedPokemon');
                window.location.href = '/index.html';
            } else {
                displayConnectedAddress(); // Update button with new address
            }
        });
    }
});