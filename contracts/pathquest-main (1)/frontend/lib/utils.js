import crypto from 'crypto';

/**
 * Generate a unique EduID (Educational Identifier)
 * Format: CREDCHAIN-INSTITUTION-TIMESTAMP-RANDOM
 * Example: CREDCHAIN-MC5D-1708105200000-A3K9
 */
export const generateEduID = (institutionAddress) => {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(2).toString('hex').toUpperCase();
  const institutionCode = institutionAddress.slice(2, 6).toUpperCase();

  return `CREDCHAIN-${institutionCode}-${timestamp}-${randomBytes}`;
};

/**
 * Validate EduID format
 */
export const validateEduID = (eduID) => {
  const eduIDRegex = /^CREDCHAIN-[A-Z0-9]{4}-\d{13}-[A-Z0-9]{4}$/;
  return eduIDRegex.test(eduID);
};

/**
 * Extract institution code from EduID
 */
export const extractInstitutionCode = (eduID) => {
  const parts = eduID.split('-');
  return parts[1]; // Returns institution code
};

/**
 * Extract timestamp from EduID
 */
export const extractTimestamp = (eduID) => {
  const parts = eduID.split('-');
  return parseInt(parts[2]); // Returns timestamp in milliseconds
};

/**
 * Format bytes32 hash to human-readable hex string
 */
export const formatHash = (hash) => {
  if (typeof hash === 'string') {
    return hash.length > 16 ? hash.slice(0, 16) + '...' : hash;
  }
  return 'N/A';
};

/**
 * Convert file to hex string for on-chain storage
 */
export const fileToHash = async (file) => {
  // For consistency, compute SHA-256 of the file and return as 0x-prefixed hex
  return await sha256File(file);
};

/**
 * Generate hash from file content (SHA-256)
 */
export const generateFileHash = async (file) => {
  return await sha256File(file);
};

/**
 * Generate mock hash for testing
 */
export const generateMockHash = (input) => {
  return '0x' + crypto.createHash('sha256').update(input).digest('hex');
};

/**
 * Compute SHA-256 of a File using Web Crypto API in browser.
 * Returns 0x-prefixed hex string.
 */
export const sha256File = async (file) => {
  if (!file) return null;
  const arrayBuffer = await file.arrayBuffer();

  if (globalThis.crypto && globalThis.crypto.subtle) {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return '0x' + hashHex;
  }

  // Fallback to Node.js crypto (for SSR/testing)
  const buf = Buffer.from(arrayBuffer);
  return '0x' + crypto.createHash('sha256').update(buf).digest('hex');
};

/**
 * Compute SHA-256 of a text string using Web Crypto API in browser.
 * Returns 0x-prefixed hex string.
 */
export const sha256Text = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  if (globalThis.crypto && globalThis.crypto.subtle) {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return '0x' + hashHex;
  }

  // Fallback to Node.js crypto
  return '0x' + crypto.createHash('sha256').update(data).digest('hex');
};
