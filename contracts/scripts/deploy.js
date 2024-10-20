async function main() {
    const nft = await ethers.deployContract('NeuromintNFT');
    await nft.waitForDeployment();
    console.log("NFT contract deployed to: ", nft.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });