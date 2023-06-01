import { getToken, jwt } from 'next-auth/jwt'

export default async function tokenVerify(req) {
  const secret = process.env.JWT_SECRET

    // Verificar el token
    const jwt = await getToken({ req, secret })

    if (!jwt) {
      // El token no es válido o no está presente en la solicitud
      return false
    } else {
        return true
    }

}
