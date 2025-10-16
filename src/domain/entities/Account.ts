export class Account {
    constructor(
        public readonly id: string,
        private _name: string,
        private _type: 'asset' | 'liability',
        private _iban: string | null,
        private _isSavings: boolean,
        private _overdraftLimit: number,
        private _creditLimit: number,
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

    get overdraftLimit(): number {
        return this._overdraftLimit;
    }

    get creditLimit(): number {
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

    setOverdraftLimit(newLimit: number): void {
        this.validateOverdraftLimit(newLimit);
        this._overdraftLimit = newLimit;
    }

    setCreditLimit(newLimit: number): void {
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
        if (iban === null) return; // null is toegestaan
        
        // Algemene IBAN validatie: 2 letters (landcode) + minimaal 13 tekens
        // IBAN is tussen 15-34 karakters lang
        if (iban.length < 15 || iban.length > 34) {
            throw new Error('Invalid IBAN format');
        }
        
        // Moet beginnen met 2 hoofdletters gevolgd door cijfers/letters
        if (!/^[A-Z]{2}[0-9A-Z]+$/.test(iban)) {
            throw new Error('Invalid IBAN format');
        }
    }

    private validateOverdraftLimit(limit: number): void {
        if (limit < 0) {
            throw new Error('Overdraft limit cannot be negative');
        }
    }

    private validateCreditLimit(limit: number): void {
        if (limit < 0) {
            throw new Error('Credit limit cannot be negative');
        }
    }

    private validatePaymentDueDay(day: number | null): void {
        if (day === null) return; // null is toegestaan
        
        if (day < 1 || day > 31) {
            throw new Error('Payment due day must be between 1 and 31');
        }
    }
}