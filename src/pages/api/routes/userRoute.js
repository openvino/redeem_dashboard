// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { getUsers } from "../controllers/userController";

export default async function handler(req, res) {
  
    //TODO PROTEGER RUTAS
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json(error.message);
  }
}
