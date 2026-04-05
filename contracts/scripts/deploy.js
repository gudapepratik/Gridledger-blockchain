const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("=================================================");
  console.log("  GridLedger — Sepolia Deployment");
  console.log("=================================================");
  console.log(`  Deployer : ${deployer.address}`);
  console.log(`  Network  : ${hre.network.name}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`  Balance  : ${hre.ethers.formatEther(balance)} ETH`);
  console.log("-------------------------------------------------");

  if (balance === 0n) {
    throw new Error("Deployer wallet has 0 ETH — fund it with Sepolia test ETH first.");
  }

  // ── 1. Deploy EnergyToken ──────────────────────────────
  console.log("\n[1/3] Deploying EnergyToken...");
  const EnergyToken = await hre.ethers.getContractFactory("EnergyToken");
  const token = await EnergyToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`      ✔ EnergyToken deployed at: ${tokenAddress}`);

  // ── 2. Deploy Marketplace ──────────────────────────────
  console.log("\n[2/3] Deploying Marketplace...");
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const market = await Marketplace.deploy(tokenAddress);
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log(`      ✔ Marketplace deployed at: ${marketAddress}`);

  // ── 3. Grant Oracle roles ──────────────────────────────
  // Grant MINTER_ROLE and BURNER_ROLE to the Oracle wallet
  // (the deployer wallet IS the oracle wallet in this setup)
  console.log("\n[3/3] Granting Oracle roles...");
  const MINTER_ROLE = hre.ethers.id("MINTER_ROLE");
  const BURNER_ROLE  = hre.ethers.id("BURNER_ROLE");

  let tx = await token.grantRole(MINTER_ROLE, deployer.address);
  await tx.wait();
  console.log(`      ✔ MINTER_ROLE granted to ${deployer.address}`);

  tx = await token.grantRole(BURNER_ROLE, deployer.address);
  await tx.wait();
  console.log(`      ✔ BURNER_ROLE granted to ${deployer.address}`);

  // Also grant Marketplace the ability to transfer tokens out of escrow
  // (Marketplace needs to be approved by sellers — handled on frontend,
  //  but the oracle also needs to approve for its own sells in future)

  // ── Save addresses ──────────────────────────────────────
  const deployment = {
    network:   hre.network.name,
    deployedAt: new Date().toISOString(),
    deployer:  deployer.address,
    contracts: {
      EnergyToken: tokenAddress,
      Marketplace: marketAddress,
    },
  };

  const outDir  = path.join(__dirname, "..", "deployments");
  const outFile = path.join(outDir, `${hre.network.name}.json`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));
  console.log(`\n      ✔ Deployment info saved → deployments/${hre.network.name}.json`);

  // ── Print env snippet ───────────────────────────────────
  console.log("\n=================================================");
  console.log("  Add these to your backend/.env:");
  console.log("=================================================");
  console.log(`CONTRACT_ADDRESS_TOKEN=${tokenAddress}`);
  console.log(`CONTRACT_ADDRESS_MARKET=${marketAddress}`);
  console.log("=================================================\n");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
