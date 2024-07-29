import { createDID, webhook } from "@/config/servicesCrecimiento";
import axios from "axios";

const cmktUrl = process.env.NEXT_PUBLIC_CRYPTOMKT_URL;
const url = process.env.NEXT_PUBLIC_EXCHANGE_URL;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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

const openDoor = async () => {
  console.log("Abriendo puerta...");
  try {
    const res = await axios.post(
      "http://concepcion.treetech.com.ar:1080/control",
      { status: "Open" }
    );
    console.log("Puerta abierta!");
    console.log("Door Response: ", doorResponse);
  } catch (error) {
    console.log(error);
  }
};
