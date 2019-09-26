import { IDataStore, IMatchInfo, IGameState } from "../interfaces/dataStore";
import KalahGameController from "../game/kalahGameController";
import BinModel from "../game/binModel";

const MIN_KEY = 0x100000;
const MAX_KEY = 0xFFFFFF;

const EXPIRE_DAYS = 30;

const DEFAULT_STATE: IGameState = {
    board: [[0,0,0,0,0,0], [0,0,0,0,0,0]],
    player: 0,
    gameOver: false,
    score1: 0,
    score2: 0
}

export default class MatchRepository
{
    constructor(private dataStore: IDataStore)
    {
    }

    async createMatch(seedCount: number): Promise<IMatchInfo>
    {
        const matchId = Math.ceil(Math.random() * (MAX_KEY - MIN_KEY)) + MIN_KEY;
        const matchInfo: IMatchInfo = this.resetGame({
            matchId: matchId.toString(16),
            seedCount: seedCount,
            gameState: DEFAULT_STATE,
            expires: this.getExpirationDate()
        });

        const result = await this.dataStore.writeMatchInfo(matchInfo);
        console.log("Write match result:", result);
        return result ? matchInfo : null;
    }

    async resetMatch(matchId: string): Promise<boolean>
    {
        let info = await this.dataStore.readMatchInfo(matchId);
        if (info) {
            this.resetGame(info);
        }
        else {
            throw new Error("Unknown match: " + matchId);
        }
        return await this.dataStore.writeGameState(matchId, info.gameState);
    }

    async quitMatch(matchId: string): Promise<boolean>
    {
        return await this.dataStore.deleteMatchInfo(matchId);
    }

    async playBin(matchId: string, bin: number): Promise<IGameState>
    {
        const info = await this.dataStore.readMatchInfo(matchId);
        if (info)
        {
            const gameState = info.gameState
            const controller = new KalahGameController(info.seedCount);
            controller.setState({
                seedCount: info.seedCount,
                curPlayer: gameState.player,
                bins: this.toGameBins(gameState)
            });
            if (controller.playHouse(bin))
            {
                gameState.board = this.toBoard(controller.bins);
                gameState.score1 = controller.player1Score;
                gameState.score2 = controller.player2Score;
                gameState.player = controller.curPlayer;
                gameState.gameOver = controller.isGameOver();
                this.dataStore.writeGameState(matchId, gameState);
            }
            else
            {
                throw new Error("Invalid bin: " + bin);
            }

            return gameState;
        }

        throw new Error("Unknown match: " + matchId);
    }
    async getState(matchId: string): Promise<IGameState>
    {
        return this.dataStore.readGameState(matchId);
    }

    private toBoard(bins: BinModel[]): number[][]
    {
        const counts = bins.map(b => b.seedCount);
        return [
            counts.slice(0, 6),
            counts.slice(7, 13)
        ];
    }

    private toGameBins(gameState: IGameState): number[]
    {
        const board = gameState.board;
        let bins = Array(14);
        for (let player = 0; player < 2; player++)
        {
            const playerIdx = player * 7;
            for (let i = 0; i < 6; i++)
            {
                bins[playerIdx + i] = board[player][i];
            }
        }
        bins[6] = gameState.score1;
        bins[13] = gameState.score2;
        return bins;
    }

    private getExpirationDate(): Date {
        const expires = new Date();
        expires.setDate(expires.getDate() + EXPIRE_DAYS);
        return expires;
    }

    private resetGame(info: IMatchInfo): IMatchInfo
    {
        info.gameState = DEFAULT_STATE;
        info.gameState.board[0] = Array(6).fill(info.seedCount);
        info.gameState.board[1] = Array(6).fill(info.seedCount);
        return info;
    }
}