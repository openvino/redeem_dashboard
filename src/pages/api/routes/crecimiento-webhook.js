import axios from "axios";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  let response;
  try {
    const { eventType, eventData } = req.body;

    if (eventType === "presentation-request") {
      response = await axios.put(
        `https://sandbox-ssi.extrimian.com/v1/credentialsbbs/waci/oob/presentation-proceed`,
        {
          invitationId: eventData.invitationId,
          verifiableCredentials: [eventData.credentialsToPresent[0].data],
        }
      );
    }

    console.log(
      "EVENTO ENVIADO A LA API: ",
      eventType,
      JSON.stringify(eventData)
    );

    if (!eventData.verified) {
      console.log("Not Verified :(");
      return;
    } else {
      openDoor(eventData);

      res.status(200).json("Flujo completado");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}

const openDoor = async (eventData) => {
  console.log(
    "****************************************************************"
  );
  console.log("verifierDID=", eventData.verifierDID);
  console.log("Verifier1", process.env.NEXT_PUBLIC_VERIFIER1);
  console.log("Verifier2", process.env.NEXT_PUBLIC_VERIFIER2);
  console.log(
    "****************************************************************"
  );
  let endpoint;

  if (eventData.verifierDID === process.env.NEXT_PUBLIC_VERIFIER1) {
    endpoint = process.env.NEXT_PUBLIC_ENDPOINT1;
  } else if (eventData.verifierDID === process.env.NEXT_PUBLIC_VERIFIER2) {
    endpoint = process.env.NEXT_PUBLIC_ENDPOINT2;
  } else {
    console.log("Verifier not found");
    return;
  }

  console.log("Abriendo puerta...", endpoint);
  try {
    const doorResponse = await axios.post(endpoint, { status: "Open" });
    console.log("Puerta abierta!");
    console.log("Door Response: ", doorResponse.verifiableCredentials);
  } catch (error) {
    console.log(error);
  }
};
