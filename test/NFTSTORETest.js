const { expect } = require("chai");
const { ethers } = require("hardhat");

let NFTSTORE, owner, addr1, addr2;

beforeEach(async function () {
  NFTSTORE = await ethers.deployContract("NFTSTORE");
  [owner, addr1, addr2, _] = await ethers.getSigners();
});

describe("Deployment", function () {
  it("Should set the right owner", async () => {
    const marketplaceOwner = await NFTSTORE.marketplaceOwner();
    expect(marketplaceOwner).to.equal(owner.address);
  });

  it("Should set the initial listing fee percentage", async function () {
    const listingFeePercentage = await NFTSTORE.getListingFeePercent();
    expect(listingFeePercentage).to.equal(20);
  });

  it("Should set the initial royalty percentage", async function () {
    const royaltyPercentage = await NFTSTORE.getRoyaltyPercent();
    expect(royaltyPercentage).to.equal(5);
  });
});

describe("Updating Listing Fee and Royalty", function () {
  it("Should update the listing fee percentage", async function () {
    await NFTSTORE.updateListingFeePercent(10);
    expect(await NFTSTORE.getListingFeePercent()).to.equal(10);
  });

  it("Should only allow the owner to update the listing fee percentage", async function () {
    await expect(
      NFTSTORE.connect(addr1).updateListingFeePercent(10)
    ).to.be.revertedWith("Only Owner Can Access This");
  });

  it("Should update the royalty percentage", async function () {
    await NFTSTORE.updateRoyaltyPercent(10);
    expect(await NFTSTORE.getRoyaltyPercent()).to.equal(10);
  });

  it("Should only allow the owner to update the royalty percentage", async function () {
    await expect(
      NFTSTORE.connect(addr1).updateRoyaltyPercent(10)
    ).to.be.revertedWith("Only Owner Can Access This");
  });
});

describe("Creating NFTs", function () {
  it("Should create a new token and listing", async function () {
    const tokenURI = "https://example.com/nft";
    const price = ethers.parseEther("1"); // Ensuring price is BigNumber

    console.log(`Price: ${price}, Type: ${typeof price}, Is BigNumber: ${price._isBigNumber}`);

    await NFTSTORE.createToken(tokenURI, price);

    const listing = await NFTSTORE.getNFTListing(1);
    expect(listing.tokenId).to.equal(1);
    expect(listing.owner).to.equal(owner.address);
    expect(listing.price).to.equal(price);
  });
});

describe("Executing Sales", function () {
  beforeEach(async function () {
    const tokenURI = "https://example.com/nft";
    const price = ethers.parseEther("1"); // Ensuring price is BigNumber
    await NFTSTORE.createToken(tokenURI, price);
  });

  it("Should execute a sale and transfer royalty to the creator", async function () {
    const price = ethers.parseEther("1"); // BigNumber
    const royaltyPercent = await NFTSTORE.getRoyaltyPercent();
    const royalty = price.toLocaleString(royaltyPercent).div(100); // Ensure BigNumber math

    // Debugging: Ensure values are BigNumber
    console.log(`Royalty: ${royalty.toString()}, Type: ${typeof royalty}, Is BigNumber: ${royalty._isBigNumber}`);

    // Record initial balances
    const creatorInitialBalance = await ethers.provider.getBalance(owner.address);
    const sellerInitialBalance = await ethers.provider.getBalance(addr1.address);

    // Execute sale
    await NFTSTORE.connect(addr1).sellNFT(1, { value: price });

    // Check final balances
    const creatorFinalBalance = await ethers.provider.getBalance(owner.address);
    const sellerFinalBalance = await ethers.provider.getBalance(addr1.address);

    // Calculate expected balances
    const listingFee = price.mul(await NFTSTORE.getListingFeePercent()).div(100); // Ensure BigNumber math
    const expectedCreatorFinalBalance = creatorInitialBalance.add(royalty);
    const expectedSellerFinalBalance = sellerInitialBalance.add(price.sub(listingFee).sub(royalty));

    // Debugging: Ensure values are BigNumber
    console.log(`ListingFee: ${listingFee.toString()}, Is BigNumber: ${listingFee._isBigNumber}`);

    // Check that the royalty was transferred correctly
    expect(creatorFinalBalance).to.equal(expectedCreatorFinalBalance);

    // Check that the seller received the remaining amount
    expect(sellerFinalBalance).to.equal(expectedSellerFinalBalance);
  });

  it("Should charge the correct listing fee and royalty", async function () {
    const price = ethers.parseEther("1"); // BigNumber
    const royaltyPercent = await NFTSTORE.getRoyaltyPercent();
    const royalty = price.mul(royaltyPercent).div(100); // BigNumber

    const listingFeePercent = await NFTSTORE.getListingFeePercent();
    const listingFee = price.mul(listingFeePercent).div(100); // BigNumber

    const sellerInitialBalance = await ethers.provider.getBalance(addr1.address);

    // Execute sale
    await NFTSTORE.connect(addr1).sellNFT(1, { value: price });

    const sellerFinalBalance = await ethers.provider.getBalance(addr1.address);
    const expectedSellerFinalBalance = sellerInitialBalance.add(price.sub(royalty).sub(listingFee));

    // Check that the seller received the correct amount after fees and royalty
    expect(sellerFinalBalance).to.equal(expectedSellerFinalBalance);
  });
});

describe("Retrieving NFTs", function () {
  beforeEach(async function () {
    const tokenURI1 = "https://example.com/nft1";
    const tokenURI2 = "https://example.com/nft2";
    const price = ethers.parseEther("1");

    await NFTSTORE.createToken(tokenURI1, price);
    await NFTSTORE.createToken(tokenURI2, price);
  });

  it("Should retrieve all listed NFTs", async function () {
    const allNFTs = await NFTSTORE.getAllListedNFTs();
    expect(allNFTs.length).to.equal(2);
  });

  it("Should retrieve my NFTs", async function () {
    const myNFTs = await NFTSTORE.getMyNFTs();
    expect(myNFTs.length).to.equal(2);
  });
});
