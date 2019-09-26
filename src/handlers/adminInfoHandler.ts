import { Context, APIGatewayEvent } from "aws-lambda";
import { success } from "../util/responseLib";

export async function adminInfoHandler(event: APIGatewayEvent, context: Context)
{
    const body = getAdminInfo();
    console.log("Info: ", body);
    return success(body);
}

function getAdminInfo() {
    return {
        openMatches: 0,
        totalMatches: 0,
        abandonedMatches: 0
    };
}
