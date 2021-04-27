// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '0gnoun2el1'
export const apiEndpoint = `https://${apiId}.execute-api.eu-west-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'serverless-todo.us.auth0.com',            // Auth0 domain
  clientId: 'pNcWxtEl9UzFhxVjQgSixhE3NoeE0RSK',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
