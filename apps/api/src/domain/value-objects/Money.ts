import { DomainError } from '@domain/errors';

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {}

  static fromAmount(amount: number, currency: string = 'EUR'): Money {
    if (!Number.isFinite(amount)) {
      throw new DomainError('Amount must be a finite number');
    }

    if (!currency || currency.length !== 3) {
      throw new DomainError('Currency must be a 3-letter ISO 4217 code');
    }

    return new Money(amount, currency.toUpperCase());
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    if (!Number.isFinite(factor)) {
      throw new DomainError('Factor must be a finite number');
    }
    return new Money(this.amount * factor, this.currency);
  }

  divide(divisor: number): Money {
    if (!Number.isFinite(divisor) || divisor === 0) {
      throw new DomainError('Divisor must be a non-zero finite number');
    }
    return new Money(this.amount / divisor, this.currency);
  }

  negate(): Money {
    return new Money(-this.amount, this.currency);
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  isNegative(): boolean {
    return this.amount < 0;
  }

  isZero(): boolean {
    return Math.abs(this.amount) < 0.01; // Floating point tolerance (1 cent)
  }

  equals(other: Money): boolean {
    return Math.abs(this.amount - other.amount) < 0.01 && 
           this.currency === other.currency;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new DomainError(
        `Cannot operate on different currencies: ${this.currency} and ${other.currency}`
      );
    }
  }
}