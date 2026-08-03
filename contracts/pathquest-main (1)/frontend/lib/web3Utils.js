import { ethers } from 'ethers';
import {
  getProvider,
  getSigner,
  getContract,
  getReadOnlyContract,
  requestAccount,
  getCurrentAccount,
  switchToSepolia,
} from './web3Helper';
import ABI from './abi.json';
import contractAddresses from './contractAddress.json';

const NETWORK_ID = 'sepolia';
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  contractAddresses['localhost'] ||
  contractAddresses[NETWORK_ID];

console.log('Using CONTRACT_ADDRESS:', CONTRACT_ADDRESS);

/**
 * Get provider instance
 * @returns {ethers.Provider} Ethers provider
 */
export const getProviderInstance = () => {
  try {
    return getProvider();
  } catch (error) {
    // Fallback for SSR
    return new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_KEY}`
    );
  }
};

/**
 * Get contract instance (read-only)
 * @returns {ethers.Contract} Contract instance
 */
export const getContractInstance = () => {
  return getReadOnlyContract(CONTRACT_ADDRESS, ABI);
};

/**
 * Get signer and contract instance for write operations
 * @returns {Promise<{signer: ethers.Signer, contract: ethers.Contract}>}
 */
export const getSignerAndContractInstance = async () => {
  await ensureLocalNetwork();
  const signer = await getSigner();
  const contract = await getContract(CONTRACT_ADDRESS, ABI);
  return { signer, contract };
};

/**
 * Ensure MetaMask is on Localhost 8545 (chain 31337)
 */
const ensureLocalNetwork = async () => {
  if (typeof window === 'undefined' || !window.ethereum) return;
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0x7a69') {
      // Not on Localhost 8545 — switch automatically
      await switchToSepolia(); // reused function name, now points to localhost
    }
  } catch (e) {
    console.warn('Could not switch network:', e);
  }
};

/**
 * Connect to MetaMask and request account access
 * @returns {Promise<string>} Connected wallet address
 */
export const connectMetaMask = async () => {
  await ensureLocalNetwork();
  return await requestAccount();
};

/**
 * Get current connected account
 * @returns {Promise<string|null>} Current account or null
 */
export const getCurrentWallet = async () => {
  await ensureLocalNetwork();
  return await getCurrentAccount();
};

/**
 * Check if institution is whitelisted
 * @param {string} address - Institution address
 * @returns {Promise<boolean>}
 */
export const isInstitutionWhitelisted = async (address) => {
  const contract = getContractInstance();
  return await contract.whitelistedIssuers(address);
};

/**
 * Whitelist institution (admin only)
 * @param {string} institutionAddress - Address to whitelist
 * @param {string} institutionName - Name of institution
 * @returns {Promise<ethers.TransactionResponse>}
 */
export const whitelistInstitution = async (institutionAddress, institutionName) => {
  const { contract } = await getSignerAndContractInstance();
  return await contract.whitelistIssuer(institutionAddress, true, institutionName);
};

/**
 * Remove institution from whitelist (admin only)
 * @param {string} institutionAddress - Address to remove
 * @returns {Promise<ethers.TransactionResponse>}
 */
export const removeFromWhitelist = async (institutionAddress) => {
  const { contract } = await getSignerAndContractInstance();
  return await contract.whitelistIssuer(institutionAddress, false, '');
};

/**
 * Issue a credential
 * @param {string|Object} studentWalletOrData - Student wallet address or credential data object
 * @param {string} [studentName] - Student name
 * @param {string} [institutionName] - Institution name
 * @param {string} [credentialType] - Credential type
 * @param {string} [courseOrProgram] - Course or program
 * @param {string} [pdfHash] - Document hash
 * @returns {Promise<string>} EduID
 */
export const issueCredential = async (studentWalletOrData, studentName, institutionName, credentialType, courseOrProgram, pdfHash) => {
  const { contract } = await getSignerAndContractInstance();

  let wallet, name, inst, cType, course, hash;

  if (typeof studentWalletOrData === 'object' && studentWalletOrData !== null) {
    // Called with a single object
    wallet = studentWalletOrData.studentWallet;
    name = studentWalletOrData.studentName;
    inst = studentWalletOrData.institutionName;
    cType = studentWalletOrData.credentialType;
    course = studentWalletOrData.courseOrProgram;
    hash = studentWalletOrData.pdfHash;
  } else {
    // Called with individual arguments
    wallet = studentWalletOrData;
    name = studentName;
    inst = institutionName;
    cType = credentialType;
    course = courseOrProgram;
    hash = pdfHash;
  }

  // Ensure documentHash is a proper bytes32 hex string
  if (hash && !hash.startsWith('0x')) {
    hash = '0x' + hash;
  }
  // Pad to 32 bytes if needed (SHA-256 is already 32 bytes)
  if (hash && hash.length < 66) {
    hash = hash.padEnd(66, '0');
  }

  const tx = await contract.issueCredential(wallet, name, inst, cType, course, hash);
  const receipt = await tx.wait();

  // The event has `string indexed eduId`, which stores keccak256(eduId) in topics
  // so we can't decode the plain text from the event log.
  // Instead, query the student's credential list and return the last one added.
  try {
    const readContract = getContractInstance();
    const studentCreds = await readContract.getStudentCredentials(wallet);
    if (studentCreds && studentCreds.length > 0) {
      return studentCreds[studentCreds.length - 1];
    }
  } catch (err) {
    console.error('Error fetching student credentials after issuance:', err);
  }

  return 'unknown';
};

/**
 * Verify credential by EduID
 * @param {string} eduId - Education ID
 * @returns {Promise<{exists: boolean, credential: Object}>}
 */
export const verifyCredential = async (eduId) => {
  const contract = getContractInstance();
  const [credential, exists] = await contract.verifyCredential(eduId);
  return { exists, credential };
};

/**
 * Get credential details
 * @param {string} eduId - Education ID
 * @returns {Promise<Object>} Credential data
 */
export const getCredentialDetails = async (eduId) => {
  const contract = getContractInstance();
  return await contract.getCredentialDetails(eduId);
};

/**
 * Check if credential is valid
 * @param {string} eduId - Education ID
 * @returns {Promise<boolean>}
 */
export const isCredentialValid = async (eduId) => {
  const contract = getContractInstance();
  return await contract.isCredentialValid(eduId);
};

/**
 * Revoke a credential
 * @param {string} eduId - Education ID
 * @returns {Promise<ethers.TransactionResponse>}
 */
export const revokeCredential = async (eduId) => {
  const { contract } = await getSignerAndContractInstance();
  return await contract.revokeCredential(eduId);
};

/**
 * Get credentials for a student
 * @param {string} studentWallet - Student wallet address
 * @returns {Promise<string[]>} Array of EduIDs
 */
export const getStudentCredentials = async (studentWallet) => {
  const contract = getContractInstance();
  return await contract.getStudentCredentials(studentWallet);
};

/**
 * Get all credentials (admin only)
 * @returns {Promise<string[]>} Array of all EduIDs
 */
export const getAllCredentials = async () => {
  const contract = getContractInstance();
  return await contract.getAllCredentials();
};

/**
 * Get total credential count
 * @returns {Promise<number>}
 */
export const getCredentialCount = async () => {
  const contract = getContractInstance();
  const count = await contract.getCredentialCount();
  return Number(count);
};

/**
 * Check if address is admin
 * @param {string} address - Address to check
 * @returns {Promise<boolean>}
 */
export const isAdmin = async (address) => {
  const contract = getContractInstance();
  const owner = await contract.owner();
  console.log('Contract owner:', owner, 'Address:', address);
  return owner.toLowerCase() === address.toLowerCase();
};

/**
 * Check if the current connected wallet is the contract owner/admin.
 * If `contract` is provided it will be used, otherwise a read-only contract instance is used.
 * Returns boolean. Errors are caught and false is returned on failure.
 */
export const isOwner = async (contract) => {
  try {
    const ctr = contract || getContractInstance();

    // Try common owner/admin accessors
    let ownerAddr;
    if (typeof ctr.admin === 'function') {
      ownerAddr = await ctr.admin();
    } else if (typeof ctr.owner === 'function') {
      ownerAddr = await ctr.owner();
    } else if (typeof ctr.getOwner === 'function') {
      ownerAddr = await ctr.getOwner();
    } else {
      console.warn('Contract does not expose owner/admin getter');
      return false;
    }

    const current = await getCurrentWallet();
    if (!current) return false;
    return ownerAddr.toLowerCase() === current.toLowerCase();
  } catch (err) {
    console.error('isOwner check failed:', err);
    return false;
  }
};

/**
 * Check if an address is a whitelisted issuer/institution.
 * Tries several common mapping/function names and returns boolean.
 * If `contract` is provided it will be used, otherwise a read-only contract instance is used.
 */
export const isWhitelistedIssuer = async (contract, address) => {
  try {
    const ctr = contract || getContractInstance();
    if (!address) return false;

    // Possible function/mapping names
    const candidates = [
      'whitelistedInstitutions',
      'whitelistedIssuers',
      'isWhitelisted',
      'issuers',
      'whitelist',
    ];

    for (const name of candidates) {
      if (typeof ctr[name] === 'function') {
        const res = await ctr[name](address);
        // Some functions may return tuple or object; coerce to boolean
        if (typeof res === 'boolean') return res;
        if (res && typeof res === 'object' && '0' in res) return Boolean(res[0]);
        return Boolean(res);
      }
    }

    console.warn('No whitelisted issuer accessor found on contract');
    return false;
  } catch (err) {
    console.error('isWhitelistedIssuer failed:', err);
    return false;
  }
};
