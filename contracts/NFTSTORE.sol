// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFTSTORE is ERC721URIStorage {
    address payable public marketplaceOwner;
    uint256 public listingFeePercent = 20;
    uint256 public royaltyPercent = 5;
    uint256 private currentTokenId;
    uint256 private totalItemsSold;

    struct nftListing {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        address payable creator;
        uint256 price;
        uint256 salesCount;
        uint256 lastTransactionTime;
    }

     struct Auction {
        uint256 tokenId;
        address payable seller;
        uint256 startTime;
        uint256 endTime;
        uint256 highestBid;
        address payable highestBidder;
        bool active;
    }

    mapping(uint256 => nftListing) private tokenIdToListing;
    mapping(uint256 => uint256[]) private priceHistory;  // Stores price history
     mapping(uint256 => Auction) private auctions;
    uint256[] private auctionedNFTs;

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

    function getPriceHistory(uint256 _tokenId) public view returns (uint256[] memory) {
        return priceHistory[_tokenId];
    }

    // Main functions
    function createNftListing(uint256 _tokenId, uint256 _price) private {
        tokenIdToListing[_tokenId] = nftListing({
            tokenId: _tokenId,
            owner: payable(msg.sender),
            seller: payable(msg.sender),
            creator: payable(msg.sender),
            price: _price,
            salesCount: 0,
            lastTransactionTime: block.timestamp
        });

        priceHistory[_tokenId].push(_price); // Store initial price
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

        // Transfer the NFT to the buyer
        _transfer(listing.owner, msg.sender, tokenId);

        // Transfer fees
        uint256 listingFee = (price * listingFeePercent) / 100;
        marketplaceOwner.transfer(listingFee);
        creator.transfer(royalty);
        seller.transfer(msg.value - listingFee - royalty);

        // Update ownership and price
        listing.owner = payable(msg.sender);
        listing.seller = payable(msg.sender);
        listing.salesCount++;
        listing.lastTransactionTime = block.timestamp;

        // Increase price by 2%
        uint256 newPrice = price + (price * 2) / 100;
        listing.price = newPrice;
        priceHistory[tokenId].push(newPrice); // Store price update

        totalItemsSold++;
    }

    function tradeNFT(address recipient, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this NFT");
        require(recipient != address(0), "Invalid recipient address");

        _transfer(msg.sender, recipient, tokenId);

        // Update listing data
        nftListing storage listing = tokenIdToListing[tokenId];
        listing.owner = payable(recipient);
        listing.seller = payable(recipient);

        // Increase price by 2%
        uint256 newPrice = listing.price - (listing.price * 2) / 100;
        listing.price = newPrice;
        priceHistory[tokenId].push(newPrice); // Store price update
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


    function auctionNFT(uint256 _tokenId, uint256 _auctionDuration) public {
        require(ownerOf(_tokenId) == msg.sender, "You are not the owner");
        require(!auctions[_tokenId].active, "Already auctioned");

        auctions[_tokenId] = Auction({
            tokenId: _tokenId,
            seller: payable(msg.sender),
            startTime: block.timestamp,
            endTime: block.timestamp + _auctionDuration,
            highestBid: 0,
            highestBidder: payable(address(0)),
            active: true
        });
        auctionedNFTs.push(_tokenId);
    }

       function bid(uint256 _tokenId) public payable {
        Auction storage auction = auctions[_tokenId];
        require(auction.active, "NFT not in auction");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.value > auction.highestBid, "Bid too low");

        if (auction.highestBidder != address(0)) {
            auction.highestBidder.transfer(auction.highestBid);
        }

        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);

        // Update the listing price dynamically
        nftListing storage listing = tokenIdToListing[_tokenId];
        listing.price = msg.value;
        priceHistory[_tokenId].push(msg.value);
    }

    function finalizeAuction(uint256 _tokenId) public {
        Auction storage auction = auctions[_tokenId];
        require(auction.active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");

        auction.active = false;

        if (auction.highestBidder != address(0)) {
            _transfer(auction.seller, auction.highestBidder, _tokenId);
            auction.seller.transfer(auction.highestBid);
        }
    }

    function getAuctionedNFTs() public view returns (Auction[] memory) {
        Auction[] memory activeAuctions = new Auction[](auctionedNFTs.length);
        uint256 count = 0;

        for (uint256 i = 0; i < auctionedNFTs.length; i++) {
            uint256 tokenId = auctionedNFTs[i];
            if (auctions[tokenId].active) {
                activeAuctions[count] = auctions[tokenId];
                count++;
            }
        }

        return activeAuctions;
    }




}
