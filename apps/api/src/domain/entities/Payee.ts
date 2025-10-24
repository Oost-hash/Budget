import { IBAN } from '@domain/value-objects/IBAN';

export class Payee {
    constructor(
        public readonly id: string,
        private _name: string,
        private _iban: IBAN | null,
    ) {
        this.validateName(_name);
    }

    get name(): string {
        return this._name;
    }

    get iban(): IBAN | null {
        return this._iban;
    }

    rename(newName: string): void {
        this.validateName(newName);
        this._name = newName;
    }

    changeIban(newIban: IBAN | null): void {
        this._iban = newIban;
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error('Payee name cannot be empty');
        }
    }
}