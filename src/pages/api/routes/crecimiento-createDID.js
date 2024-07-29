import { createDID } from "@/config/servicesCrecimiento";

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

  try {
    const result = await createDID();
    console.log(result);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
