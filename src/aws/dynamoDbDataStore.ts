import { IMatchInfo, IGameState, IDataStore } from "../interfaces/dataStore";
import AWS = require("aws-sdk");

const TABLE_NAME = "kalah-matches";

export class DynamoDbDataStore implements IDataStore
{
    private dynamoDb = new AWS.DynamoDB.DocumentClient();

    async writeMatchInfo(info: IMatchInfo): Promise<boolean>
    {
        const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
            TableName: TABLE_NAME,
            Item: {
                matchId: info.matchId,
                seedCount: info.seedCount,
                expires: info.expires.toISOString(),
                gameState: JSON.stringify(info.gameState)
            }
        };

        console.log("Writing to dynamo:", params);
        let result = await this.dynamoDb.put(params).promise()
            .catch(error => {
                console.error("Put failed: ", error.message);
            });

        return Boolean(result);
    }

    async readMatchInfo(matchId: string): Promise<IMatchInfo>
    {
        const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
            TableName: TABLE_NAME,
            Key: { matchId: matchId }
        };
        let result = await this.dynamoDb.get(params).promise()
            .catch(error => console.error("Get failed: ", error.message));
        
        console.log("Got from Dynamo:", result);
        if (result && result.$response.data && result.$response.data.Item)
        {
            const info = result.$response.data.Item as IMatchInfo;
            info.gameState = JSON.parse(result.$response.data.Item.gameState);
            return info;
        }

        return null;
    }

    async writeGameState(matchId: string, gameState: IGameState): Promise<boolean> {
        const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
            TableName: TABLE_NAME,
            Key: {matchId: matchId},
            UpdateExpression: "SET gameState = :gameState",
            ExpressionAttributeValues: {":gameState": JSON.stringify(gameState)}
        };
        const result = await this.dynamoDb.update(params).promise()
            .catch(error => console.error("Error writing gameState: " + error.message));
        return Boolean(result);
    }

    async readGameState(matchId: string): Promise<IGameState> {
        const info = await this.readMatchInfo(matchId);
        return info.gameState;
    }

    async deleteMatchInfo(matchId: string): Promise<boolean>
    {
        const params = {
            TableName: TABLE_NAME,
            Key: {matchId: matchId}
        };
        console.log("Deleting: " + matchId);
        const result = await this.dynamoDb.delete(params).promise()
            .catch(error => console.error("Error deleting match: " + error.message));

        return Boolean(result);
    }
}
