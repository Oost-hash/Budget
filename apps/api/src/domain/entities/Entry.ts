import { Money } from "@domain/value-objects/Money";

export class Entry {
    constructor(
        public readonly id: string,
        public readonly transactionId: string,
        public readonly accountId: string,
        private _amount: Money,
    ) {
        this.validateAmount(_amount);
    }

    get amount(): Money {
        return this._amount;
    }

    changeAmount(newAmount: Money): void {
        this.validateAmount(newAmount);
        this._amount = newAmount;
    }

    private validateAmount(amount: Money): void {
        if (amount.isZero()) {
            throw new Error('Entry amount cannot be zero');
        }
    }
}