// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CredentialRegistry
 * @dev Academic Credential Verification System on Blockchain
 * 
 * Roles:
 * - Owner (Admin): Whitelists institutions, has full control
 * - Whitelisted Issuers: Institutions that can issue credentials
 * - Students: Recipients of credentials
 * - Verifiers: Public can verify credentials
 */

contract CredentialRegistry {
    // ============ Constants & Types ============
    uint256 private nonce = 0;

    // ============ Structs ============
    struct Credential {
        string eduId;
        address issuer;
        address studentWallet;
        string studentName;
        string institutionName;
        string credentialType; // "10th", "12th", "degree", "TC", etc.
        string courseOrProgram;
        uint256 issueDate;
        bytes32 documentHash; // SHA256 of PDF or JSON
        bool revoked;
    }

    // ============ State Variables ============
    address public owner;

    // Whitelisted issuers (institutions)
    mapping(address => bool) public whitelistedIssuers;

    // Credentials storage: eduId => Credential
    mapping(string => Credential) public credentials;

    // Track if eduId exists
    mapping(string => bool) public eduIdExists;

    // Student credentials: studentWallet => eduId[]
    mapping(address => string[]) public studentCredentials;

    // All issued eduIds (for analytics)
    string[] public allEduIds;

    // ============ Events ============
    event IssuerWhitelisted(
        address indexed issuer,
        string institutionName,
        uint256 timestamp
    );

    event IssuerRemovedFromWhitelist(address indexed issuer, uint256 timestamp);

    event CredentialIssued(
        string indexed eduId,
        address indexed issuer,
        address indexed studentWallet,
        string studentName,
        uint256 issueDate
    );

    event CredentialRevoked(string indexed eduId, address indexed revokedBy, uint256 timestamp);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner, uint256 timestamp);

    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyWhitelistedIssuer() {
        require(whitelistedIssuers[msg.sender], "Only whitelisted issuers can issue credentials");
        _;
    }

    modifier onlyIssuerOrOwner(string memory _eduId) {
        require(
            msg.sender == credentials[_eduId].issuer || msg.sender == owner,
            "Only issuer or owner can revoke"
        );
        _;
    }

    // ============ Constructor ============
    constructor() {
        owner = msg.sender;
    }

    // ============ Admin Functions (Owner Only) ============

    /**
     * @dev Transfer ownership to a new address
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        require(newOwner != owner, "Already the owner");
        
        address oldOwner = owner;
        owner = newOwner;
        
        emit OwnershipTransferred(oldOwner, newOwner, block.timestamp);
    }

    /**
     * @dev Whitelist or remove an issuer (institution)
     * @param issuer Address of the institution
     * @param status True to whitelist, false to remove
     * @param institutionName Name of the institution
     */
    function whitelistIssuer(
        address issuer,
        bool status,
        string memory institutionName
    ) external onlyOwner {
        require(issuer != address(0), "Invalid issuer address");

        whitelistedIssuers[issuer] = status;

        if (status) {
            emit IssuerWhitelisted(issuer, institutionName, block.timestamp);
        } else {
            emit IssuerRemovedFromWhitelist(issuer, block.timestamp);
        }
    }

    // ============ Issuer Functions ============

    /**
     * @dev Issue a credential for a student
     * @param studentWallet Wallet address of the student
     * @param studentName Full name of the student
     * @param institutionName Name of the institution issuing
     * @param credentialType Type: "10th", "12th", "degree", "TC", etc.
     * @param courseOrProgram Course or program name
     * @param documentHash SHA256 hash of the PDF/JSON document
     * @return eduId The generated unique education ID
     */
    function issueCredential(
        address studentWallet,
        string memory studentName,
        string memory institutionName,
        string memory credentialType,
        string memory courseOrProgram,
        bytes32 documentHash
    ) external onlyWhitelistedIssuer returns (string memory) {
        require(studentWallet != address(0), "Invalid student wallet");
        require(bytes(studentName).length > 0, "Student name required");
        require(bytes(institutionName).length > 0, "Institution name required");
        require(bytes(credentialType).length > 0, "Credential type required");
        require(documentHash != bytes32(0), "Document hash required");

        // Generate unique eduId using keccak256
        string memory eduId = _generateEduId(studentWallet);

        // Store credential
        credentials[eduId] = Credential({
            eduId: eduId,
            issuer: msg.sender,
            studentWallet: studentWallet,
            studentName: studentName,
            institutionName: institutionName,
            credentialType: credentialType,
            courseOrProgram: courseOrProgram,
            issueDate: block.timestamp,
            documentHash: documentHash,
            revoked: false
        });

        // Mark as existing
        eduIdExists[eduId] = true;

        // Add to student's credentials
        studentCredentials[studentWallet].push(eduId);

        // Add to all credentials
        allEduIds.push(eduId);

        emit CredentialIssued(
            eduId,
            msg.sender,
            studentWallet,
            studentName,
            block.timestamp
        );

        return eduId;
    }

    /**
     * @dev Revoke a credential
     * @param eduId The education ID to revoke
     */
    function revokeCredential(string memory eduId)
        external
        onlyIssuerOrOwner(eduId)
    {
        require(eduIdExists[eduId], "Credential does not exist");
        require(!credentials[eduId].revoked, "Credential already revoked");

        credentials[eduId].revoked = true;

        emit CredentialRevoked(eduId, msg.sender, block.timestamp);
    }

    // ============ Verification & View Functions ============

    /**
     * @dev Verify a credential by its eduId
     * @param eduId The education ID to verify
     * @return credential The credential struct if exists
     * @return exists Whether the credential exists
     */
    function verifyCredential(string memory eduId)
        external
        view
        returns (Credential memory credential, bool exists)
    {
        if (!eduIdExists[eduId]) {
            return (
                Credential(
                    "",
                    address(0),
                    address(0),
                    "",
                    "",
                    "",
                    "",
                    0,
                    bytes32(0),
                    false
                ),
                false
            );
        }

        return (credentials[eduId], true);
    }

    /**
     * @dev Check if credential is valid (exists and not revoked)
     * @param eduId The education ID to check
     * @return isValid Whether the credential is valid
     */
    function isCredentialValid(string memory eduId) external view returns (bool) {
        return eduIdExists[eduId] && !credentials[eduId].revoked;
    }

    /**
     * @dev Get all credentials for a student
     * @param studentWallet The student's wallet address
     * @return Array of eduIds for the student
     */
    function getStudentCredentials(address studentWallet)
        external
        view
        returns (string[] memory)
    {
        return studentCredentials[studentWallet];
    }

    /**
     * @dev Get details of a specific credential
     * @param eduId The education ID
     * @return The credential struct
     */
    function getCredentialDetails(string memory eduId)
        external
        view
        returns (Credential memory)
    {
        require(eduIdExists[eduId], "Credential does not exist");
        return credentials[eduId];
    }

    /**
     * @dev Get total number of credentials in registry
     * @return Total count
     */
    function getCredentialCount() external view returns (uint256) {
        return allEduIds.length;
    }

    /**
     * @dev Get all credentials (for admin/analytics)
     * @return Array of all eduIds
     */
    function getAllCredentials() external view returns (string[] memory) {
        return allEduIds;
    }

    /**
     * @dev Check if an address is a whitelisted issuer
     * @param issuer Address to check
     * @return Whether the address is whitelisted
     */
    function isWhitelistedIssuer(address issuer) external view returns (bool) {
        return whitelistedIssuers[issuer];
    }

    // ============ Internal Functions ============

    /**
     * @dev Generate unique eduId using keccak256
     * @param studentWallet Student's wallet address
     * @return Generated eduId as string
     */
    function _generateEduId(address studentWallet) internal returns (string memory) {
        nonce++;
        bytes32 hash = keccak256(
            abi.encodePacked(msg.sender, studentWallet, block.timestamp, nonce)
        );
        return _bytes32ToHexString(hash);
    }

    /**
     * @dev Convert bytes32 to hex string (0x prefixed)
     * @param value The bytes32 value
     * @return The hex string representation
     */
    function _bytes32ToHexString(bytes32 value) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory result = new bytes(66);
        result[0] = "0";
        result[1] = "x";

        for (uint256 i = 0; i < 32; i++) {
            uint8 value_ = uint8(value[i]);
            result[2 + i * 2] = hexChars[value_ >> 4];
            result[3 + i * 2] = hexChars[value_ & 0x0f];
        }
        return string(result);
    }
}
