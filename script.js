const connectBtn = document.getElementById("connectBtn");
const statusText = document.getElementById("status");

connectBtn.addEventListener("click", async () => {

    if (typeof window.ethereum === "undefined") {
        statusText.textContent = "Please install MetaMask.";
        statusText.style.color = "red";
        return;
    }

    try {
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        });

        const account = accounts[0];

        statusText.textContent = "Connected: " + account;
        statusText.style.color = "green";

        
        setTimeout(() => {
            window.location.href = "./html/home.html";

        }, 1000);

    } catch (err) {
        statusText.textContent = "Connection cancelled.";
        statusText.style.color = "red";
        console.error(err);
    }
});
