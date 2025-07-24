import { ethers } from "ethers";

export const deployContract = async (abi, bytecode, signer, args = []) => {
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(...args);
  await contract.deployed();
  return contract;
};
