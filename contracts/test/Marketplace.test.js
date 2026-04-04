const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
  let EnergyToken;
  let energyToken;
  let Marketplace;
  let marketplace;
  let owner;
  let seller;
  let buyer;

  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    const EnergyTokenContract = await ethers.getContractFactory("EnergyToken");
    energyToken = await EnergyTokenContract.deploy(owner.address);
    await energyToken.grantRole(MINTER_ROLE, owner.address);

    const MarketplaceContract = await ethers.getContractFactory("Marketplace");
    marketplace = await MarketplaceContract.deploy(await energyToken.getAddress());

    // Mint some ERT to seller for testing
    const amount = ethers.parseUnits("1000", 18);
    const readingId = ethers.keccak256(ethers.toUtf8Bytes("init"));
    await energyToken.mint(seller.address, amount, readingId);
    
    // Approve marketplace to spend seller's tokens
    await energyToken.connect(seller).approve(await marketplace.getAddress(), amount);
  });

  describe("Creating Orders", function () {
    it("Should create an order and lock tokens", async function () {
      const sellAmount = ethers.parseUnits("100", 18);
      const pricePerToken = ethers.parseEther("0.001");

      const tx = await marketplace.connect(seller).createOrder(sellAmount, pricePerToken);
      
      await expect(tx).to.emit(marketplace, "OrderCreated").withArgs(0, seller.address, sellAmount, pricePerToken);
      
      expect(await energyToken.balanceOf(await marketplace.getAddress())).to.equal(sellAmount);
      expect(await energyToken.balanceOf(seller.address)).to.equal(ethers.parseUnits("900", 18));

      const order = await marketplace.getOrder(0);
      expect(order.seller).to.equal(seller.address);
      expect(order.status).to.equal(0);
    });

    it("Should revert if selling 0 amount", async function () {
      await expect(marketplace.connect(seller).createOrder(0, 100))
        .to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Fulfilling Orders", function () {
    let sellAmount;
    let pricePerToken;

    beforeEach(async function () {
      sellAmount = ethers.parseUnits("100", 18);
      pricePerToken = ethers.parseEther("0.001"); // 0.001 eth per full ERT token
      await marketplace.connect(seller).createOrder(sellAmount, pricePerToken);
    });

    it("Should fulfill exact order amount and transfer funds/tokens", async function () {
      const amountToFill = ethers.parseUnits("50", 18);
      const requiredEth = (amountToFill * pricePerToken) / 10n**18n;

      const sellerInitialEth = await ethers.provider.getBalance(seller.address);

      const tx = await marketplace.connect(buyer).fulfillOrder(0, amountToFill, { value: requiredEth });
      await expect(tx).to.emit(marketplace, "OrderFulfilled").withArgs(0, buyer.address, amountToFill, requiredEth);

      expect(await energyToken.balanceOf(buyer.address)).to.equal(amountToFill);
      
      const sellerFinalEth = await ethers.provider.getBalance(seller.address);
      expect(sellerFinalEth).to.equal(sellerInitialEth + requiredEth);

      const order = await marketplace.getOrder(0);
      expect(order.filledAmount).to.equal(amountToFill);
      expect(order.status).to.equal(0); // Still active since remaining is 50
    });

    it("Should set status to Filled if fully purchased", async function () {
      const requiredEth = (sellAmount * pricePerToken) / 10n**18n;
      await marketplace.connect(buyer).fulfillOrder(0, sellAmount, { value: requiredEth });

      const order = await marketplace.getOrder(0);
      expect(order.status).to.equal(1); // 1 = Filled
      expect(order.filledAmount).to.equal(sellAmount);
    });

    it("Should revert if incorrect ETH is sent", async function () {
      const amountToFill = ethers.parseUnits("50", 18);
      await expect(marketplace.connect(buyer).fulfillOrder(0, amountToFill, { value: 100 }))
        .to.be.revertedWith("Incorrect ETH payment");
    });
  });

  describe("Cancelling Orders", function () {
    let sellAmount;

    beforeEach(async function () {
      sellAmount = ethers.parseUnits("100", 18);
      await marketplace.connect(seller).createOrder(sellAmount, ethers.parseEther("0.001"));
    });

    it("Should cancel active order and return tokens", async function () {
      await expect(marketplace.connect(seller).cancelOrder(0))
        .to.emit(marketplace, "OrderCancelled").withArgs(0);

      const order = await marketplace.getOrder(0);
      expect(order.status).to.equal(2); // 2 = Cancelled
      expect(await energyToken.balanceOf(seller.address)).to.equal(ethers.parseUnits("1000", 18));
      expect(await energyToken.balanceOf(await marketplace.getAddress())).to.equal(0n);
    });

    it("Should revert if non-seller tries to cancel", async function () {
      await expect(marketplace.connect(buyer).cancelOrder(0))
        .to.be.revertedWith("Only seller can cancel");
    });
  });
});
