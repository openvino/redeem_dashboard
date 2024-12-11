import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const apiKey = process.env.NEXT_PUBLIC_EXT_API_KEY;
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
				`${baseUrl}/credentialsbbs/waci/oob/presentation-proceed?apiKey=${apiKey}`,
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
			saveToAirtable(eventData);

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
	console.log("Verifier1 (PB)", process.env.NEXT_PUBLIC_VERIFIER1);
	console.log("Verifier2 (1er Piso)", process.env.NEXT_PUBLIC_VERIFIER2);
	console.log(
		"Verifier1 (PB) PRODUCTION",
		process.env.NEXT_PUBLIC_VERIFIER1_PRODUCTION
	);
	console.log(
		"Verifier2 (1er Piso) PRODUCTION",
		process.env.NEXT_PUBLIC_VERIFIER2_PRODUCTION
	);
	console.log("VerifierZapp", process.env.NEXT_PUBLIC_VERIFIER_ZAPP);

	console.log("VERIFIED: ", eventData.verified);
	console.log("invitationId: ", eventData.invitationId);

	let endpoint;

	if (
		eventData.verifierDID === process.env.NEXT_PUBLIC_VERIFIER1 ||
		eventData.verifierDID === process.env.NEXT_PUBLIC_VERIFIER1_PRODUCTION
	) {
		console.log("Verifier1 (PB)", eventData.verifierDID);
		endpoint = process.env.NEXT_PUBLIC_ENDPOINT1;
	} else if (
		eventData.verifierDID === process.env.NEXT_PUBLIC_VERIFIER2 ||
		eventData.verifierDID === process.env.NEXT_PUBLIC_VERIFIER2_PRODUCTION
	) {
		endpoint = process.env.NEXT_PUBLIC_ENDPOINT2;
		console.log("Verifier2 (1P)", eventData.verifierDID);
	} else if (eventData.verifierDID === process.env.NEXT_PUBLIC_VERIFIER_ZAPP) {
		endpoint = process.env.NEXT_PUBLIC_ENDPOINT_ZAPP;
		console.log("ZAPP", eventData.verifierDID);
	} else {
		console.log("Verifier not found");
		return;
	}

	console.log("Endpoint: ", endpoint);
	console.log(
		"****************************************************************"
	);

	try {
		if (eventData.verifierDID === process.env.NEXT_PUBLIC_VERIFIER_ZAPP) {
			console.log("zapp");

			console.log("BODY", {
				invitationId: eventData.invitationId,
				verified: eventData.verified,
				rawData: eventData,
			});

			const response = await axios.post(endpoint, {
				invitationId: eventData.invitationId,
				verified: eventData.verified,
				rawData: eventData,
			});
			console.log(response.data);
			return;
		}

		console.log("Abriendo puerta...", endpoint);
		const doorResponse = await axios.post(endpoint, { state: "open" });
		console.log("Puerta abierta!");
		console.log("Door Response: ", doorResponse.data);
	} catch (error) {
		console.log("Error al abrir la puerta ");
	}
};
const saveToAirtable = async (eventData) => {
	try {
		const response = await fetch(
			process.env.NEXT_PUBLIC_SHIBOLET_CRECIMIENTO_CHECKIN,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.NEXT_PUBLIC_SHIBOLET_TOKEN}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					did: responseJson.verifiableCredentials[0].credentialSubject.id,
					email: responseJson.verifiableCredentials[0].credentialSubject.email,
				}),
			}
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		// Handle the response data here
	} catch (error) {
		console.error("Error making POST request:", error);
	}
};
