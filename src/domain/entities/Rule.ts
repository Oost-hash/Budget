type Frequency = 'monthly' | 'weekly' | 'yearly';

export class Rule {
  constructor(
    public readonly id: string,
    public readonly payeeId: string,
    private _categoryId: string | null,
    private _amount: number | null,
    private _descriptionTemplate: string | null,
    private _isRecurring: boolean,
    private _frequency: Frequency | null,
    private _isActive: boolean,
    public readonly createdAt: Date,
    private _updatedAt: Date
  ) {
    this.validatePayeeId(payeeId);
    this.validateRecurringFrequency(_isRecurring, _frequency);
  }

  get categoryId(): string | null {
    return this._categoryId;
  }

  get amount(): number | null {
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

  get updatedAt(): Date {
    return this._updatedAt;
  }

  setCategory(categoryId: string): void {
    this._categoryId = categoryId;
    this._updatedAt = new Date();
  }

  clearCategory(): void {
    this._categoryId = null;
    this._updatedAt = new Date();
  }

  setAmount(amount: number | null): void {
    this._amount = amount;
    this._updatedAt = new Date();
  }

  setDescriptionTemplate(template: string | null): void {
    this._descriptionTemplate = template;
    this._updatedAt = new Date();
  }

  setRecurring(isRecurring: boolean, frequency: Frequency | null): void {
    this.validateRecurringFrequency(isRecurring, frequency);
    this._isRecurring = isRecurring;
    this._frequency = frequency;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
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

    if (frequency !== null && !['monthly', 'weekly', 'yearly'].includes(frequency)) {
      throw new Error('Frequency must be monthly, weekly, or yearly');
    }
  }
}