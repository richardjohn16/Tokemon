
// --- Tokemon Marketplace JS ---
// Works in browser (no bundlers)

// Contract addresses
const NFT_ADDRESS = "0x24E9669956D22AE030d097142C0a3186Fb75DBd0";
const MARKETPLACE_ADDRESS = "0x0779E9Cc0146Df3A60c9522DA309F3D2900555ED";
const TOKECOIN_ADDRESS = "0x2b4faF20282817e7222b43Dac21d2912bb1c2EBB";

let provider, signer;
let nftContract, marketContract, tokecoinContract;

// --- Load ABIs from /abi folder ---
async function loadABIs() {
  const nftABI = await fetch("../abi/tokemon.json").then(r => r.json());
  const marketABI = await fetch("../abi/marketplace.json").then(r => r.json());
  const tokecoinABI = await fetch("../abi/tokecoin.json").then(r => r.json());

  return { nftABI, marketABI, tokecoinABI };
}

// --- Connect to MetaMask ---
async function connectExistingWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask.");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);

  // Get accounts WITHOUT triggering a MetaMask popup
  const accounts = await provider.send("eth_accounts", []);

  if (accounts.length === 0) {
    alert("Please connect wallet on the homepage first.");
    window.location.href = "../index.html";
    return;
  }

  signer = await provider.getSigner();
  const address = accounts[0];

  console.log("Auto-connected wallet:", address);

  // Load ABIs
  const { nftABI, marketABI, tokecoinABI } = await loadABIs();

  // Initialize contracts
  nftContract = new ethers.Contract(NFT_ADDRESS, nftABI, signer);
  marketContract = new ethers.Contract(MARKETPLACE_ADDRESS, marketABI, signer);
  tokecoinContract = new ethers.Contract(TOKECOIN_ADDRESS, tokecoinABI, signer);

  // Update UI
  if (document.getElementById("connectBtn")) {
    document.getElementById("connectBtn").innerText = "Connected";
    document.getElementById("connectBtn").disabled = true;
  }

  // Load marketplace items
  loadMarketplace();
}

// Auto-connect on page load
window.onload = connectExistingWallet;


// --- MINT TOKEMON ---
document.getElementById("mintBtn").onclick = async () => {
  const uri = document.getElementById("mintURI").value;
  if (!uri) return alert("Enter metadata URI");

  try {
    const tx = await nftContract.mintTokemon(uri);
    await tx.wait();
    alert("Minted successfully!");
  } catch (err) {
    console.error(err);
    alert("Mint failed");
  }
};

// --- BUY TOKEMON ---
document.getElementById("buyBtn").onclick = async () => {
  const id = document.getElementById("buyTokenId").value;
  if (!id) return alert("Enter Token ID");

  try {
    const listing = await marketContract.listings(id);
    const price = listing.price;

    const approveTx = await tokecoinContract.approve(MARKETPLACE_ADDRESS, price);
    await approveTx.wait();

    const buyTx = await marketContract.buyTokemon(id);
    await buyTx.wait();

    alert("Purchase Successful!");
  } catch (err) {
    console.error(err);
    alert("Purchase failed.");
  }
};

// --- LIST TOKEMON ---
document.getElementById("listBtn").onclick = async () => {
  const id = document.getElementById("listTokenId").value;
  const price = document.getElementById("listPrice").value;

  if (!id || !price) return alert("Enter ID and Price");

  try {
    const approveTx = await nftContract.approve(MARKETPLACE_ADDRESS, id);
    await approveTx.wait();

    const listTx = await marketContract.listTokemon(id, price);
    await listTx.wait();

    alert("Listed Successfully!");
  } catch (err) {
    console.error(err);
    alert("Listing failed.");
  }
};

// --- LOAD MARKETPLACE ITEMS ---
async function loadMarketplace() {
  try {
    const count = await marketContract.listingCount();
    const container = document.getElementById("marketItems");
    container.innerHTML = "";

    for (let i = 1; i <= count; i++) {
      const item = await marketContract.listings(i);
      if (!item.forSale) continue;

      const metadata = await nftContract.tokenURI(item.tokenId);

      container.innerHTML += `
        <div class="p-4 bg-white shadow rounded">
          <p><strong>Token ID:</strong> ${item.tokenId}</p>
          <p><strong>Price:</strong> ${item.price} TCOIN</p>
          <p><strong>Metadata:</strong> ${metadata}</p>
        </div>
      `;
    }
  } catch (err) {
    console.error("Load Marketplace Failed:", err);
  }
}

// Auto-load marketplace once wallet is connected later
window.loadMarketplace = loadMarketplace;
