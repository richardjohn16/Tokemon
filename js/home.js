 // Optional: Display connected wallet address (nice UX touch)
        const logoutBtn = document.getElementById("logoutBtn");

        async function displayConnectedAddress() {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: "eth_accounts" });
                    if (accounts.length > 0) {
                        const address = accounts[0];
                        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
                        logoutBtn.innerHTML = `Logout (${shortAddress})`;
                    }
                } catch (err) {
                    console.error("Error fetching account:", err);
                }
            }
        }

        // Show connected address on page load
        displayConnectedAddress();

        // Logout functionality
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            if (confirm("Are you sure you want to logout?")) {
                try {
                    // This revokes the site's permission to access the wallet
                    // MetaMask will prompt again on next connection request
                    await window.ethereum.request({
                        method: "wallet_revokePermissions",
                        params: [{ eth_accounts: {} }]
                    });

                    console.log("Wallet disconnected successfully");

                    // Redirect to landing page
                    window.location.href = "/index.html";  // Adjust path if needed (e.g., "/" or "../index.html")
                } catch (error) {
                    console.error("Logout failed:", error);
                    alert("Logout failed. You can also disconnect manually in MetaMask > Connected Sites.");

                    // Fallback: still redirect even if revoke fails
                    window.location.href = "/index.html";
                }
            }
        });

        // Optional: Listen for account changes (e.g., user switches/disconnects in MetaMask)
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length === 0) {
                    // User disconnected from MetaMask globally
                    alert("Wallet disconnected. Redirecting to login...");
                    window.location.href = "/index.html";
                } else {
                    // Update displayed address if changed
                    displayConnectedAddress();
                }
            });
        }