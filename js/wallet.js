export async function getWallet() {
    if (typeof window.ethereum === "undefined") {
        console.error("MetaMask not installed");
        return null;
    }

    // Get accounts WITHOUT pop-up
    const accounts = await window.ethereum.request({
        method: "eth_accounts"
    });

    if (accounts.length === 0) {
        console.warn("Wallet not connected yet");
        return null;
    }

    return accounts[0]; // return first connected wallet
}

export async function connectWallet() {
    if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask");
        return null;
    }

    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
    });

    return accounts[0];
}
