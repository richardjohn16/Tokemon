const loginBtn = document.getElementById('loginBtn');
const buttonImg = loginBtn.querySelector('img');  

const ORIGINAL_SRC = '/assets/Play.png';
const CONNECTING_SRC = '/assets/Connecting.png';  // Change to your filename
const SWITCHING_SRC = '/assets/switching-to-sepolia.png';    // Change to your filename (can be same as connecting)

const SEPOLIA_CHAIN_ID = '0xaa36a7';

async function switchToSepolia() {
    buttonImg.src = SWITCHING_SRC;  // Show switching image

    try {
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: SEPOLIA_CHAIN_ID,
                        chainName: 'Sepolia Test Network',
                        nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
                        rpcUrls: ['https://rpc.sepolia.org'],
                        blockExplorerUrls: ['https://sepolia.etherscan.io']
                    }],
                });
            } catch (addError) {
                alert('Failed to add Sepolia network. Please add it manually.');
                throw addError;
            }
        } else {
            throw switchError;
        }
    }
}

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask is not installed! Please install MetaMask to continue.');
        window.open('https://metamask.io/download/', '_blank');
        return;
    }

    buttonImg.src = CONNECTING_SRC;  // Show connecting animation
    loginBtn.disabled = true;

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        console.log('Connected account:', account);

        const currentChainId = await ethereum.request({ method: 'eth_chainId' });

        if (currentChainId !== SEPOLIA_CHAIN_ID) {
            await switchToSepolia();
        }

        // Success
        localStorage.setItem('userWallet', account);
        // After successful connection and network check:
        buttonImg.src = '/assets/Success.png';  // e.g. a checkmark or "Connected" icon
        setTimeout(() => {
        window.location.href = '/home.html';
        }, 1000);

    } catch (error) {
        console.error(error);
        let message = 'Connection rejected or failed.';
        if (error.code === 4001) message = 'You rejected the connection request.';
        else if (error.code === -32002) message = 'Connection request already pending. Check MetaMask.';

        alert(message);

        // Restore original button on error
        buttonImg.src = ORIGINAL_SRC;
        loginBtn.disabled = false;
    }
}

loginBtn.addEventListener('click', connectWallet);

// Auto-connect on load (unchanged)
window.addEventListener('load', async () => {
    if (window.ethereum) {
        try {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                const chainId = await ethereum.request({ method: 'eth_chainId' });
                if (chainId === SEPOLIA_CHAIN_ID) {
                    localStorage.setItem('userWallet', accounts[0]);
                    window.location.href = '/home.html';
                }
            }
        } catch (err) {
            console.log('Auto-connect failed');
        }
    }
});

