import axios from "axios";
import Cors from "cors";
import validateRequest from "../helpers/validateRequest";
import {
  createYdiyoiUser,
  getYditoiUsers,
} from "../controllers/ydiyoiController";
import { getUsers } from "../controllers/userController";

// Inicializar el middleware CORS
const cors = Cors({
  methods: ["GET", "POST", "OPTIONS"],
});

// Helper method para ejecutar middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  // const isValidApiRequest = await validateRequest(req);
  // if (!isValidApiRequest) {
  //   return res.status(401).json("INVALID CREDENTIALS");
  // }

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    try {
      const { cid } = req.query;
      console.log(`Attempting to fetch CID: ${cid}`);

      const response = await axios.get(`https://ipfs.io/ipfs/${cid}`, {
        timeout: 10000,
      });
      console.log(response.data);

      const data = response.data;
      res.status(200).json(data);
    } catch (error) {
      console.error("Error al obtener el contenido IPFS:", error.message);
      res.status(500).json({
        message: "Error al obtener el contenido IPFS",
        error: error.message,
      });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
