const { ethers } = require('ethers');

async function resolveENS(ensName) {
  const ethereumProviderUrl = process.env.NEXT_PUBLIC_ETHEREUM_PROVIDER_URL;

  const provider = new ethers.providers.JsonRpcProvider(ethereumProviderUrl);

  try {
    const address = await provider.resolveName(ensName);
    return address;
  } catch (error) {
    throw new Error('Error resolving ENS: ' + error.message);
  }
}

module.exports = resolveENS;
