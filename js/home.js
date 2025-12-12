document.getElementById("playBtn").addEventListener("click", async (e) => {
    e.preventDefault();

    if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask first.");
        return;
    }

    try {
        // Check connection
        let accounts = await window.ethereum.request({ method: "eth_accounts" });

        if (!accounts || accounts.length === 0) {
            // Not connected → request connection
            accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            });
        }

        // If STILL not connected → stop
        if (!accounts || accounts.length === 0) {
            alert("You must connect MetaMask to continue.");
            return;
        }

        // Wallet is confirmed connected → proceed
        console.log("Connected wallet:", accounts[0]);
        window.location.href = "/html/home.html";

    } catch (err) {
        console.error("MetaMask error:", err);
        alert("MetaMask connection failed.");
    }
});
