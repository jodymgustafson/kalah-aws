
export interface IGameState
{
    player: number;
    board: number[][];
    score1: number;
    score2: number;
    gameOver: boolean;
}

export interface IMatchInfo
{
    matchId: string;
    seedCount: number;
    expires?: Date;
    gameState?: IGameState;
}

export interface IDataStore
{
    writeMatchInfo(info: IMatchInfo): Promise<boolean>;
    readMatchInfo(matchId: string): Promise<IMatchInfo>;
    writeGameState(matchId: string, gameState: IGameState): Promise<boolean>;
    readGameState(matchId: string): Promise<IGameState>;
    deleteMatchInfo(matchId: string): Promise<boolean>;
}