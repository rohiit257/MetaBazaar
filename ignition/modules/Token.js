const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const DeployModule = buildModule("TokenModule", (m) => {
  const nftStore = m.contract("NFTSTORE");  // Ensure contract name matches exactly
  return {nftStore};
});

module.exports = DeployModule;
