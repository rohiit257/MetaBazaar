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
        uint256 salesCount;  // Track number of times sold
        uint256 lastTransactionTime;  // Track time of last sale
    }

    mapping (uint256 => nftListing) private tokenIdToListing;

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

    // Main functions
    function createNftListing(uint256 _tokenId, uint256 _price) private {
        tokenIdToListing[_tokenId] = nftListing({
            tokenId: _tokenId,
            owner: payable(msg.sender),
            seller: payable(msg.sender),
            creator: payable(msg.sender),
            price: _price,
            salesCount: 0,  // Initialize sales count
            lastTransactionTime: block.timestamp  // Initialize with current time
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

    // Function to dynamically update the price based on rules
    function updateNFTPrice(uint256 tokenId) internal {
        nftListing storage listing = tokenIdToListing[tokenId];
        uint256 currentPrice = listing.price;

        // Increase price by 10% for every 2 sales
        if (listing.salesCount % 2 == 0 && listing.salesCount > 0) {
            uint256 priceIncrease = (currentPrice * 10) / 100;
            listing.price += priceIncrease;
        }

        // Decrease the price by 8% if more than 36 hours have passed since the last sale
        if (block.timestamp > listing.lastTransactionTime + 36 hours) {
            uint256 priceDecrease = (listing.price * 8) / 100;
            listing.price -= priceDecrease;
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

     function tradeNFT(address recipient, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner of this NFT");
        require(recipient != address(0), "Invalid recipient address");

        _transfer(msg.sender, recipient, tokenId);

        if (tokenIdToListing[tokenId].price > 0) {
            tokenIdToListing[tokenId].owner = payable(recipient);
            tokenIdToListing[tokenId].seller = payable(recipient);
        }
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
}

