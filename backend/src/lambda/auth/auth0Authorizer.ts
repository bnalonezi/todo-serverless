import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

// const cert = `-----BEGIN CERTIFICATE-----
// MIIDEzCCAfugAwIBAgIJX1W/Kk+1A0ASMA0GCSqGSIb3DQEBCwUAMCcxJTAjBgNV
// BAMTHHNlcnZlcmxlc3MtdG9kby51cy5hdXRoMC5jb20wHhcNMjEwNDI0MDM0NzEx
// WhcNMzUwMTAxMDM0NzExWjAnMSUwIwYDVQQDExxzZXJ2ZXJsZXNzLXRvZG8udXMu
// YXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx2/Kn1Q8
// r4yLlqjp526zER7FZq7GkwDWI5QZc6SyQaxLJvXHzXLEQgj8b3WAdmxywJA6f3aT
// OA/vPp17GGUEtqGxWSqaca0UKujfm725CzeXsSTFj1ddSnj054G3UAwLrTCutaQP
// fD4KOFKtj8FEhnaY0R8isn8Wf+QCOKgxjQG9QjnDEBQKygFByRjKe0X0ADb7Ac53
// I/ZJvV7s+uMz5axJytZv/tWKnkSoq0WeSCvqmHz3AdoaUPlKvGd6FRf59PFpKq8U
// EPeJ8BrgQEUqciDUTMwRUDyCdcm0ylS2mbuwdhI8xA+YguS2jxOvbqpthSJgb1F+
// hbewUhgWFYSjyQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQp
// S2aC3fDkBJMe6VbezGzIdgsdwDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQEL
// BQADggEBAMJ2MoGwPbWxq/gluCiZMYAfFERcoyVrcgmU1fJPg3pY3JmB25Y7p0U0
// WqSdBsdfrCgvUIEBnl65ajJl6aOseaOQSEXbD1z0wR6xOhGcJKZaFoiNEWpS71CD
// vOshebuLzK3aYWXDQX9VKHHiYD9p5JknI0FvWS53otuoMvHgg3EgehHKmh5GSA4U
// kTC0b8jvGqKHsnLr79UKzTR3tyxGFwLxMsEj3wMkbZHTelLjDDlrJ+qqSk3v9lB3
// nBQppv/zHpfTrVtfs22AVJzZPdSnLAV3J5r7lksBjsgWu9avtr0FYjHjMxd8WQyf
// k1S46lvF5AoMnAo8FlBavCUwP3UiE4g=
// -----END CERTIFICATE-----`

let cachedCertificate: string
const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://serverless-todo.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

// async function verifyToken(authHeader: string): Promise<JwtPayload> {
//   const token = getToken(authHeader)
//   const cert = await getCertificate()
//   //const jwt: Jwt = decode(token, { complete: true }) as Jwt
//   // TODO: Implement token verification
//   // You should implement it similarly to how it was implemented for the exercise for the lesson 5
//   // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

//   return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
// }

// function getToken(authHeader: string): string {
//   if (!authHeader) throw new Error('No authentication header')

//   if (!authHeader.toLowerCase().startsWith('bearer '))
//     throw new Error('Invalid authentication header')

//   const split = authHeader.split(' ')
//   const token = split[1]

//   return token
// }

// async function getCertificate(): Promise<string> {
//   if (cachedCertificate) return cachedCertificate

//   const response = await Axios.get(jwksUrl)
//   const keys = response.data.keys

//   if (!keys || !keys.length) {
//     throw new Error('No certificate keys found')
//   }

//   const signingKeys = keys.filter(
//     key => key.use === 'sig'
//            && key.kty === 'RSA'
//            && key.alg === 'RS256'
//            && key.n
//            && key.e
//            && key.kid
//            && (key.x5c && key.x5c.length)
//   )

//   if (!signingKeys.length)
//     throw new Error('No certificate signing keys found')
  
//   const key = signingKeys[0]
//   const pub = key.x5c[0] 
//   cachedCertificate = parseCertificate(pub)

//   return cachedCertificate
// }

// function parseCertificate(cert: string): string {
//   cert = cert.match(/.{1,64}/g).join('\n')
//   cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
//   return cert
// }

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;
  const jwtKid = jwt.header.kid;
  let cert: string | Buffer;

  try {
    const jwks = await Axios.get(jwksUrl);
    const signingKey = jwks.data.keys.filter(k => k.kid === jwtKid)[0];

    if (!signingKey) {
      throw new Error(`Unable to find a signing key that matches '${jwtKid}'`);
    }
    const { x5c } = signingKey;

    cert = `-----BEGIN CERTIFICATE-----\n${x5c[0]}\n-----END CERTIFICATE-----`;
  } catch (error) {
    console.log('Error While getting Certificate : ', error);
  }

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload; //HS256 not working
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}