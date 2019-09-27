import { Context, APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import newMatchHandler from "./handlers/newMatchHandler";
import resetMatchHandler from "./handlers/resetMatchhandler";
import quitMatchHandler from "./handlers/quitMatchHandler";
import playBinHandler from "./handlers/playBinHandler";
import matchStateHandler from "./handlers/matchStateHandler";
import adminInfoHandler from "./handlers/adminInfoHandler";
import version from "./version";

console.log("Loading index function v" + version);

type APIGatewayEventHandler = (event: APIGatewayEvent, context: Context) => Promise<APIGatewayProxyResult>;

const handlerMap = new Map<string, APIGatewayEventHandler>([
    ["/match/new/{count}", newMatchHandler],
    ["/match/{matchId}/reset", resetMatchHandler],
    ["/match/{matchId}/quit", quitMatchHandler],
    ["/match/{matchId}/play/{bin}", playBinHandler],
    ["/match/{matchId}/state", matchStateHandler],
    ["/admin/info", adminInfoHandler]
]);

exports.handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>
{
    console.log("Handling request for: " + event.path);
    
    let handler = handlerMap.get(event.resource);
    if (!handler) {
        throw new Error("Unknown resource: " + event.resource);
    }

    const start = Date.now();
    console.log("Calling handler: ", handler.name);
    const result = await handler(event, context);
    console.log(`Handler finished in ${Date.now() - start}ms: ${handler.name}`);
    return result;
};
