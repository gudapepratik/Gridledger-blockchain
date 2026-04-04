const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EnergyToken", function () {
  let EnergyToken;
  let energyToken;
  let owner;
  let minterBurner;
  let user1;
  let user2;

  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));

  beforeEach(async function () {
    [owner, minterBurner, user1, user2] = await ethers.getSigners();

    const EnergyTokenContract = await ethers.getContractFactory("EnergyToken");
    energyToken = await EnergyTokenContract.deploy(owner.address);
    
    // Grant minter and burner roles to minterBurner
    await energyToken.grantRole(MINTER_ROLE, minterBurner.address);
    await energyToken.grantRole(BURNER_ROLE, minterBurner.address);
  });

  describe("Deployment", function () {
    it("Should set the right default admin", async function () {
      const DEFAULT_ADMIN_ROLE = await energyToken.DEFAULT_ADMIN_ROLE();
      expect(await energyToken.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
    });

    it("Should grant minter and burner roles correctly", async function () {
      expect(await energyToken.hasRole(MINTER_ROLE, minterBurner.address)).to.equal(true);
      expect(await energyToken.hasRole(BURNER_ROLE, minterBurner.address)).to.equal(true);
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const amount = ethers.parseUnits("100", 18);
      const readingId = ethers.keccak256(ethers.toUtf8Bytes("reading1"));
      
      await expect(energyToken.connect(minterBurner).mint(user1.address, amount, readingId))
        .to.emit(energyToken, "EnergyMinted")
        .withArgs(user1.address, amount, readingId);
        
      expect(await energyToken.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should revert if non-minter tries to mint", async function () {
      const amount = ethers.parseUnits("100", 18);
      const readingId = ethers.keccak256(ethers.toUtf8Bytes("reading1"));
      
      await expect(energyToken.connect(user1).mint(user1.address, amount, readingId))
        .to.be.revertedWithCustomError(energyToken, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      const amount = ethers.parseUnits("100", 18);
      const readingId = ethers.keccak256(ethers.toUtf8Bytes("reading1"));
      await energyToken.connect(minterBurner).mint(user1.address, amount, readingId);
    });

    it("Should allow burner to burn tokens", async function () {
      const burnAmount = ethers.parseUnits("40", 18);
      const readingId = ethers.keccak256(ethers.toUtf8Bytes("reading2"));
      
      await expect(energyToken.connect(minterBurner).burn(user1.address, burnAmount, readingId))
        .to.emit(energyToken, "EnergyConsumed")
        .withArgs(user1.address, burnAmount, readingId);
        
      expect(await energyToken.balanceOf(user1.address)).to.equal(ethers.parseUnits("60", 18));
    });

    it("Should revert if burning more than balance", async function () {
      const burnAmount = ethers.parseUnits("200", 18);
      const readingId = ethers.keccak256(ethers.toUtf8Bytes("reading2"));
      
      await expect(energyToken.connect(minterBurner).burn(user1.address, burnAmount, readingId))
        .to.be.revertedWithCustomError(energyToken, "ERC20InsufficientBalance");
    });

    it("Should revert if non-burner tries to burn", async function () {
      const burnAmount = ethers.parseUnits("40", 18);
      const readingId = ethers.keccak256(ethers.toUtf8Bytes("reading2"));
      
      await expect(energyToken.connect(user2).burn(user1.address, burnAmount, readingId))
        .to.be.revertedWithCustomError(energyToken, "AccessControlUnauthorizedAccount");
    });
  });
});
