import { DomainError } from '@domain/errors';

export class IBAN {
  private constructor(private readonly value: string) {}

  static create(value: string): IBAN {
    // Remove whitespace and convert to uppercase
    const cleaned = value.replace(/\s/g, '').toUpperCase();

    // Validate length (15-34 characters)
    if (cleaned.length < 15 || cleaned.length > 34) {
      throw new DomainError('Invalid IBAN length');
    }

    // Validate format: 2 letters (country code) + alphanumeric
    if (!/^[A-Z]{2}[0-9A-Z]+$/.test(cleaned)) {
      throw new DomainError('Invalid IBAN format');
    }

    return new IBAN(cleaned);
  }

  static createOptional(value: string | null): IBAN | null {
    return value ? IBAN.create(value) : null;
  }

  toString(): string {
    return this.value;
  }

  equals(other: IBAN): boolean {
    return this.value === other.value;
  }

  getCountryCode(): string {
    return this.value.substring(0, 2);
  }

  // Format with spaces (e.g., NL91 ABNA 0417 1643 00)
  format(): string {
    return this.value.match(/.{1,4}/g)?.join(' ') || this.value;
  }
}