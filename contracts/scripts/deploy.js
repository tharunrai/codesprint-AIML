const hre = require("hardhat");
require("dotenv").config();

async function main() {
  try {
    console.log("Starting deployment of CredentialRegistry...\n");

    // Get the contract factory
    const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
    
    console.log(" Deploying contract...");
    const credentialRegistry = await CredentialRegistry.deploy();

    // Wait for deployment to finish
    await credentialRegistry.waitForDeployment();

    const contractAddress = await credentialRegistry.getAddress();

    console.log("\nCredentialRegistry deployed successfully!");
    console.log("Contract Address:", contractAddress);
    console.log("Network:", hre.network.name);
    
    // Verify on Etherscan if available
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      console.log("\n⏳ Waiting for block confirmations before verification...");
      await credentialRegistry.deploymentTransaction().wait(5);
      
      console.log("🔍 Verifying contract on Etherscan...");
      try {
        await hre.run("verify:verify", {
          address: contractAddress,
          constructorArguments: [],
        });
        console.log("Contract verified on Etherscan!");
      } catch (verifyError) {
        console.log("Verification skipped:", verifyError.message);
      }
    }

    // Save contract address to file
    const fs = require("fs");
    const path = require("path");
    
    const addressFile = path.join(__dirname, "../deployedAddress.json");
    const deploymentData = {
      contractAddress: contractAddress,
      network: hre.network.name,
      deployedAt: new Date().toISOString(),
      deployer: (await hre.ethers.getSigners())[0].address,
    };

    fs.writeFileSync(addressFile, JSON.stringify(deploymentData, null, 2));
    console.log("\nDeployment info saved to:", addressFile);

    // Transfer ownership if ADMIN_ADDRESS is set in .env
    const adminAddress = process.env.ADMIN_ADDRESS;
    if (adminAddress && adminAddress !== "" && adminAddress !== "0x0000000000000000000000000000000000000000") {
      console.log("\n🔐 Transferring ownership to ADMIN_ADDRESS...");
      console.log("Admin Address:", adminAddress);
      
      const newOwner = hre.ethers.getAddress(adminAddress);
      const tx = await credentialRegistry.transferOwnership(newOwner);
      await tx.wait();
      
      const verifyOwner = await credentialRegistry.owner();
      console.log("✅ Ownership transferred to:", verifyOwner);
    } else {
      console.log("\nℹ️ No ADMIN_ADDRESS set in .env, keeping deployer as owner");
    }

  } catch (error) {
    console.error("Deployment failed!");
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n🎉 Deployment complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
