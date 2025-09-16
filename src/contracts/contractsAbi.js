import OpenvinoTokenArtifact from "../../contracts/artifacts/OVT.json";

export const tokenAbi =
  OpenvinoTokenArtifact.output.contracts["contracts/OpenVinoToken.sol"]
    .OpenVinoToken.abi;

export const tokenBytecode =
  OpenvinoTokenArtifact.output.contracts["contracts/OpenVinoToken.sol"]
    .OpenVinoToken.evm.bytecode.object;

export const crowdBytecode =
  OpenvinoTokenArtifact.output.contracts["contracts/Crowdsale.sol"].Crowdsale
    .evm.bytecode.object;

export const crowdAbi =
  OpenvinoTokenArtifact.output.contracts["contracts/Crowdsale.sol"].Crowdsale
    .abi;
