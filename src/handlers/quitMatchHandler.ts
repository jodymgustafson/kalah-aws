import { Context, APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import DynamoDbDataStore from "../aws/dynamoDbDataStore";
import MatchRepository from "../util/matchRepository";
import { success, failure } from "../util/responseLib";

export default async function quitMatchHandler(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult>
{
    const matchId = event.pathParameters["matchId"];
    console.log("Match id: ", matchId);

    const repo = new MatchRepository(new DynamoDbDataStore());
    const result = await repo.quitMatch(matchId);
    if (result) {
        console.log("Deleted match: " + matchId);
        return success();
    }
    else {
        console.error("Error deleting match");
        return failure();
    }
}
