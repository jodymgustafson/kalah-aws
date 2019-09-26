import { APIGatewayProxyResult } from "aws-lambda";

export function success(body: any = "OK") {
    return buildResponse(200, body);
}

export function created(body: any) {
    return buildResponse(201, body);
}

export function failure(body: any = "Error") {
    return buildResponse(500, body);
}

function buildResponse(statusCode: number, body: any): APIGatewayProxyResult {
    return {
        statusCode: statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(body)
    };
}