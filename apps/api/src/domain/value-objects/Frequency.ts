export type FrequencyType = 'monthly' | 'weekly' | 'yearly';

export class Frequency {
  private constructor(private readonly type: FrequencyType) {}

  static create(type: FrequencyType): Frequency {
    if (!['monthly', 'weekly', 'yearly'].includes(type)) {
      throw new Error('Frequency must be monthly, weekly, or yearly');
    }
    return new Frequency(type);
  }

  static monthly(): Frequency {
    return new Frequency('monthly');
  }

  static weekly(): Frequency {
    return new Frequency('weekly');
  }

  static yearly(): Frequency {
    return new Frequency('yearly');
  }

  getType(): FrequencyType {
    return this.type;
  }

  /**
   * Berekent de eerstvolgende occurrence vanaf een gegeven datum
   */
  getNextOccurrence(fromDate: Date): Date {
    const result = new Date(fromDate);
    result.setHours(0, 0, 0, 0);

    switch (this.type) {
      case 'weekly':
        result.setDate(result.getDate() + 7);
        break;

      case 'monthly':
        result.setMonth(result.getMonth() + 1);
        break;

      case 'yearly':
        result.setFullYear(result.getFullYear() + 1);
        break;
    }

    return result;
  }

  /**
   * Berekent alle occurrences tussen twee datums
   */
  getOccurrencesBetween(startDate: Date, endDate: Date): Date[] {
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    const occurrences: Date[] = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      occurrences.push(new Date(current));
      current = this.getNextOccurrence(current);
    }

    return occurrences;
  }

  equals(other: Frequency): boolean {
    return this.type === other.type;
  }

  toString(): string {
    return this.type;
  }
}