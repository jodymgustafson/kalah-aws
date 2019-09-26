import BinModel from "./binModel";
import IKalahGameState from "./kalahGameState";

export default class KalahGameController
{
    public bins: BinModel[] = [];
    public curPlayer = 0;
    private _seedCount = 3;
    public get seedCount() { return this._seedCount; }
    public debug = false;

    /** Function called when the board changes */
    public onChange?: (from: BinModel, to: BinModel, count: number, isSteal: boolean)=>any;

    /** Function called when the game has ended */
    public onGameOver?: ()=>any;

    public get player1Score(): number
    {
        return this.getPlayerStore(0).seedCount;
    }
    public get player2Score(): number
    {
        return this.getPlayerStore(1).seedCount;
    }

    constructor(seedCnt = 3)
    {
        this._seedCount = seedCnt;
        for (let player = 0; player < 2; player++)
        {
            for (let i = 0; i < 7; i++)
            {
                this.bins.push(new BinModel(player, i));
            }
        }

        this.reset();
    }

    public reset(): void
    {
        this.curPlayer = 0;

        this.bins.forEach(bin => {
            if (bin.isStore())
            {
                bin.seedCount = 0;
            }
            else
            {
                bin.seedCount = this.seedCount;
            }
        })
    }

    /** Playes a hosue for the current player
     * @argument houseNumber House to play (0 to 5)
     * @returns True if the play was valid
     */
    public playHouse(houseNumber: number): boolean
    {
        if (houseNumber < 0 || houseNumber > 5)
        {
            throw new Error("Invalid house number");
        }

        let houseIdx = this.getBinIndex(houseNumber);
        let fromHouse = this.bins[houseIdx];
        let seedCnt = fromHouse.seedCount;
        if (seedCnt > 0)
        {
            fromHouse.seedCount = 0;
            let bin = fromHouse;
            while (seedCnt > 0)
            {
                bin = this.bins[++houseIdx % 14];
                if (!bin.isStore() || this.curPlayer === bin.player)
                {
                    if (this.debug) console.log(`Moving seed from ${fromHouse.index} to ${bin.index}`);
                    bin.seedCount++;
                    if (this.onChange) this.onChange(fromHouse, bin, 1, false);
                    --seedCnt;
                }
            }

            if (this.curPlayer === bin.player)
            {
                // Last seed was on the player's side of the board
                if (bin.isStore())
                {
                    // free turn
                    this.curPlayer--;
                }
                else // bin.isHouse
                {
                    this.checkSteal(bin);
                }
            }

            if (this.checkGameOver())
            {
                if (this.onGameOver) this.onGameOver();
            }
            else
            {
                // Change player
                this.curPlayer = (this.curPlayer + 1) % 2;
            }
            return true;
        }

        // Invalid move
        return false;
    }

    private checkGameOver(): boolean
    {
        if (this.checkPlayerGameOver(0))
        {
            return true;
        }
        return this.checkPlayerGameOver(1);
    }

    private checkPlayerGameOver(player: number): boolean
    {
        let cnt = this.getPlayerHouses(player).reduce((acc, house) => acc + house.seedCount, 0); 
        if (cnt === 0)
        {
            //if (this.debug) console.log(`Player ${player} is out`)
            // Other player gets all their seeds
            let otherPlayer = (player + 1) % 2;
            this.getPlayerHouses(otherPlayer).forEach(house => {
                if (house.seedCount > 0)
                {
                    this.stealSeeds(house, otherPlayer);
                }
            });
            return true;
        }
        return false;
    }

    /** Gets all the houses that belong to the specified player */
    public getPlayerHouses(player: number = this.curPlayer): BinModel[]
    {
        return player === 0 ? this.bins.slice(0, 6) : this.bins.slice(7, 13);
    }

    /** Checks if the game is over
     * @param shortCircuit When true checks if the game is effectively over
     */
    public isGameOver(shortCircuit = false): boolean
    {
        let ttlSeeds = this.seedCount * 12;
        if (shortCircuit)
        {
            // If one player has more than half of the seeds they are effectively the winner
            ttlSeeds /= 2;
            return (this.player1Score > ttlSeeds || this.player2Score > ttlSeeds); 
        }
        return (ttlSeeds === this.player1Score + this.player2Score);
    }

    // private checkFreeTurn(bin: BinModel): boolean
    // {
    //     return (bin.isStore() && this.curPlayer === bin.player);
    // }   

    private checkSteal(house: BinModel): boolean
    {
        if (house.seedCount === 1)
        {
            let oppHouse = this.bins[12 - this.getBinIndex(house.index)];
            if (oppHouse.seedCount > 0)
            {
                this.stealSeeds(oppHouse);
                this.stealSeeds(house);
                return true;
            }
        }
        return false;
    }

    /** Gets the index within the array of all bins for the current player and bin number
     * @argument binNumber Player's bin number (0 to 6)
     */
    private getBinIndex(binNumber: number): number
    {
        return (this.curPlayer * 7 + binNumber);
    }

    /** Steals seeds from a player's house to the other player's store */
    private stealSeeds(fromHouse: BinModel, player = this.curPlayer): void
    {
        let store = this.getPlayerStore(player);
        store.seedCount += fromHouse.seedCount;
        if (this.debug) console.log(`Moving seeds from ${fromHouse.index} to player ${player} store`);
        if (this.onChange) this.onChange(fromHouse, store, fromHouse.seedCount, true);
        fromHouse.seedCount = 0;
    }

    private getPlayerStore(player: number): BinModel
    {
        return this.bins[player === 0 ? 6 : 13];
    }

    public toString(): string
    {
        let s = "";
        for (let i = 13; i > 6; i--)
        {
            s += this.bins[i].seedCount + " ";
        }
        s += "\n";
        for (let i = 0; i < 7; i++)
        {
            s += this.bins[i].seedCount + " ";
        }
        return s;
    }

    /** Gets the current state of the board */
    public getState(): IKalahGameState
    {
        return {
            bins: this.bins.map(bin => bin.seedCount),
            curPlayer: this.curPlayer,
            seedCount: this.seedCount
        };
    }

    /** Sets the state of the board */
    public setState(state: IKalahGameState): void
    {
        if (state.seedCount !== this.seedCount)
        {
            throw new Error("Invalid state. Seed count must match board's seed count.");
        }

        this.bins.forEach(bin => {
            bin.seedCount = state.bins[bin.getArrayIndex()];
        });
        this.curPlayer = state.curPlayer;
    }
}