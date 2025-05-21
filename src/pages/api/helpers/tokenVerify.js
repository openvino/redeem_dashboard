import { getToken, jwt } from 'next-auth/jwt'

export default async function tokenVerify(req) {
  const secret = process.env.JWT_SECRET

    const jwt = await getToken({ req, secret })

    if (!jwt) {
     
      return false
    } else {
        return true
    }

}
