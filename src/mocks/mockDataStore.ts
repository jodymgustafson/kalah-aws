import { IMatchInfo, IGameState, IDataStore } from "../interfaces/dataStore";

export default class MockDataStore implements IDataStore
{
    private store = new Map<string, IMatchInfo>();

    async readMatchInfo(matchId: string): Promise<IMatchInfo> {
        const info = this.store.get(matchId);
        return info;
    }

    async writeMatchInfo(info: IMatchInfo): Promise<boolean> {
        this.store.set(info.matchId, info);
        return true;
    }

    async writeGameState(matchId: string, gameState: IGameState): Promise<boolean> {
        return this.readMatchInfo(matchId)
                    .then(info => {
                        info.gameState = gameState;
                        return info;
                    })
                    .then(info => this.writeMatchInfo(info));
    }

    async readGameState(matchId: string): Promise<IGameState> {
        return this.readMatchInfo(matchId)
                .then(info => info.gameState);
    }
    
    async deleteMatchInfo(matchId: string): Promise<boolean> {
        this.store.delete(matchId);
        return true;
    }
}