import { getPresentationQR } from "@/config/servicesCrecimiento";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { did } = req.query;
    const result = await getPresentationQR({
      did: did,
      inputDescriptors: [
        {
          id: "PopUpCityCredential",
          name: "PopUpCityCredential",
          constraints: {
            fields: [
              {
                path: ["$.credentialSubject.category"],
                filter: {
                  type: "string",
                },
              },
            ],
          },
        },
      ],
      issuer: {
        name: "Issuer Name",
        styles: {
          thumbnail: {
            uri: "https://dol.wa.com/logo.png",
            alt: "Issuer Name",
          },
          hero: {
            uri: "https://dol.wa.com/alumnos.png",
            alt: "Image Description",
          },
          background: {
            color: "#ff0000",
          },
          text: {
            color: "#d4d400",
          },
        },
      },
    });
    console.log(result);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
