 const loginBtn = document.getElementById('loginBtn');
        const loginText = document.getElementById('loginText');

        // Sepolia chain ID (in hexadecimal)
        const SEPOLIA_CHAIN_ID = '0xaa36a7';

        async function switchToSepolia() {
            try {
                await ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: SEPOLIA_CHAIN_ID }],
                });
            } catch (switchError) {
                // If Sepolia is not added to MetaMask
                if (switchError.code === 4902) {
                    try {
                        await ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: SEPOLIA_CHAIN_ID,
                                chainName: 'Sepolia Test Network',
                                nativeCurrency: {
                                    name: 'Sepolia Ether',
                                    symbol: 'SEP',
                                    decimals: 18
                                },
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

            loginText.textContent = 'Connecting...';
            loginBtn.disabled = true;

            try {
                // Request account access
                const accounts = await ethereum.request({
                    method: 'eth_requestAccounts'
                });

                const account = accounts[0];
                console.log('Connected account:', account);

                // Check current network
                const currentChainId = await ethereum.request({ method: 'eth_chainId' });

                if (currentChainId !== SEPOLIA_CHAIN_ID) {
                    loginText.textContent = 'Switching to Sepolia...';
                    await switchToSepolia();
                }

                // Success! Redirect to home page
                loginText.textContent = 'Success! Redirecting...';

                // Optional: Save wallet address in localStorage/sessionStorage if needed later
                localStorage.setItem('userWallet', account);

                // Redirect (change '/home' to your actual home route)
                setTimeout(() => {
                    window.location.href = '/home.html';  // Change this to your home page URL
                }, 1000);

            } catch (error) {
                console.error(error);
                let message = 'Connection rejected or failed.';
                if (error.code === 4001) {
                    message = 'You rejected the connection request.';
                } else if (error.code === -32002) {
                    message = 'Connection request already pending. Check MetaMask.';
                }
                alert(message);
                loginText.textContent = 'Login with MetaMask';
                loginBtn.disabled = false;
            }
        }

        // Attach click event
        loginBtn.addEventListener('click', connectWallet);

        // Optional: Auto-connect if already authorized (improves UX)
        window.addEventListener('load', async () => {
            if (window.ethereum) {
                try {
                    const accounts = await ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        // User already connected before → auto-login
                        const chainId = await ethereum.request({ method: 'eth_chainId' });
                        if (chainId === SEPOLIA_CHAIN_ID) {
                            localStorage.setItem('userWallet', accounts[0]);
                            window.location.href = '/home.html';
                        }
                    }
                } catch (err) {
                    console.log('Auto-connect failed (normal if not connected yet)');
                }
            }
        });