// scripts/deploy.js
async function main() {
    // Get the contract factory
    const NFTSTORE = await ethers.getContractFactory("NFTSTORE");
  
    // Deploy the contract
    const nftstore = await NFTSTORE.deploy();
   
  
    console.log("NFTSTORE deployed to:", nftstore.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  