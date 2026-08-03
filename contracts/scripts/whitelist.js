const hre = require("hardhat");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function main() {
  // Read contract address from deployedAddress.json
  const addressFile = path.join(__dirname, "../deployedAddress.json");
  let contractAddress;
  
  if (fs.existsSync(addressFile)) {
    const data = JSON.parse(fs.readFileSync(addressFile, "utf8"));
    contractAddress = data.contractAddress;
  } else {
    throw new Error("deployedAddress.json not found. Deploy the contract first.");
  }

  // Use address from CLI arg or default
  const institutionAddress = process.argv[2] 
    ? hre.ethers.getAddress(process.argv[2]) 
    : hre.ethers.getAddress("0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc");
  const institutionName = process.argv[3] || "Test Institution";

  console.log("Whitelisting institution...\n");
  console.log("Contract:", contractAddress);
  console.log("Institution:", institutionAddress);
  console.log("Name:", institutionName);

  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const contract = CredentialRegistry.attach(contractAddress);

  const tx = await contract.whitelistIssuer(institutionAddress, true, institutionName);
  console.log("\n⏳ Transaction sent:", tx.hash);

  await tx.wait();
  console.log("✅ Institution whitelisted successfully!");

  // Verify
  const isWhitelisted = await contract.whitelistedIssuers(institutionAddress);
  console.log("Verification:", isWhitelisted ? "✅ Confirmed" : "❌ Failed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
