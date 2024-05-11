import validateRequest from "../helpers/validateRequest";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3002");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    
    const isValidApiRequest = await validateRequest(req);
    
    
    if (!isValidApiRequest) {
        return res.status(401).json("INVALID CREDENTIALS");
    }
    
    try {
        const {from, to} = req.query;
        console.log(from, to);
        const url = `${cmktUrl}?from=${from}&to=${to}`
        console.log(url);
        res.status(200).json(url);
    } catch (error) {
        console.error("Error in testRoute:", error);
        res.status(500).json("Error: " + error.message);
    }
}

