import MatchRepository from "../src/util/matchRepository";
import MockDataStore from "../src/mocks/mockDataStore";

async function testAsync()
{
    const repo = new MatchRepository(new MockDataStore());
    let matchInfo = await repo.createMatch(4);
    let gameState = await repo.playBin(matchInfo.matchId, 2);
    console.log(gameState);
    assertEqual(gameState.player, 0);
    assertEqual(gameState.score1, 1);
    assertEqual(gameState.score2, 0);
    gameState = await repo.playBin(matchInfo.matchId, 5);
    console.log(gameState);
    assertEqual(gameState.player, 1);
    assertEqual(gameState.score1, 2);
    assertEqual(gameState.score2, 0);
    // player 2
    gameState = await repo.playBin(matchInfo.matchId, 1);
    console.log(gameState);
    assertEqual(gameState.player, 1);
    assertEqual(gameState.score1, 2);
    assertEqual(gameState.score2, 1);

    await repo.playBin(matchInfo.matchId, 1)
        .then(() => { throw new Error("Should have got an error"); })
        .catch(error => {
            assertEqual(error.message, "Invalid bin: 1");
        });

    await repo.playBin(matchInfo.matchId, 100)
        .then(() => { throw new Error("Should have got an error"); })
        .catch(error => {
            assertEqual(error.message, "Invalid house number");
        });

    console.log("All tests passed");
}

function assertEqual(actual, expected): void
{
    if (actual !== expected) throw new Error(`Not equal: ${actual} : ${expected}`);
}

testAsync().then(() => console.log("done"));