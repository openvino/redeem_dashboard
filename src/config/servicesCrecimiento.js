const { default: axios } = require("axios");

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const websocket = process.env.NEXT_PUBLIC_CRECIMIENTO_WEBSOCKET;
const webhookURL = process.env.NEXT_PUBLIC_CRECIMIENTO_WEBHOOK;
const didMethod = "did:quarkid";

console.log(baseUrl);
console.log(websocket);
console.log(webhookURL);

async function getIssuanceQR(params) {
  const result = await axios.put(`${baseUrl}/credentialsbbs/wacioob`, params);
  return result.data;
}

async function getPresentationQR(params) {
  const result = await axios.put(
    `${baseUrl}/credentialsbbs/waci/oob/presentation`,
    params
  );
  return result.data;
}

async function interpretWACIFlow(params) {
  const result = await axios.put(`${baseUrl}/credentialsbbs/waci`, params);
  return result.data;
}

async function createDID() {
  const result = await axios.put(`${baseUrl}/dids/quarkid`, {
    websocket,
    webhookURL,
    didMethod,
  });

  return { did: result.data.did };
}

module.exports = {
  getIssuanceQR,
  getPresentationQR,
  interpretWACIFlow,
  createDID,
};
