import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  console.log('-----authorization----')
  console.log(authorization)

  console.log('-----split----')
  const split = authorization.split(' ')
  console.log(split)


  console.log('-----jwtToken----')
  const jwtToken = split[1]
  console.log(jwtToken)

  return parseUserId(jwtToken)
}