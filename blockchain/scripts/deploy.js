const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("DEPLOYING FRAUD AUDIT LOG CONTRACT");

  // Get the deployer account
  // This is Hardhat's first test account automatically
  const [deployer] = await hre.ethers.getSigners();

  console.log("\nDeployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(
    "Deployer balance:",
    hre.ethers.formatEther(balance),
    "ETH (test)",
  );

  // Deploy the contract
  console.log("\nDeploying FraudAuditLog contract...");

  const FraudAuditLog = await hre.ethers.getContractFactory("FraudAuditLog");

  const fraudAuditLog = await FraudAuditLog.deploy();
  await fraudAuditLog.waitForDeployment();

  const contractAddress = await fraudAuditLog.getAddress();

  console.log("Contract deployed successfully!");
  console.log("Contract address:", contractAddress);

  // Verify deployment by calling a function
  const totalRecords = await fraudAuditLog.getTotalRecords();
  const owner = await fraudAuditLog.owner();

  console.log("\nVerification:");
  console.log("  Owner:         ", owner);
  console.log("  Total records: ", totalRecords.toString());
  console.log("  Status:         Ready to log fraud records");

  // Save deployment info to a JSON file
  // Flask backend reads this to know the contract address
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    network: "hardhat_local",
    deployedAt: new Date().toISOString(),
    contractName: "FraudAuditLog",
    abi_path: "./artifacts/contracts/FraudAuditLog.sol/FraudAuditLog.json",
  };

  // Save to blockchain folder
  const deploymentPath = path.join(__dirname, "../deployment_info.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to deployment_info.json");

  // Also save to backend folder so Flask can read it
  const backendPath = path.join(
    __dirname,
    "../../backend/deployment_info.json",
  );
  fs.writeFileSync(backendPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("DEPLOYMENT COMPLETE");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
