const hre = require("hardhat");
require("dotenv").config();

async function main() {
  try {
    console.log("Starting deployment of CredentialRegistry...\n");

    const collegeAddress = process.env.COLLEGE_ADDRESS;
    if (!collegeAddress || collegeAddress === "" || collegeAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("COLLEGE_ADDRESS must be set in .env");
    }
    console.log(`Using College Address: ${collegeAddress}`);

    // Get the contract factory
    const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
    
    console.log(" Deploying contract...");
    const credentialRegistry = await CredentialRegistry.deploy(collegeAddress);

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
          constructorArguments: [collegeAddress],
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
      collegeAddress: collegeAddress
    };

    fs.writeFileSync(addressFile, JSON.stringify(deploymentData, null, 2));
    console.log("\nDeployment info saved to:", addressFile);

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
