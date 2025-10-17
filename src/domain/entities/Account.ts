import { Money } from '@domain/value-objects/Money';

export class Account {
    constructor(
        public readonly id: string,
        private _name: string,
        private _type: 'asset' | 'liability',
        private _iban: string | null,
        private _isSavings: boolean,
        private _overdraftLimit: Money,
        private _creditLimit: Money,
        private _paymentDueDay: number | null,
    ) {
        this.validateName(_name);
        this.validateIban(_iban);
        this.validateOverdraftLimit(_overdraftLimit);
        this.validateCreditLimit(_creditLimit);
        this.validatePaymentDueDay(_paymentDueDay);
    }

    get name(): string {
        return this._name;
    }

    get type(): 'asset' | 'liability' {
        return this._type;
    }

    get iban(): string | null {
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

    get paymentDueDay(): number | null {
        return this._paymentDueDay;
    }

    rename(newName: string): void {
        this.validateName(newName);
        this._name = newName;
    }

    changeType(newType: 'asset' | 'liability'): void {
        this._type = newType;
    }

    changeIban(newIban: string | null): void {
        this.validateIban(newIban);
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

    setPaymentDueDay(newDay: number | null): void {
        this.validatePaymentDueDay(newDay);
        this._paymentDueDay = newDay;
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error('Account name cannot be empty');
        }
    }

    private validateIban(iban: string | null): void {
        if (iban === null) return;
        
        if (iban.length < 15 || iban.length > 34) {
            throw new Error('Invalid IBAN format');
        }
        
        if (!/^[A-Z]{2}[0-9A-Z]+$/.test(iban)) {
            throw new Error('Invalid IBAN format');
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

    private validatePaymentDueDay(day: number | null): void {
        if (day === null) return;
        
        if (day < 1 || day > 31) {
            throw new Error('Payment due day must be between 1 and 31');
        }
    }
}