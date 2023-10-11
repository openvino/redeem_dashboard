const { ethers } = require('ethers');
//require('dotenv').config(); // Carga las variables de entorno desde el archivo .env NO SE USA POR ESTA EN .env.local de nextjs?
//const Web3 = require('web3');
//const web3 = new Web3();


async function resolveENS(ensName) {
  const ethereumProviderUrl = process.env.NEXT_PUBLIC_ETHEREUM_PROVIDER_URL;

  //console.log('ethereumProviderUrl>>>> ', ethereumProviderUrl);

  // Create an Ethereum provider using the URL from the environment variables
  const provider = new ethers.providers.JsonRpcProvider(ethereumProviderUrl);

  try {
    // Resolve ENS to address
    const address = await provider.resolveName(ensName);
    return address;
  } catch (error) {
    throw new Error('Error resolving ENS: ' + error.message);
  }
}


// // Función para verificar si la cadena es un ENS
// function isENS(input) {
//   // Comprueba si la cadena termina con ".eth" (dominio ENS)
//   return input.endsWith('.eth');
// }

// // Función para verificar si la cadena es una dirección Ethereum válida
// function isAddress(input) {
//   return web3.utils.isAddress(input);
// }

// if (isENS(input)) {
//   // La cadena es un ENS
//   console.log(`${input} es un ENS.`);
//   // Luego puedes resolver el ENS si lo deseas
//   resolveENS(input)
//     .then((address) => {
//       if (address) {
//         console.log(`ENS "${input}" resuelto a la dirección: ${address}`);
//       } else {
//         console.log(`ENS "${input}" no pudo ser resuelto.`);
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// } else if (isAddress(input)) {
//   // La cadena es una dirección Ethereum válida
//   console.log(`${input} es una dirección Ethereum válida.`);
//   // Haz lo que necesites hacer con la dirección
// } else {
//   // La cadena no es ni un ENS ni una dirección válida
//   console.log(`${input} no es un ENS ni una dirección Ethereum válida.`);
//   // Maneja el caso en el que no sea ni un ENS ni una dirección válida
// }


// Export the function so it can be used in other modules
module.exports = resolveENS;
