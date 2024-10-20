// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract NeuromintNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    struct NFTMetadata {
        address owner;
        uint256 focusScore;
        string imageURI;
    }

    NFTMetadata[] public allNFTs;

    constructor() ERC721("Neurosaur", "NMNT") Ownable(msg.sender) {}

    function mintNFT(string memory ipfsHash, uint256 focusScore) public {
        uint256 newTokenId = tokenCounter;
        _safeMint(msg.sender, newTokenId);

        string memory tokenURI = generateTokenURI(ipfsHash, focusScore);
        _setTokenURI(newTokenId, tokenURI);

        allNFTs.push(NFTMetadata(msg.sender, focusScore, ipfsHash));
        tokenCounter++;
    }

    function generateTokenURI(string memory ipfsHash, uint256 focusScore) internal pure returns (string memory) {
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Neurosaur NFT", ',
                        '"description": "A Neurosaur NFT with a big brain and a focus score", ',
                        '"image": "ipfs://', ipfsHash, '", ',
                        '"attributes": [{"trait_type": "Focus Score", "value": "', Strings.toString(focusScore), '"}]}'
                    )
                )
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function getAllNFTsData() public view returns (NFTMetadata[] memory) {
        return allNFTs;
    }
}
