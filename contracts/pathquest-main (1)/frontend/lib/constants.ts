/**
 * CredChain Constants and ABI Exports
 */

// ============ Contract Address ============
export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  '0x0000000000000000000000000000000000000000';

// ============ Types ============
export interface Credential {
  eduId: string;
  issuer: string;
  studentWallet: string;
  studentName: string;
  institutionName: string;
  credentialType: string;
  courseOrProgram: string;
  issueDate: bigint;
  documentHash: string;
  revoked: boolean;
}

export interface VerifyCredentialResponse {
  exists: boolean;
  credential: Credential;
}

export interface CredentialIssueData {
  studentWallet: string;
  studentName: string;
  institutionName: string;
  credentialType: string;
  courseOrProgram: string;
  pdfHash: string;
}

// ============ Minimal Contract ABI ============
export const CONTRACT_ABI = [
  // Admin Functions
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'whitelistIssuer',
    inputs: [
      { name: 'issuer', type: 'address' },
      { name: 'status', type: 'bool' },
      { name: 'institutionName', type: 'string' },
    ],
    outputs: [],
  },

  // Issuer Functions
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'issueCredential',
    inputs: [
      { name: 'studentWallet', type: 'address' },
      { name: 'studentName', type: 'string' },
      { name: 'institutionName', type: 'string' },
      { name: 'credentialType', type: 'string' },
      { name: 'courseOrProgram', type: 'string' },
      { name: 'documentHash', type: 'bytes32' },
    ],
    outputs: [{ name: 'eduId', type: 'string' }],
  },

  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'revokeCredential',
    inputs: [{ name: 'eduId', type: 'string' }],
    outputs: [],
  },

  // Verification Functions
  {
    stateMutability: 'view',
    type: 'function',
    name: 'verifyCredential',
    inputs: [{ name: 'eduId', type: 'string' }],
    outputs: [
      { name: 'exists', type: 'bool' },
      {
        name: 'credential',
        type: 'tuple',
        components: [
          { name: 'eduId', type: 'string' },
          { name: 'issuer', type: 'address' },
          { name: 'studentWallet', type: 'address' },
          { name: 'studentName', type: 'string' },
          { name: 'institutionName', type: 'string' },
          { name: 'credentialType', type: 'string' },
          { name: 'courseOrProgram', type: 'string' },
          { name: 'issueDate', type: 'uint256' },
          { name: 'documentHash', type: 'bytes32' },
          { name: 'revoked', type: 'bool' },
        ],
      },
    ],
  },

  {
    stateMutability: 'view',
    type: 'function',
    name: 'getStudentCredentials',
    inputs: [{ name: 'studentWallet', type: 'address' }],
    outputs: [{ name: '', type: 'string[]' }],
  },

  {
    stateMutability: 'view',
    type: 'function',
    name: 'getCredentialDetails',
    inputs: [{ name: 'eduId', type: 'string' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'eduId', type: 'string' },
          { name: 'issuer', type: 'address' },
          { name: 'studentWallet', type: 'address' },
          { name: 'studentName', type: 'string' },
          { name: 'institutionName', type: 'string' },
          { name: 'credentialType', type: 'string' },
          { name: 'courseOrProgram', type: 'string' },
          { name: 'issueDate', type: 'uint256' },
          { name: 'documentHash', type: 'bytes32' },
          { name: 'revoked', type: 'bool' },
        ],
      },
    ],
  },

  {
    stateMutability: 'view',
    type: 'function',
    name: 'isCredentialValid',
    inputs: [{ name: 'eduId', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }],
  },

  {
    stateMutability: 'view',
    type: 'function',
    name: 'whitelistedIssuers',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },

  {
    stateMutability: 'view',
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },

  {
    stateMutability: 'view',
    type: 'function',
    name: 'getAllCredentials',
    inputs: [],
    outputs: [{ name: '', type: 'string[]' }],
  },

  {
    stateMutability: 'view',
    type: 'function',
    name: 'getCredentialCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },

  // Events
  {
    anonymous: false,
    type: 'event',
    name: 'IssuerWhitelisted',
    inputs: [
      { indexed: true, name: 'issuer', type: 'address' },
      { indexed: false, name: 'institutionName', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
  },

  {
    anonymous: false,
    type: 'event',
    name: 'CredentialIssued',
    inputs: [
      { indexed: true, name: 'eduId', type: 'string' },
      { indexed: true, name: 'issuer', type: 'address' },
      { indexed: true, name: 'studentWallet', type: 'address' },
      { indexed: false, name: 'studentName', type: 'string' },
      { indexed: false, name: 'issueDate', type: 'uint256' },
    ],
  },

  {
    anonymous: false,
    type: 'event',
    name: 'CredentialRevoked',
    inputs: [
      { indexed: true, name: 'eduId', type: 'string' },
      { indexed: true, name: 'revokedBy', type: 'address' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
  },
];

// ============ Network Configuration ============
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';
export const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/';
export const SEPOLIA_EXPLORER = 'https://sepolia.etherscan.io';

// ============ Credential Types ============
export const CREDENTIAL_TYPES = [
  { value: 'degree', label: 'Degree' },
  { value: '12th', label: '12th Grade' },
  { value: '10th', label: '10th Grade' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'tc', label: 'Transfer Certificate' },
] as const;

export type CredentialType = typeof CREDENTIAL_TYPES[number]['value'];

// ============ Error Messages ============
export const ERROR_MESSAGES = {
  METAMASK_NOT_INSTALLED: 'MetaMask is not installed',
  NO_ACCOUNT_CONNECTED: 'No account connected',
  USER_DENIED_CONNECTION: 'User denied MetaMask connection',
  INVALID_ADDRESS: 'Invalid Ethereum address',
  INVALID_CONTRACT_ADDRESS: 'Invalid contract address',
  CREDENTIAL_NOT_FOUND: 'Credential not found',
  INSTITUTION_NOT_WHITELISTED: 'Institution is not whitelisted',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_FILE: 'Invalid file. Please upload a PDF.',
  NETWORK_MISMATCH: 'Please switch to Sepolia testnet',
} as const;

// ============ Success Messages ============
export const SUCCESS_MESSAGES = {
  CREDENTIAL_ISSUED: 'Credential issued successfully',
  CREDENTIAL_REVOKED: 'Credential revoked successfully',
  INSTITUTION_WHITELISTED: 'Institution whitelisted successfully',
  INSTITUTION_REMOVED: 'Institution removed from whitelist',
  WALLET_CONNECTED: 'Wallet connected successfully',
} as const;

export default {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  SEPOLIA_CHAIN_ID,
  SEPOLIA_CHAIN_ID_HEX,
  SEPOLIA_RPC_URL,
  SEPOLIA_EXPLORER,
  CREDENTIAL_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
