//Created as part of rubric to separate IO from Business Logic

import {TodoItem} from '../src/models/TodoItem' //Importing TodoItem Data type from models
import {TodoDelete} from '../src/models/TodoDelete' //Importing TodoDelete Data type from models
import {TodoUpdate} from '../src/models/TodoUpdate' //Importing TodoUpdate Data type from models
import * as AWS from 'aws-sdk'
import {DocumentClient } from 'aws-sdk/clients/dynamodb'
import {createLogger} from '../src/utils/logger' //Importing createLogger for Logging events
import * as AWSXRay from 'aws-xray-sdk' 

//Changed import to instrument all AWS SDK clients reference: https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-awssdkclients.html
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS); // X-ray
const documentClient: DocumentClient =  createDynamoDBClient()

const Logging = createLogger('Todo_IO.ts_logs') //Creating Logs file for IO


export async function createTodo(ToDoitem: TodoItem): Promise<TodoItem> {
    await documentClient
    .put({
        TableName: process.env.TODOS_TABLE,
        Item: ToDoitem
      })
      .promise()  //added later after getting 404 error on attachmentUrl
    return ToDoitem
}

export async function deleteTodo(TodoItemDelete: TodoDelete): Promise<TodoDelete>{
    await documentClient
    .delete({
        TableName: process.env.TODOS_TABLE,
        Key: TodoItemDelete
      })
      .promise() //added later as the entry was not getting deleted from dB
    return TodoItemDelete 
}

export async function getAllTodo(userId:string): Promise<TodoItem[]>{
  Logging.info('Inside All Todo function', userId)
    const output = await documentClient.query({//reference taken from: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
        TableName: process.env.TODOS_TABLE,
        KeyConditionExpression: '#userId = :i',
        ExpressionAttributeNames: {
          '#userId': 'userId'
        },
        ExpressionAttributeValues: {
          ':i': userId
        }
      })
      .promise()
    //const AllItems = output.Items
return output.Items as TodoItem[]
}

export async function UpdateTodos(updateTodo:TodoUpdate,todoId:string, userId:string): Promise<void> {
    await documentClient.update({
        TableName: process.env.TODOS_TABLE,
        Key: {
            userId: userId,
            todoId: todoId
          },
          UpdateExpression: "set #name=:name, dueDate=:dueDate, done=:done",
          ExpressionAttributeValues:{
              ":name": updateTodo.name,
              ":dueDate": updateTodo.dueDate,
              ":done": updateTodo.done
          },
          ExpressionAttributeNames: {
            "#name": "name"
          }
    }).promise()
}


// Create Dynamo Db client
function createDynamoDBClient() {
    return new XAWS.DynamoDB.DocumentClient()
  }


