import { Money } from '@domain/value-objects/Money';
import { IBAN } from '@domain/value-objects/IBAN';

export class Account {
    constructor(
        public readonly id: string,
        private _name: string,
        private _type: 'asset' | 'liability',
        private _iban: IBAN | null,
        private _isSavings: boolean,
        private _overdraftLimit: Money,
        private _creditLimit: Money,
    ) {
        this.validateName(_name);
    }

    get name(): string {
        return this._name;
    }

    get type(): 'asset' | 'liability' {
        return this._type;
    }

    get iban(): IBAN | null {
        return this._iban;
    }

    get isSavings(): boolean {
        return this._isSavings;
    }

    get overdraftLimit(): Money {
        return this._overdraftLimit;
    }

    get creditLimit(): Money {
        return this._creditLimit;
    }

    rename(newName: string): void {
        this.validateName(newName);
        this._name = newName;
    }

    changeType(newType: 'asset' | 'liability'): void {
        this._type = newType;
    }

    changeIban(newIban: IBAN | null): void {
        this._iban = newIban;
    }

    toggleSavings(): void {
        this._isSavings = !this._isSavings;
    }

    setOverdraftLimit(newLimit: Money): void {
        this.validateOverdraftLimit(newLimit);
        this._overdraftLimit = newLimit;
    }

    setCreditLimit(newLimit: Money): void {
        this.validateCreditLimit(newLimit);
        this._creditLimit = newLimit;
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error('Account name cannot be empty');
        }
    }

    private validateOverdraftLimit(limit: Money): void {
        if (limit.isNegative()) {
            throw new Error('Overdraft limit cannot be negative');
        }
    }

    private validateCreditLimit(limit: Money): void {
        if (limit.isNegative()) {
            throw new Error('Credit limit cannot be negative');
        }
    }
}