// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFTSTORE is ERC721URIStorage {
    address payable public marketplaceOwner;
    uint256 public listingFeePercent = 20;
    uint256 public royaltyPercent = 5;  // Adjustable royalty percentage
    uint256 private currentTokenId;
    uint256 private totalItemsSold;

    struct nftListing {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        address payable creator;
        uint256 price;
    }

    struct nftAuction {
        uint256 tokenId;
        address payable creator;
        uint256 startingPrice;
        uint256 highestBid;
        address payable highestBidder;
        uint256 endTime;
        bool ended;
    }

    mapping (uint256 => nftListing) private tokenIdToListing;
    mapping (uint256 => nftAuction) private tokenIdToAuction;

    modifier onlyMarketplaceOwner {
        require(msg.sender == marketplaceOwner, "Only Owner Can Access This");
        _;
    }

    constructor() ERC721("NFTSTORE", "NFS") {
        marketplaceOwner = payable(msg.sender);
    }

    // Helper functions
    function updateListingFeePercent(uint256 _listingFeePercent) public onlyMarketplaceOwner {
        listingFeePercent = _listingFeePercent;
    }

    function getListingFeePercent() public view returns (uint256) {
        return listingFeePercent;
    }

    function updateRoyaltyPercent(uint256 _royaltyPercent) public onlyMarketplaceOwner {
        royaltyPercent = _royaltyPercent;
    }

    function getRoyaltyPercent() public view returns (uint256) {
        return royaltyPercent;
    }

    function getCurrentTokenId() public view returns (uint256) {
        return currentTokenId;
    }

    function getNFTListing(uint256 _tokenId) public view returns (nftListing memory) {
        return tokenIdToListing[_tokenId];
    }

    function getNFTAuction(uint256 _tokenId) public view returns (nftAuction memory) {
        return tokenIdToAuction[_tokenId];
    }

    // Main functions
    function createNftListing(uint256 _tokenId, uint256 _price) private {
        tokenIdToListing[_tokenId] = nftListing({
            tokenId: _tokenId,
            owner: payable(msg.sender),
            seller: payable(msg.sender),
            creator: payable(msg.sender),
            price: _price
        });
    }

    function createToken(string memory _tokenURI, uint256 _price) public returns (uint256) {
        require(_price > 0, "Price must be greater than zero");

        currentTokenId++;
        uint256 newTokenId = currentTokenId;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);

        createNftListing(newTokenId, _price);

        return newTokenId;
    }

    function sellNFT(uint256 tokenId) public payable {
        nftListing storage listing = tokenIdToListing[tokenId];
        uint256 price = listing.price;
        address payable seller = listing.seller;
        address payable creator = listing.creator;

        require(msg.value == price, "Please pay the asking price");

        // Calculate the royalty
        uint256 royalty = (price * royaltyPercent) / 100;

        // Update the seller to the buyer
        listing.seller = payable(msg.sender);

        // Transfer the NFT to the buyer
        _transfer(listing.owner, msg.sender, tokenId);

        // Transfer the marketplace listing fee to the marketplace owner
        uint256 listingFee = (price * listingFeePercent) / 100;
        marketplaceOwner.transfer(listingFee);

        // Transfer the royalty to the creator
        creator.transfer(royalty);

        // Transfer the remaining amount to the seller
        seller.transfer(msg.value - listingFee - royalty);

        totalItemsSold++;
    }

    function createAuction(uint256 _tokenId, uint256 _startingPrice, uint256 _duration) public {
        require(ownerOf(_tokenId) == msg.sender, "You are not the owner of this NFT");
        require(_duration > 0, "Auction duration must be greater than zero");

        tokenIdToAuction[_tokenId] = nftAuction({
            tokenId: _tokenId,
            creator: payable(msg.sender),
            startingPrice: _startingPrice,
            highestBid: 0,
            highestBidder: payable(address(0)),
            endTime: block.timestamp + _duration,
            ended: false
        });
    }

    function placeBid(uint256 _tokenId) public payable {
        nftAuction storage auction = tokenIdToAuction[_tokenId];

        require(block.timestamp < auction.endTime, "Auction has ended");
        require(msg.value > auction.highestBid && msg.value >= auction.startingPrice, "Bid must be higher than the current highest bid");

        // Refund the previous highest bidder
        if (auction.highestBidder != address(0)) {
            auction.highestBidder.transfer(auction.highestBid);
        }

        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);
    }

    function endAuction(uint256 _tokenId) public {
        nftAuction storage auction = tokenIdToAuction[_tokenId];

        require(block.timestamp >= auction.endTime, "Auction has not ended yet");
        require(!auction.ended, "Auction has already ended");

        auction.ended = true;

        if (auction.highestBidder != address(0)) {
            // Transfer the NFT to the highest bidder
            _transfer(auction.creator, auction.highestBidder, _tokenId);
            // Transfer the auction funds to the creator
            auction.creator.transfer(auction.highestBid);
        } else {
            // If no bids were placed, return the NFT to the creator
            auction.ended = true;
        }
    }

    function getAllListedNFTs() public view returns (nftListing[] memory) {
        uint256 totalNFTCount = currentTokenId;
        nftListing[] memory listedNFTs = new nftListing[](totalNFTCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalNFTCount; i++) {
            uint256 tokenId = i + 1;
            nftListing storage listing = tokenIdToListing[tokenId];
            listedNFTs[currentIndex] = listing;
            currentIndex += 1;
        }

        return listedNFTs;
    }

    function getMyNFTs() public view returns (nftListing[] memory) {
        uint256 totalNFTCount = currentTokenId;
        uint256 myNFTCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalNFTCount; i++) {
            if (tokenIdToListing[i + 1].owner == msg.sender || tokenIdToListing[i + 1].seller == msg.sender) {
                myNFTCount++;
            }
        }

        nftListing[] memory myNFTs = new nftListing[](myNFTCount);
        for (uint256 i = 0; i < totalNFTCount; i++) {
            if (tokenIdToListing[i + 1].owner == msg.sender || tokenIdToListing[i + 1].seller == msg.sender) {
                uint256 tokenId = i + 1;
                nftListing storage listing = tokenIdToListing[tokenId];
                myNFTs[currentIndex] = listing;
                currentIndex++;
            }
        }

        return myNFTs;
    }

    function getMyAuctionedNFTs() public view returns (nftAuction[] memory) {
        uint256 totalAuctionCount = currentTokenId;
        uint256 myAuctionCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalAuctionCount; i++) {
            if (tokenIdToAuction[i + 1].creator == msg.sender) {
                myAuctionCount++;
            }
        }

        nftAuction[] memory myAuctions = new nftAuction[](myAuctionCount);
        for (uint256 i = 0; i < totalAuctionCount; i++) {
            if (tokenIdToAuction[i + 1].creator == msg.sender) {
                uint256 tokenId = i + 1;
                nftAuction storage auction = tokenIdToAuction[tokenId];
                myAuctions[currentIndex] = auction;
                currentIndex++;
            }
        }

        return myAuctions;
    }

    function tradeNFT(address recipient, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this NFT");
        require(recipient != address(0), "Invalid recipient address");
        _transfer(msg.sender, recipient, tokenId);
        if (tokenIdToListing[tokenId].price > 0) {
            tokenIdToListing[tokenId].owner = payable(recipient);
            tokenIdToListing[tokenId].seller = payable(recipient);
        }
    }
}
