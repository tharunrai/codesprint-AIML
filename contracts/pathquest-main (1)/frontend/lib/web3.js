import { BrowserProvider, toBeHex } from 'ethers';

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  return accounts[0];
};

export const getProvider = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  return new BrowserProvider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  return provider.getSigner();
};

export const getConnectedAccount = async () => {
  const provider = getProvider();
  const signer = await getSigner();
  return signer.getAddress();
};

export const switchToSepolia = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x7A69' }], // Hardhat Localhost chain ID (31337)
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x7A69',
              chainName: 'Localhost 8545',
              rpcUrls: ['http://127.0.0.1:8545'],
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: [],
            },
          ],
        });
      } catch (addError) {
        throw addError;
      }
    }
  }
};

export const getCurrentChainId = async () => {
  const provider = getProvider();
  const network = await provider.getNetwork();
  return network.chainId;
};
