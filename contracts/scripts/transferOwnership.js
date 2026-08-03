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
  
  // Read admin address from .env
  const adminAddress = process.env.ADMIN_ADDRESS;
  if (!adminAddress) {
    throw new Error("ADMIN_ADDRESS not set in .env file");
  }
  
  const newOwner = hre.ethers.getAddress(adminAddress);

  console.log("Transferring ownership...\n");
  console.log("Contract:", contractAddress);
  console.log("New Owner:", newOwner);

  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const contract = CredentialRegistry.attach(contractAddress);

  const currentOwner = await contract.owner();
  console.log("Current Owner:", currentOwner);

  const tx = await contract.transferOwnership(newOwner);
  console.log("\n⏳ Transaction sent:", tx.hash);

  await tx.wait();
  console.log("✅ Ownership transferred successfully!");

  // Verify
  const verifyOwner = await contract.owner();
  console.log("New Owner:", verifyOwner);
  console.log("Verification:", verifyOwner === newOwner ? "✅ Confirmed" : "❌ Failed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
