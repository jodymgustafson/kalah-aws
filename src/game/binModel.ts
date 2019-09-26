
/** A bin represents a house or a store */
export default class BinModel
{
    public seedCount = 0;
    private _isStore: boolean;

    /** Creates a bin
     * @argument player Player 0 or 1
     * @argument index House index 0 to 6 (6 is the player's store)
     */
    constructor(public player: number, public index: number)
    {
        this._isStore = (this.index == 6);
    }

    public isEmpty(): boolean
    {
        return this.seedCount === 0;
    }

    public isStore(): boolean
    {
        return this._isStore;
    }

    public isHouse(): boolean
    {
        return !this._isStore;
    }

    /** Gets the index of the bin in the array of all bins, from 0 to 13 */
    public getArrayIndex(): number
    {
        return this.player * 7 + this.index;
    }
}

