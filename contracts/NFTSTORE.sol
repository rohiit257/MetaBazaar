// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFTSTORE is ERC721URIStorage {
    address payable public marketplaceOwner;
    uint256 public listingFeePercent = 20;
    uint256 private currentTokenId;
    uint256 private totalItemsSold;

    struct nftListing{
        uint256 tokedId;
        address payable owner;
        address payable seller;
        uint256 price;
    }

    mapping (uin256 => nftListing) private tokenIdtoListing;

    modifier onlyOwner {
        require(msg.sender == marketplaceOwner,"Only Owner Can Access This");
        _;
    }

    constructor() ERC721(NFTSTORE, "NFS"){
        marketplaceOwner = payable(msg.sender);
    }

    //helper functions
    function updateListingFeePercent(uin256 _listingFeePercent) public onlyOwner {
        listingFeePercent = _listingFeePercent;
    }

    function getListingFeePercent() public view returns(uint256){
        return listingFeePercent;
    }

    function getCurrentTokenId() public view returns(uint256){
        return currentTokenId;
    }

    function getNFTListing(uint256 _tokenId) public view returns(nftListing memory){
        return tokenIdtoListing[_tokenId];
    }

    //main functions
    
}