export class Payee {
    constructor(
        public readonly id: string,
        private _name: string,
        private _iban: string | null,
    ) {
        this.validateName(_name);
        this.validateIban(_iban);
    }

    get name(): string {
        return this._name;
    }

    get iban(): string | null {
        return this._iban;
    }

    rename(newName: string): void {
        this.validateName(newName);
        this._name = newName;
    }

    changeIban(newIban: string | null): void {
        this.validateIban(newIban); // Allow null to remove IBAN
        this._iban = newIban;
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error('Payee name cannot be empty');
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
}