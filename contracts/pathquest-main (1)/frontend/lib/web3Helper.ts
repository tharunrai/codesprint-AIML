import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Get ethers.js BrowserProvider from MetaMask
 * @returns {BrowserProvider} Ethers BrowserProvider instance
 * @throws {Error} If MetaMask is not installed
 */
export const getProvider = (): BrowserProvider => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }
  return new BrowserProvider(window.ethereum);
};

/**
 * Get signer from provider
 * @returns {Promise<any>} Ethers signer instance
 * @throws {Error} If MetaMask is not connected
 */
export const getSigner = async () => {
  try {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return signer;
  } catch (error: any) {
    throw new Error(`Failed to get signer: ${error.message}`);
  }
};

/**
 * Get contract instance with signer for write operations
 * @param {string} contractAddress - Contract address
 * @param {any} contractABI - Contract ABI
 * @returns {Promise<Contract>} Contract instance connected to signer
 * @throws {Error} If contract initialization fails
 */
export const getContract = async (contractAddress: string, contractABI: any): Promise<Contract> => {
  try {
    if (!contractAddress || !contractABI) {
      throw new Error('Contract address and ABI are required');
    }

    const signer = await getSigner();
    const contract = new Contract(contractAddress, contractABI, signer);
    return contract;
  } catch (error: any) {
    throw new Error(`Failed to initialize contract: ${error.message}`);
  }
};

/**
 * Get read-only contract instance (no signer needed)
 * @param {string} contractAddress - Contract address
 * @param {any} contractABI - Contract ABI
 * @returns {Contract} Read-only contract instance
 * @throws {Error} If contract initialization fails
 */
export const getReadOnlyContract = (contractAddress: string, contractABI: any): Contract => {
  try {
    if (!contractAddress || !contractABI) {
      throw new Error('Contract address and ABI are required');
    }

    // Always use JsonRpcProvider for read-only calls to avoid MetaMask network issues
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545';
    const provider = new JsonRpcProvider(rpcUrl);
    return new Contract(contractAddress, contractABI, provider);
  } catch (error: any) {
    throw new Error(`Failed to initialize read-only contract: ${error.message}`);
  }
};

/**
 * Request account access from MetaMask
 * @returns {Promise<string>} First connected account address
 * @throws {Error} If MetaMask is not installed or user denies connection
 */
export const requestAccount = async (): Promise<string> => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect MetaMask.');
    }

    return accounts[0];
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User denied MetaMask connection request');
    }
    throw new Error(`Failed to request account: ${error.message}`);
  }
};

/**
 * Get current connected account (without requesting new permission)
 * @returns {Promise<string | null>} Current account address or null
 */
export const getCurrentAccount = async (): Promise<string | null> => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      return null;
    }

    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    }) as string[];

    return accounts?.[0] || null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

/**
 * Switch to Sepolia network (adds if not present)
 * @returns {Promise<void>}
 * @throws {Error} If network switch fails
 */
export const switchToSepolia = async (): Promise<void> => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const localhostChainId = '0x7A69'; // 31337 in hex (Hardhat)

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: localhostChainId }],
      });
    } catch (switchError: any) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: localhostChainId,
              chainName: 'Localhost 8545',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://127.0.0.1:8545'],
              blockExplorerUrls: [],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  } catch (error: any) {
    throw new Error(`Failed to switch to Localhost: ${error.message}`);
  }
};

/**
 * Get current network chain ID
 * @returns {Promise<number>} Chain ID
 * @throws {Error} If unable to get chain ID
 */
export const getCurrentChainId = async (): Promise<number> => {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    return Number(network.chainId);
  } catch (error: any) {
    throw new Error(`Failed to get chain ID: ${error.message}`);
  }
};

/**
 * Check if user is on the correct network (Localhost 8545)
 * @returns {Promise<boolean>} True if on Localhost
 */
export const isOnSepolia = async (): Promise<boolean> => {
  try {
    const chainId = await getCurrentChainId();
    return chainId === 31337; // Hardhat Localhost chain ID
  } catch {
    return false;
  }
};

/**
 * Listen for account changes
 * @param {(accounts: string[]) => void} callback - Function to call on account change
 * @returns {void}
 */
export const onAccountsChanged = (callback: (accounts: string[]) => void): void => {
  if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('accountsChanged', callback);
  }
};

/**
 * Listen for chain/network changes
 * @param {(chainId: string) => void} callback - Function to call on chain change
 * @returns {void}
 */
export const onChainChanged = (callback: (chainId: string) => void): void => {
  if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('chainChanged', callback);
  }
};

/**
 * Remove event listeners
 * @returns {void}
 */
export const removeListeners = (): void => {
  if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.removeAllListeners?.();
  }
};
