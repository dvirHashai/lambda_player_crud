'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid-random');


module.exports = {
    create: async (event, context) => {
        console.log("create -> start with event:{} and context: {}", event, context)
        let bodyObj = {}
        try {
            bodyObj = JSON.parse(event.body)
        } catch (jsonError) {
            console.log('There was an error parsing the body', jsonError)
            return {
                statusCode: 400
            }
        }
        console.log("bodyObj: ", bodyObj);
        if (typeof bodyObj.name === 'undefined' ||
            typeof bodyObj.tokenId === 'undefined') {
            console.log('Missing parameters')
            return {
                statusCode: 400
            }
        }
        let putParams = {
            TableName: process.env.DYNAMODB_PLAYERS_TABLE,
            Item: {
                playerId: uuid(),
                tokenId: bodyObj.tokenId,
                name: bodyObj.name,
            }
        }
        console.log('putParams', putParams)

        let putResult = {}
        try {
            let dynamodb = new AWS.DynamoDB.DocumentClient()
            putResult = await dynamodb.put(putParams).promise()
        } catch (putError) {
            console.log('There aws a problem putting the player')
            console.log('putParams', putParams)
            console.log('putError', putError)
            return {
                statusCode: 500
            }

        }
        return {
            statusCode: 200
        }

    },
    list: async (event, context) => {
        console.log("list -> start with event:{} and context: {}", event, context);
        let scanParams = {
            TableName: process.env.DYNAMODB_PLAYERS_TABLE,
            // FilterExpression: 'isAvailable = :yes',
            // ExpressionAttributeValues: {':yes': true}
        };
        console.log('scanParams', scanParams);
        let scanResult = {};
        try {
            let dynamodb = new AWS.DynamoDB.DocumentClient();
            scanResult = await dynamodb.scan(scanParams).promise()
        } catch (scanError) {
            console.log('There aws a problem scanning the kitten')
            console.log('scanParams', scanParams)
            console.log('scanError', scanError)
            return {
                statusCode: 500
            }
        }
        console.log("scanResult", scanResult);
        if (scanResult.Items === null ||
            !Array.isArray(scanResult.Items) ||
            scanResult.Items.length === 0) {
            return {
                statusCode: 404
            }
        }
        return {
            statusCode: 200,
            body: JSON.stringify(scanResult.Items.map(player => {
                return {
                    playerId: player.playerId,
                    tokenId: player.tokenId,
                    name: player.name
                }
            }))
        }
    },
    get: async (event, context) => {
        console.log("get -> start with event:{} and context: {}", event, context);
        console.log("event", event);
        if (event.queryStringParameters.playerId === undefined) {
            return {
                statusCode: 404,
                massage: "Invalid Input"
            }
        }
        let playerId = event.queryStringParameters.playerId;
        let getParams = {
            TableName: process.env.DYNAMODB_PLAYERS_TABLE,
            Key: {
                'playerId': playerId
            },

        };
        console.log('getParams', getParams);
        let getResult = {};
        try {
            let dynamodb = new AWS.DynamoDB.DocumentClient();
            getResult = await dynamodb.get(getParams).promise()
        } catch (getError) {
            console.log('There aws a problem getting the kitten')
            console.log('getParams', getParams)
            console.log('getError', getError)
            return {
                statusCode: 500
            }
        }
        console.log('getResult', getResult)
        if (getResult.Item === null) {
            return {
                statusCode: 404
            }
        }
        return {
            statusCode: 200,
            body: JSON.stringify({
                playerId: getResult.Item.playerId,
                tokenId: getResult.Item.tokenId,
                name: getResult.Item.name
            })
        }
    },
    update: async (event, context) => {
        console.log("update -> start with event:{} and context: {}", event, context);
        console.log("event.queryStringParameters", event.queryStringParameters.playerId)
        console.log("event.body", event.body)
        let bodyObj = {}
        try {
            bodyObj = JSON.parse(event.body)
        } catch (jsonError) {
            console.log('There was an error parsing the body', jsonError)
            return {
                statusCode: 400
            }
        }
        if (event.queryStringParameters.playerId === undefined) {
            return {
                statusCode: 400,
                massage: "Invalid Input"
            }
        }
        let name = bodyObj.name;
        let tokenId = bodyObj.tokenId;
        let updateParams = {
            TableName: process.env.DYNAMODB_PLAYERS_TABLE,
            Key: {
                playerId: event.queryStringParameters.playerId
            },
            UpdateExpression: "SET name = :name, tokenId = :tokenId ",
            // ExpressionAttributeName: {'#name': 'name'},
            ExpressionAttributeValues: {
                ':name': name,
                ':tokenId': tokenId
            },
            ReturnValues: 'UPDATED_NEW'
        };
        let response = {};
        console.log("update -> updateParams : ", updateParams);
        try {
            let dynamodb = new AWS.DynamoDB.DocumentClient();
            response = await dynamodb.update(updateParams).promise()
        } catch (updateError) {
            console.log('There aws a problem update the player');
            console.log('updateParams', updateParams);
            console.log('updateError', updateError);
            return {
                statusCode: 500
            }
        }

        console.log("response", response);
        return {
            statusCode: 200
        }


    },
    delete: async (event, context) => {

        let deleteParams = {
            TableName: process.env.DYNAMODB_PLAYERS_TABLE,
            Key: {
                playerId: event.queryStringParameters.playerId
            }
        }
        let deleteResult = {}
        try {
            let dynamodb = new AWS.DynamoDB.DocumentClient();
            deleteResult = await dynamodb.delete(deleteParams).promise()
        } catch (deleteError) {
            console.log('There aws a problem getting the kitten')
            console.log('deleteParams', deleteParams)
            console.log('deleteError', deleteError)
            return {
                statusCode: 500
            }
        }
        console.log('deleteResult', deleteResult)
        return {
            statusCode: 200
        }
    },


};

