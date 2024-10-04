// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";

contract NFTAuction {
    // Address of the NFT store contract
    address public nftStoreAddress;
    IERC721 public nftContract;

    struct Auction {
        address payable seller;
        uint256 tokenId;
        uint256 minBidAmount;
        uint256 auctionEndTime;
        address highestBidder;
        uint256 highestBid;
        bool ended;
    }

    // Mapping of auction ID to Auction struct
    Auction[] public auctions;

    event AuctionCreated(uint256 auctionId, address seller, uint256 tokenId, uint256 minBidAmount, uint256 auctionEndTime);
    event NewBid(uint256 auctionId, address bidder, uint256 amount);
    event AuctionEnded(uint256 auctionId, address winner, uint256 amount);

    // Constructor accepting NFT store address
    constructor(address _nftContract, address _nftStoreAddress) {
        nftContract = IERC721(_nftContract);
        nftStoreAddress = _nftStoreAddress; // Set the NFT store address
    }

    // Function to create an auction
    function createAuction(uint256 _tokenId, uint256 _minBidAmount, uint256 _duration) external {
        require(nftContract.ownerOf(_tokenId) == msg.sender, "You must own the NFT to create an auction.");
        require(_minBidAmount > 0, "Minimum bid must be greater than 0.");

        // Transfer the NFT to the auction contract (escrow)
        nftContract.transferFrom(msg.sender, address(this), _tokenId);

        // Create a new auction
        Auction memory newAuction = Auction({
            seller: payable(msg.sender),
            tokenId: _tokenId,
            minBidAmount: _minBidAmount,
            auctionEndTime: block.timestamp + _duration,
            highestBidder: address(0),
            highestBid: 0,
            ended: false
        });

        auctions.push(newAuction);
        uint256 auctionId = auctions.length - 1; // Get the ID of the newly created auction

        emit AuctionCreated(auctionId, msg.sender, _tokenId, _minBidAmount, newAuction.auctionEndTime);
    }

    // Function to place a bid on an auction
    function placeBid(uint256 auctionId) external payable {
        Auction storage auction = auctions[auctionId];

        require(block.timestamp < auction.auctionEndTime, "Auction already ended.");
        require(msg.value > auction.highestBid && msg.value >= auction.minBidAmount, "Bid must be higher than the current highest bid and minimum bid.");

        if (auction.highestBid != 0) {
            // Refund the previously highest bidder
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;

        emit NewBid(auctionId, msg.sender, msg.value);
    }

    // Function to end the auction
    function endAuction(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];

        require(block.timestamp >= auction.auctionEndTime, "Auction not yet ended.");
        require(!auction.ended, "Auction end already called.");

        auction.ended = true;

        emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);

        // Transfer NFT to the highest bidder
        if (auction.highestBidder != address(0)) {
            nftContract.safeTransferFrom(address(this), auction.highestBidder, auction.tokenId);
            // Transfer the highest bid amount to the seller
            auction.seller.transfer(auction.highestBid);
        } else {
            // If no bids were placed, transfer the NFT back to the seller
            nftContract.safeTransferFrom(address(this), auction.seller, auction.tokenId);
        }
    }

    // Function to get all auctioned NFTs
    function getAllAuctionedNFTs() external view returns (Auction[] memory) {
        return auctions;
    }
}
