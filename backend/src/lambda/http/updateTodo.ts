import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import {getUserId} from '../utils'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import {createLogger} from '../../utils/logger' //Importing createLogger for Logging events
import {UpdateTodo} from '../../BusinessLogic'

const Logging = createLogger('updateTodo.ts_logs')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const user = getUserId(event) //to check authorized users access
  Logging.info('User access granted',user) //logging for user access

  const item = await UpdateTodo(updatedTodo, todoId, user) //Get 

  Logging.info('UpdatedTodoId',item) //logging for Updated ToDo List

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      'Access-Control-Allow-Headers': 'Accept'
    },
    body: JSON.stringify({
      item
    })
  }
}
