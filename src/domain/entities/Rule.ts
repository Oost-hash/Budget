import { Money } from '@domain/value-objects/Money';
import { Frequency } from '@domain/value-objects/Frequency';

export class Rule {
  constructor(
    public readonly id: string,
    public readonly payeeId: string,
    private _categoryId: string | null,
    private _amount: Money | null,
    private _descriptionTemplate: string | null,
    private _isRecurring: boolean,
    private _frequency: Frequency | null,
    private _isActive: boolean,
  ) {
    this.validatePayeeId(payeeId);
    this.validateRecurringFrequency(_isRecurring, _frequency);
  }

  get categoryId(): string | null {
    return this._categoryId;
  }

  get amount(): Money | null {
    return this._amount;
  }

  get descriptionTemplate(): string | null {
    return this._descriptionTemplate;
  }

  get isRecurring(): boolean {
    return this._isRecurring;
  }

  get frequency(): Frequency | null {
    return this._frequency;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  setCategory(categoryId: string): void {
    this._categoryId = categoryId;
  }

  clearCategory(): void {
    this._categoryId = null;
  }

  setAmount(amount: Money | null): void {
    this._amount = amount;
  }

  setDescriptionTemplate(template: string | null): void {
    this._descriptionTemplate = template;
  }

  setRecurring(isRecurring: boolean, frequency: Frequency | null): void {
    this.validateRecurringFrequency(isRecurring, frequency);
    this._isRecurring = isRecurring;
    this._frequency = frequency;
  }

  activate(): void {
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  private validatePayeeId(payeeId: string): void {
    if (!payeeId || payeeId.trim().length === 0) {
      throw new Error('Payee ID cannot be empty');
    }
  }

  private validateRecurringFrequency(
    isRecurring: boolean,
    frequency: Frequency | null
  ): void {
    if (!isRecurring && frequency !== null) {
      throw new Error('Frequency can only be set when isRecurring is true');
    }

    if (isRecurring && frequency === null) {
      throw new Error('Frequency is required when isRecurring is true');
    }
  }
}