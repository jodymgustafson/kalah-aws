import { Context, APIGatewayEvent } from "aws-lambda";
import { success } from "../util/responseLib";
import version from "../version";

export default async function adminInfoHandler(event: APIGatewayEvent, context: Context)
{
    const body = getAdminInfo();
    console.log("Info: ", body);
    return success(body);
}

function getAdminInfo() {
    return {
        openMatches: 0,
        totalMatches: 0,
        abandonedMatches: 0,
        version: version
    };
}
