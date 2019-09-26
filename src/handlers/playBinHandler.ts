import { Context, APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDbDataStore } from "../aws/dynamoDbDataStore";
import { MatchRepository } from "../util/matchRepository";
import { success, failure } from "../util/responseLib";

export async function playBinHandler(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult>
{
    const matchId = event.pathParameters["matchId"];
    const bin = parseInt(event.pathParameters["bin"]);
    console.log("Match id: ", matchId);
    console.log("bin: ", bin);

    let errorMessage = "";
    const repo = new MatchRepository(new DynamoDbDataStore());
    const gameState = await repo.playBin(matchId, bin)
        .catch(error => console.error(errorMessage = error.message));

    if (gameState) {
        return success(gameState);
    }
    else {
        console.error("Error playing: " + errorMessage);
        return failure(errorMessage);
    }
}

