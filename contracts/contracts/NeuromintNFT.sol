// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NeuromintNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenId = 0;

    struct NFTMetadata {
        address owner;
        uint256 focusScore;
        string imageURI;
    }

    NFTMetadata[] public allNFTs;

    constructor() ERC721("Neuromint", "NMNT") Ownable(msg.sender) {}

    function mintNFT(uint256 focusScore, string memory imageB64, string memory ipfs) public {
        _safeMint(msg.sender, _tokenId);
        _setTokenURI(
            _tokenId,
            "ipfs://QmWNff6ke3f9nbrLdWrD12aWMcJ2fqB1w4LpFJSPG1r63a" // ipfs
        );
        allNFTs.push(NFTMetadata(msg.sender, focusScore, imageB64));

        _tokenId++;
    }

    function getAllNFTsData() public view returns (NFTMetadata[] memory) {
        return allNFTs;
    }
}
