import { getToken, jwt } from "next-auth/jwt";

export default async function validateRequest(req) {
  const apiSecret = process.env.API_SECRET;
  const authHeader = req.headers.authorization;
  console.log(authHeader, apiSecret);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader?.split(" ")[1];

  if (token && token === apiSecret) {
    return true;
  } else {
    return false;
  }
}
