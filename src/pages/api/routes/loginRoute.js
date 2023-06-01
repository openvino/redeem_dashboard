import { verify } from "jsonwebtoken";
import { serialize } from "cookie";
import { NextResponse } from "next/server";
export default async function handler(req, res) {


  try {
    const token = verify(
      req.body.token,
      process.env.NEXT_PUBLIC_JWT_SECRET
    );
      if(token) {
        const serialized = serialize('token',req.body.token, {
          httpOnly:true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 *24 *30,
          path: '/'
        })
            res.setHeader('Set-Cookie',serialized)
            res.redirect('/dashboard')
            res.status(200).json('Login sucess')

      }
  } catch (error) {
    res.status(404).json(error);
  }
}
