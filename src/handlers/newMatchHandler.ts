import { Context, APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import DynamoDbDataStore from "../aws/dynamoDbDataStore";
import MatchRepository from "../util/matchRepository";
import { success, failure } from "../util/responseLib";

export default async function newMatchHandler(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult>
{
    const count = event.pathParameters["count"];
    const seedCount = count ? parseInt(count) : 3;
    console.log("Seed count: " + seedCount);
    if (!Number.isFinite(seedCount) || seedCount < 3 || seedCount > 6) {
        return failure("Count must be a number from 3 to 6");
    }

    const repo = new MatchRepository(new DynamoDbDataStore());
    let matchInfo = await repo.createMatch(seedCount);
    if (matchInfo) {
        return success({
                matchId: matchInfo.matchId,
                seedCount: matchInfo.seedCount,
                expires: matchInfo.expires
            });
    }
    else {
        console.error("Error creating match");
        return failure();
    }
}
