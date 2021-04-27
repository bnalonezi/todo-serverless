import 'source-map-support/register'
import {createLogger} from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {uploadURL} from '../../BusinessLogic'
const Logging = createLogger('generateUploadUrl.ts_logs')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  const uploadURLItem = await uploadURL(todoId)

  Logging.info('Upload URL generated',uploadURLItem,todoId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PATCH',
      'Access-Control-Allow-Headers': 'Accept'
    },
    body: JSON.stringify({
      item: uploadURLItem
    })
}
}
