const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTSTORE Contract", function () {
  let NFTSTORE, nftStore, owner, addr1, addr2, addr3;

  beforeEach(async function () {
    NFTSTORE = await ethers.getContractFactory("NFTSTORE");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    nftStore = await NFTSTORE.deploy();
    await nftStore.deployed();
  });

  

  describe("Token Creation and Selling", function () {
    it("Should create a new token and list it", async function () {
      const tokenURI = "https://example.com/token/1";
      const price = ethers.utils.parseEther("1");

      await nftStore.createToken(tokenURI, price);

      const listing = await nftStore.getNFTListing(1);
      expect(listing.price).to.equal(price);
      expect(listing.owner).to.equal(owner.address);
    });

    it("Should allow buying of NFT", async function () {
      const tokenURI = "https://example.com/token/2";
      const price = ethers.utils.parseEther("1");
      await nftStore.createToken(tokenURI, price);

      await nftStore.connect(addr1).sellNFT(1, { value: price });

      const newOwner = await nftStore.ownerOf(1);
      expect(newOwner).to.equal(addr1.address);

      const listing = await nftStore.getNFTListing(1);
      expect(listing.owner).to.equal(addr1.address);
    });
  });

  describe("Auction Functionality", function () {
    it("Should create an auction", async function () {
      const tokenURI = "https://example.com/token/3";
      const price = ethers.utils.parseEther("1");
      await nftStore.createToken(tokenURI, price);
      
      await nftStore.createAuction(1, price, 3600); // 1 hour auction

      const auction = await nftStore.auctions(1);
      expect(auction.tokenId).to.equal(1);
      expect(auction.highestBid).to.equal(price);
      expect(auction.active).to.be.true;
    });

    it("Should allow bidding", async function () {
      const tokenURI = "https://example.com/token/4";
      const startPrice = ethers.utils.parseEther("1");
      await nftStore.createToken(tokenURI, startPrice);
      await nftStore.createAuction(1, startPrice, 3600); // 1 hour auction

      const bidAmount = ethers.utils.parseEther("1.5");
      await nftStore.connect(addr1).bid(1, { value: bidAmount });

      const auction = await nftStore.auctions(1);
      expect(auction.highestBidder).to.equal(addr1.address);
      expect(auction.highestBid).to.equal(bidAmount);
    });

    it("Should end the auction and transfer the NFT", async function () {
      const tokenURI = "https://example.com/token/5";
      const startPrice = ethers.utils.parseEther("1");
      await nftStore.createToken(tokenURI, startPrice);
      await nftStore.createAuction(1, startPrice, 3600); // 1 hour auction

      const bidAmount = ethers.utils.parseEther("1.5");
      await nftStore.connect(addr1).bid(1, { value: bidAmount });

      // Fast forward time to end the auction
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      await nftStore.endAuction(1);

      const newOwner = await nftStore.ownerOf(1);
      expect(newOwner).to.equal(addr1.address);

      const auction = await nftStore.auctions(1);
      expect(auction.active).to.be.false;
    });
  });
});
