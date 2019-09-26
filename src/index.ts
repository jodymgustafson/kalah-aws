import { Context, APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import newMatchHandler from "./handlers/newMatchHandler";
import resetMatchHandler from "./handlers/resetMatchhandler";
import quitMatchHandler from "./handlers/quitMatchHandler";
import playBinHandler from "./handlers/playBinHandler";
import matchStateHandler from "./handlers/matchStateHandler";
import adminInfoHandler from "./handlers/adminInfoHandler";

console.log("Loading index function");

exports.handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>
{
    console.log("Handling request for: " + event.path);
    
    let handler: (event: APIGatewayEvent, context: Context) => Promise<APIGatewayProxyResult>;

    switch (event.resource)
    {
        case "/match/new/{count}":
            handler = newMatchHandler;
            break;
        case "/match/{matchId}/reset":
            handler = resetMatchHandler;
            break;
        case "/match/{matchId}/quit":
            handler = quitMatchHandler;
            break;
        case "/match/{matchId}/play/{bin}":
            handler = playBinHandler;
            break;
        case "/match/{matchId}/state":
            handler = matchStateHandler;
            break;
        case "/admin/info":
            handler = adminInfoHandler;
            break;
        default:
            throw new Error("Unknown resource: " + event.resource);
    }

    console.log("Calling handler: ", handler.name);
    return handler(event, context);
};

