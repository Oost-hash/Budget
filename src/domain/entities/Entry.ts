export class Entry {
    constructor(
        public readonly id: string,
        public readonly transactionId: string,
        public readonly accountId: string,
        private _amount: number,
    ) {
        this.validateAmount(_amount);
    }

    get amount(): number {
        return this._amount;
    }

    changeAmount(newAmount: number): void {
        this.validateAmount(newAmount);
        this._amount = newAmount;
    }

    private validateAmount(amount: number): void {
        if (amount === 0) {
            throw new Error('Entry amount cannot be zero');
        }
    }
}