export class Entry {
    constructor(
        public readonly id: string,
        public readonly transactionId: string,
        public readonly accountId: string,
        private _amount: number,
        public readonly createdAt: Date,
        private _updatedAt: Date
    ) {
        this.validateAmount(_amount);
    }

    get amount(): number {
        return this._amount;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    changeAmount(newAmount: number): void {
        this.validateAmount(newAmount);
        this._amount = newAmount;
        this._updatedAt = new Date();
    }

    private validateAmount(amount: number): void {
        if (amount === 0) {
            throw new Error('Entry amount cannot be zero');
        }
    }
}