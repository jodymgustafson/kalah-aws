import { Context, APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import DynamoDbDataStore from "../aws/dynamoDbDataStore";
import MatchRepository from "../util/matchRepository";
import { success, failure } from "../util/responseLib";

export default async function matchStateHandler(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult>
{
    const matchId = event.pathParameters["matchId"];
    console.log("Match id: ", matchId);

    const repo = new MatchRepository(new DynamoDbDataStore());
    const gameState = await repo.getState(matchId);
    if (gameState) {
        return success(gameState);
    }
    else {
        console.error("Error resetting match");
        return failure();
    }
}
